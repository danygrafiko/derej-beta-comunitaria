/* Dérej · Escena tridimensional WebGL local. Sin dependencias ni peticiones externas. */
(()=>{
 'use strict';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const point=s=>[(s.x-50)*.046,(51-s.y)*.075,s.x===50?.45:s.x<50?-.45:.05];
 function rotate(p,yaw,pitch){const [x,y,z]=p,c=Math.cos(yaw),s=Math.sin(yaw),a=x*c+z*s,b=z*c-x*s;return [a,y*Math.cos(pitch)-b*Math.sin(pitch),y*Math.sin(pitch)+b*Math.cos(pitch)];}
 function project(p,width,height,yaw,pitch,zoom=1){
  const q=rotate(p,yaw,pitch);q[0]*=clamp(width/height/.65,1,1.5);const aspect=width/height,f=Math.min(2.7,aspect*5.7)*zoom,depth=12-q[2];
  return {x:width*(.5+q[0]*f/depth/aspect*.5),y:height*(.47-q[1]*f/depth*.5),z:q[2],scale:f/depth*height*.5,world:q,f};
 }
 function mount({stage,nodes,edges,selected,onViewChange=()=>{}}){
  const canvas=stage.querySelector('canvas'),host=stage.closest('.avMap'),screen=stage.closest('[data-screen]');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)'),state={yaw:-.16,pitch:.04,zoom:1,still:reduced.matches,flat:false,selected};
  let gl=null,soft=null,softCanvas=null,disposed=false,raf=0,lastFrame=0,visible=true,drag=null,dragged=false,resources=[],programs=[],shaders=[],sphere,lines,halo,geometry;
  const labels=nodes.map(s=>({node:s,p:point(s),el:stage.querySelector('[data-av-node="'+s.id+'"]')}));
  const byId=Object.fromEntries(labels.map(s=>[s.node.id,s]));
  const paths=edges.map(([a,b],index)=>{const start=byId[a].p,end=byId[b].p,points=[];for(let i=0;i<=24;i++){const t=i/24;points.push(start.map((v,k)=>v+(end[k]-v)*t+(k===2?Math.sin(t*Math.PI)*(.28+index%3*.10):0)));}return {a,b,points};});
  const dust=Array.from({length:52},(_,i)=>[Math.sin(i*7.2)*2.6,Math.cos(i*2.7)*3.8,-1.1-Math.abs(Math.sin(i*3.4))*1.5]);
  const abort=new AbortController(),listen=(el,type,fn,options={})=>el.addEventListener(type,fn,{...options,signal:abort.signal});
  function say(message){const el=host.querySelector('.avSceneStatus');if(el)el.textContent=message;}
  function syncControls(){
   host.querySelector('[data-av-scene="flat"]')?.setAttribute('aria-pressed',String(state.flat));
   const still=host.querySelector('[data-av-scene="still"]');if(still){still.setAttribute('aria-pressed',String(state.still));still.textContent=state.still?'Activar movimiento':'Quietud';}
   host.querySelectorAll('[data-av-scene="closer"],[data-av-scene="farther"],[data-av-scene="left"],[data-av-scene="right"]').forEach(b=>b.disabled=state.flat||!(gl||soft));
   const flat=host.querySelector('[data-av-scene="flat"]');if(flat)flat.disabled=!(gl||soft);
  }
  function clearResources(){if(!gl)return;resources.forEach(b=>gl.deleteBuffer(b));programs.forEach(p=>gl.deleteProgram(p));shaders.forEach(s=>gl.deleteShader(s));resources=[];programs=[];shaders=[];}
  function compile(type,source){const s=gl.createShader(type);shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s)||'Shader unavailable');return s;}
  function program(v,f){const p=gl.createProgram();programs.push(p);gl.attachShader(p,compile(gl.VERTEX_SHADER,v));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p)||'Program unavailable');return p;}
  function buffer(data,usage){const b=gl.createBuffer();resources.push(b);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),usage||gl.STATIC_DRAW);return b;}
  const vertex=`attribute vec3 aPosition;uniform float uF;uniform float uAspect;uniform vec3 uCenter;uniform float uRadius;varying vec3 vNormal;void main(){vNormal=aPosition;vec3 p=aPosition*uRadius+uCenter;float depth=12.0-p.z;gl_Position=vec4(p.x*uF/uAspect,p.y*uF+depth*.06,depth-1.0,depth);}`;
  function init(){
   try{
    gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:false});if(!gl)throw Error('No WebGL');
    sphere=program(vertex,`precision mediump float;varying vec3 vNormal;uniform vec3 uColor;uniform float uActive;void main(){vec3 n=normalize(vNormal);float light=max(dot(n,normalize(vec3(-.55,.8,1.0))),0.0);float rim=pow(1.0-max(n.z,0.0),2.8);float shine=pow(max(dot(reflect(-normalize(vec3(-.55,.8,1.0)),n),vec3(0.,0.,1.)),0.0),28.);vec3 c=uColor*(.20+light*.72)+vec3(.84,.96,1.)*rim*.48+vec3(1.,.94,.72)*shine*.7;c+=uColor*uActive*.12;gl_FragColor=vec4(c,1.);}`);
    lines=program(`attribute vec3 aPosition;uniform float uF;uniform float uAspect;void main(){float d=12.-aPosition.z;gl_Position=vec4(aPosition.x*uF/uAspect,aPosition.y*uF+d*.06,d-1.,d);}`,`precision mediump float;uniform vec4 uColor;void main(){gl_FragColor=uColor;}`);
    halo=program(`attribute vec3 aPosition;uniform float uF;uniform float uAspect;uniform float uSize;uniform float uHeight;void main(){float d=12.-aPosition.z;gl_Position=vec4(aPosition.x*uF/uAspect,aPosition.y*uF+d*.06,d-1.,d);gl_PointSize=uSize*uF/d*uHeight*.5;}`,`precision mediump float;uniform vec4 uColor;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;float a=pow(1.-r,2.2);gl_FragColor=vec4(uColor.rgb,uColor.a*a);}`);
    const vertices=[],v=(t,p)=>[Math.sin(t)*Math.cos(p),Math.cos(t),Math.sin(t)*Math.sin(p)];
    for(let y=0;y<16;y++)for(let x=0;x<24;x++){const a=y/16*Math.PI,b=(y+1)/16*Math.PI,c=x/24*Math.PI*2,d=(x+1)/24*Math.PI*2;vertices.push(...v(a,c),...v(b,c),...v(a,d),...v(a,d),...v(b,c),...v(b,d));}
    geometry={buffer:buffer(vertices),count:vertices.length/3};stage.classList.add('has3d');stage.dataset.renderer='webgl';syncControls();draw(0);wake();
   }catch(error){stage.dataset.sceneError=error.message;clearResources();gl=null;initSoft();}
  }
  function initSoft(){
   if(typeof window.CanvasRenderingContext2D==='undefined'){fallback('Explora el árbol en vista plana.');return;}
   try{softCanvas=document.createElement('canvas');softCanvas.className='avSoftCanvas';softCanvas.setAttribute('aria-hidden','true');stage.appendChild(softCanvas);soft=softCanvas.getContext('2d',{alpha:true});if(!soft)throw Error('No canvas');stage.classList.add('has3d');stage.dataset.renderer='canvas3d';syncControls();wake();}catch{soft=null;softCanvas?.remove();fallback('Explora el árbol en vista plana.');}
  }
  function drawSoft(time){
   const rect=stage.getBoundingClientRect(),w=rect.width,h=rect.height;if(w<10||h<10)return;
   const dpr=Math.min(window.devicePixelRatio||1,1.5),ctx=soft;
   if(softCanvas.width!==Math.round(w*dpr)||softCanvas.height!==Math.round(h*dpr)){softCanvas.width=Math.round(w*dpr);softCanvas.height=Math.round(h*dpr);}
   ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
   const proj=p=>project(p,w,h,state.yaw,state.pitch,state.zoom);
   const trace=points=>{ctx.beginPath();points.forEach((p,i)=>{const q=proj(p);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});};
   ctx.lineWidth=1.25;ctx.shadowBlur=10;
   for(const path of paths){const active=[path.a,path.b].includes(state.selected);ctx.strokeStyle=active?'rgba(255,226,153,.95)':'rgba(163,218,222,.55)';ctx.shadowColor=active?'#e2ba65':'#6ce3e7';trace(path.points);ctx.stroke();}
   ctx.shadowBlur=0;ctx.lineWidth=1;ctx.strokeStyle='rgba(201,171,105,.25)';
   for(let j=0;j<3;j++){const points=[];for(let i=0;i<=96;i++){const a=i/96*Math.PI*2;points.push([Math.cos(a)*(1.8+j*.28),-3.85+j*.015,Math.sin(a)*(1.8+j*.28)-.3]);}trace(points);ctx.stroke();}
   for(const pos of dust){const q=proj(pos);ctx.fillStyle='rgba(194,225,237,.50)';ctx.beginPath();ctx.arc(q.x,q.y,.8,0,Math.PI*2);ctx.fill();}
   for(let i=0;i<paths.length;i++){const path=paths[i],t=(state.still?i*.19:(time/16000+i*.17))%1,part=t*24,j=Math.floor(part),k=Math.min(j+1,24),q=proj(path.points[j].map((v,a)=>v+(path.points[k][a]-v)*(part-j)));ctx.shadowBlur=8;ctx.shadowColor='#fff0a8';ctx.fillStyle='#fff0bf';ctx.beginPath();ctx.arc(q.x,q.y,1.8,0,Math.PI*2);ctx.fill();}
   const sorted=labels.map(l=>({l,q:proj(l.p)})).sort((a,b)=>a.q.z-b.q.z);
   for(const {l,q}of sorted){const active=l.node.id===state.selected,r=(active?.29:.25)*q.scale;
    l.el.style.left=clamp(q.x,54,w-54)+'px';l.el.style.top=q.y+'px';l.el.style.setProperty('--av-depth',String(1+q.z*.015));
    const glow=ctx.createRadialGradient(q.x,q.y,r*.4,q.x,q.y,r*3.3);glow.addColorStop(0,active?'rgba(255,209,103,.40)':'rgba(73,195,186,.24)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.shadowBlur=0;ctx.fillStyle=glow;ctx.beginPath();ctx.arc(q.x,q.y,r*3.3,0,Math.PI*2);ctx.fill();
    const g=ctx.createRadialGradient(q.x-r*.35,q.y-r*.45,r*.03,q.x,q.y,r);g.addColorStop(0,active?'#fff9e3':'#e3fff8');g.addColorStop(.28,active?'#ffe3a0':'#81d8cb');g.addColorStop(.68,active?'#c39749':'#33848a');g.addColorStop(1,active?'#79581e':'#123e50');ctx.fillStyle=g;ctx.beginPath();ctx.arc(q.x,q.y,r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=active?'#ffe8ac':'#99e3d5';ctx.lineWidth=active?1.5:.7;ctx.beginPath();ctx.arc(q.x,q.y,r+.5,0,Math.PI*2);ctx.stroke();
   }
  }
  function fallback(message){stage.classList.remove('has3d');stage.classList.add('avFlat');labels.forEach(({el,node})=>{el.style.left=node.x+'%';el.style.top=(node.y*.85+1)+'%';el.style.removeProperty('--av-depth');});cancelAnimationFrame(raf);raf=0;syncControls();say(message);}
  function activate(p){gl.useProgram(p);return {uniform:(n,v)=>{const l=gl.getUniformLocation(p,n);if(Array.isArray(v))v.length===4?gl.uniform4fv(l,v):gl.uniform3fv(l,v);else gl.uniform1f(l,v);},positions:(b)=>{gl.bindBuffer(gl.ARRAY_BUFFER,b);const loc=gl.getAttribLocation(p,'aPosition');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);}};}
  const dynamic=()=>{const b=gl.createBuffer();resources.push(b);return b;};let dynamicBuffer=null;
  function draw(time){
   if(disposed||!(gl||soft)||state.flat||!stage.isConnected)return;
   if(soft){drawSoft(time);return;}
   const rect=stage.getBoundingClientRect();if(rect.width<10||rect.height<10)return;
   const width=rect.width,height=rect.height,dpr=Math.min(window.devicePixelRatio||1,1.75),pixelW=Math.round(width*dpr),pixelH=Math.round(height*dpr);
   if(canvas.width!==pixelW||canvas.height!==pixelH){canvas.width=pixelW;canvas.height=pixelH;}
   gl.viewport(0,0,pixelW,pixelH);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   const f=Math.min(2.7,width/height*5.7)*state.zoom,aspect=width/height,transform=p=>{const q=rotate(p,state.yaw,state.pitch);q[0]*=clamp(aspect/.65,1,1.5);return q;};
   if(!dynamicBuffer)dynamicBuffer=dynamic();
   function upload(points){gl.bindBuffer(gl.ARRAY_BUFFER,dynamicBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points.flat()),gl.DYNAMIC_DRAW);}
   gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
   let p=activate(lines);p.uniform('uF',f);p.uniform('uAspect',aspect);
   for(const path of paths){upload(path.points.map(transform));p.positions(dynamicBuffer);p.uniform('uColor',[.72,.87,.89,[path.a,path.b].includes(state.selected)?.85:.34]);gl.drawArrays(gl.LINE_STRIP,0,path.points.length);}
   const rings=[];for(let ring=0;ring<3;ring++){const points=[];for(let i=0;i<=96;i++){const a=i/96*Math.PI*2;points.push(transform([Math.cos(a)*(1.8+ring*.28),-3.85+ring*.015,Math.sin(a)*(1.8+ring*.28)-.3]));}rings.push(points);}
   p.uniform('uColor',[.85,.76,.46,.20]);for(const points of rings){upload(points);p.positions(dynamicBuffer);gl.drawArrays(gl.LINE_STRIP,0,points.length);}
   p=activate(halo);p.uniform('uF',f);p.uniform('uAspect',aspect);p.uniform('uHeight',pixelH);p.positions(dynamicBuffer);
   p.uniform('uSize',.07);p.uniform('uColor',[.78,.91,1,.7]);upload(dust.map(transform));gl.drawArrays(gl.POINTS,0,dust.length);
   const moving=paths.map((path,i)=>{const t=(state.still?i*.19:(time/16000+i*.17))%1,part=t*24,j=Math.floor(part),k=Math.min(j+1,24);return transform(path.points[j].map((n,a)=>n+(path.points[k][a]-n)*(part-j)));});
   upload(moving);p.uniform('uSize',.11);p.uniform('uColor',[1,.91,.59,.95]);gl.drawArrays(gl.POINTS,0,moving.length);
   for(const l of labels){const q=project(l.p,width,height,state.yaw,state.pitch,state.zoom),active=l.node.id===state.selected;
    l.el.style.left=clamp(q.x,54,width-54)+'px';l.el.style.top=q.y+'px';l.el.style.setProperty('--av-depth',String(1+q.z*.015));
    upload([q.world]);p.uniform('uSize',active?1.55:1.05);p.uniform('uColor',active?[1,.82,.35,.6]:[.28,.78,.72,.28]);gl.drawArrays(gl.POINTS,0,1);
   }
   gl.disable(gl.BLEND);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
   p=activate(sphere);p.uniform('uF',f);p.uniform('uAspect',aspect);p.positions(geometry.buffer);
   for(const l of labels){const active=l.node.id===state.selected;p.uniform('uCenter',transform(l.p));p.uniform('uRadius',active?.29:.25);p.uniform('uColor',active?[1,.79,.32]:[.28,.77,.72]);p.uniform('uActive',active?1:0);gl.drawArrays(gl.TRIANGLES,0,geometry.count);}
  }
  function running(){return !disposed&&(gl||soft)&&!state.flat&&!state.still&&visible&&!document.hidden&&!screen?.hidden;}
  function frame(time){raf=0;if(!running())return;if(time-lastFrame>=32){draw(time);lastFrame=time;}raf=requestAnimationFrame(frame);}
  function wake(){if(disposed)return;cancelAnimationFrame(raf);raf=0;if((gl||soft)&&!state.flat)draw(performance.now());if(running())raf=requestAnimationFrame(frame);}
  function setFlat(flat){state.flat=flat;stage.classList.toggle('avFlat',flat);if(flat)fallback('Vista plana. Los nombres y la selección siguen disponibles.');else{stage.classList.add('has3d');stage.classList.remove('avFlat');wake();say('Escena 3D. Arrastra de lado a lado para explorar.');}syncControls();onViewChange(flat);}
  listen(host,'click',event=>{
   const key=event.target.closest('[data-av-scene]')?.dataset.avScene;if(!key)return;
   if(key==='flat'){setFlat(!state.flat);return;}
   if(key==='still'){state.still=!state.still;syncControls();wake();say(state.still?'Quietud activada. Puedes mover el árbol cuando lo desees.':'Movimiento suave activado.');return;}
   if(key==='reset'){state.yaw=-.16;state.pitch=.04;state.zoom=1;}
   if(key==='closer')state.zoom=clamp(state.zoom+.04,.92,1.10);
   if(key==='farther')state.zoom=clamp(state.zoom-.04,.92,1.10);
   if(key==='left')state.yaw=clamp(state.yaw-.12,-.5,.5);
   if(key==='right')state.yaw=clamp(state.yaw+.12,-.5,.5);
   wake();
  });
  listen(stage,'pointerdown',event=>{if(!(gl||soft)||state.flat||event.button!==0||event.isPrimary===false)return;drag={id:event.pointerId,x:event.clientX,y:event.clientY,yaw:state.yaw,pitch:state.pitch};dragged=false;});
  listen(stage,'pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(Math.abs(dx)<7&&Math.abs(dy)<7&&!dragged)return;if(event.pointerType==='touch'&&Math.abs(dy)>Math.abs(dx)&&!dragged){drag=null;return;}dragged=true;try{stage.setPointerCapture(event.pointerId);}catch{}state.yaw=clamp(drag.yaw+dx*.004,-.5,.5);state.pitch=clamp(drag.pitch+(event.pointerType==='touch'?0:dy*.002),-.1,.1);wake();});
  const end=event=>{if(drag&&event.pointerId===drag.id){drag=null;try{stage.releasePointerCapture(event.pointerId);}catch{}}};
  listen(stage,'pointerup',end);listen(stage,'pointercancel',event=>{end(event);dragged=false;});listen(stage,'lostpointercapture',()=>{drag=null;});
  listen(stage,'click',event=>{if(dragged){event.preventDefault();event.stopPropagation();dragged=false;}},{capture:true});
  listen(stage,'keydown',event=>{if(event.target!==stage||state.flat||!(gl||soft))return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key)){event.preventDefault();if(event.key==='Home'){state.yaw=-.16;state.pitch=.04;state.zoom=1;}else if(event.key==='ArrowLeft'||event.key==='ArrowRight')state.yaw=clamp(state.yaw+(event.key==='ArrowRight'?.1:-.1),-.5,.5);else state.pitch=clamp(state.pitch+(event.key==='ArrowDown'?.03:-.03),-.1,.1);wake();}});
  listen(canvas,'webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(raf);raf=0;gl=null;resources=[];programs=[];shaders=[];dynamicBuffer=null;initSoft();});
  listen(canvas,'webglcontextrestored',()=>{soft=null;softCanvas?.remove();softCanvas=null;clearResources();dynamicBuffer=null;init();if(state.flat)fallback('Vista plana activa.');});
  listen(document,'visibilitychange',wake);listen(window,'resize',wake,{passive:true});
  const motion=()=>{if(reduced.matches){state.still=true;syncControls();wake();}};reduced.addEventListener?.('change',motion);
  const resize=typeof ResizeObserver==='function'?new ResizeObserver(wake):null;resize?.observe(stage);
  const intersection=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting!==false;wake();},{rootMargin:'50px'}):null;intersection?.observe(stage);
  const visibility=screen?new MutationObserver(wake):null;visibility?.observe(screen,{attributes:true,attributeFilter:['hidden']});
  if(typeof window.WebGLRenderingContext!=='undefined')init();else initSoft();
  return {select(id){state.selected=id;wake();},quiet(){state.still=true;syncControls();wake();},destroy(){disposed=true;cancelAnimationFrame(raf);abort.abort();resize?.disconnect();intersection?.disconnect();visibility?.disconnect();reduced.removeEventListener?.('change',motion);clearResources();soft=null;softCanvas?.remove();gl?.getExtension('WEBGL_lose_context')?.loseContext();gl=null;},view(){return {...state};}};
 }
 window.DEREJ_ARBOL_SCENE={mount,project,point};
})();

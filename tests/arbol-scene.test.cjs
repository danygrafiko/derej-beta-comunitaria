/* Rendering lifecycle, interaction and projection across phone/desktop sizes. */
const {JSDOM}=require('jsdom'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const dir=path.join(__dirname,'..');
(async()=>{
 const dom=new JSDOM('<section data-screen="arbol"><div class="avMap"><button data-av-scene="flat"></button><button data-av-scene="still"></button><button data-av-scene="closer"></button><button data-av-scene="reset"></button><div class="avScene"><canvas></canvas></div><div class="avSceneStatus"></div></div></section>',{runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document,stage=d.querySelector('.avScene'),screen=d.querySelector('section');let motionChange,draws=0,seq=0;const pending=new Map();
 w.matchMedia=()=>({matches:false,addEventListener(type,fn){motionChange=fn;},removeEventListener(){}});
 w.requestAnimationFrame=fn=>{pending.set(++seq,fn);return seq;};w.cancelAnimationFrame=id=>pending.delete(id);
 w.CanvasRenderingContext2D=function(){};
 const ctx={setTransform(){draws++;},clearRect(){},beginPath(){},moveTo(x,y){assert(Number.isFinite(x)&&Number.isFinite(y));},lineTo(x,y){assert(Number.isFinite(x)&&Number.isFinite(y));},arc(x,y,r){assert(Number.isFinite(x)&&Number.isFinite(y)&&r>=0);},fill(){},stroke(){},createRadialGradient(){return {addColorStop(){}};}};
 w.HTMLCanvasElement.prototype.getContext=type=>type==='2d'?ctx:null;
 stage.getBoundingClientRect=()=>({width:349,height:740,left:0,top:0});
 for(const file of ['arbol-content.js','arbol-scene.js'])w.eval(fs.readFileSync(path.join(dir,file),'utf8'));
 const nodes=w.DEREJ_ARBOL.sefirot;
 nodes.forEach(s=>{const b=d.createElement('button');b.dataset.avNode=s.id;stage.appendChild(b);});
 const edges=[['keter','jojma'],['keter','bina'],['jesed','guevura'],['iesod','maljut']];
 const api=w.DEREJ_ARBOL_SCENE.mount({stage,nodes,edges,selected:'jesed'});
 assert.equal(stage.dataset.renderer,'canvas3d');assert(draws>0);assert.equal(stage.querySelectorAll('canvas').length,2);assert.equal(pending.size,1);
 const firstCanvas=stage.querySelector('.avSoftCanvas');api.select('bina');assert.equal(api.view().selected,'bina');assert.equal(stage.querySelector('.avSoftCanvas'),firstCanvas,'Selection must reuse the rendering context');
 api.quiet();assert.equal(pending.size,0);const yaw=api.view().yaw;
 const pointer=(type,props)=>{const e=new w.Event(type,{bubbles:true,cancelable:true});for(const[k,v]of Object.entries(props))Object.defineProperty(e,k,{value:v});stage.dispatchEvent(e);};
 pointer('pointerdown',{pointerId:1,button:0,isPrimary:true,clientX:100,clientY:100,pointerType:'touch'});pointer('pointermove',{pointerId:1,clientX:150,clientY:104,pointerType:'touch'});pointer('pointerup',{pointerId:1});assert(api.view().yaw>yaw);assert.equal(pending.size,0,'Manual orbit should work in Quietud without restarting ambient motion');
 let selectedClicks=0;stage.addEventListener('click',()=>selectedClicks++);stage.querySelector('[data-av-node="bina"]').click();assert.equal(selectedClicks,0,'Dragging must not select a sphere accidentally');stage.querySelector('[data-av-node="bina"]').click();assert.equal(selectedClicks,1);
 d.querySelector('[data-av-scene="flat"]').click();assert(api.view().flat);assert(!stage.classList.contains('has3d'));assert.equal(stage.querySelector('[data-av-node="bina"]').style.left,'21%');
 d.querySelector('[data-av-scene="flat"]').click();assert(!api.view().flat);assert(stage.classList.contains('has3d'));assert.equal(stage.querySelector('.avSoftCanvas'),firstCanvas);
 d.querySelector('[data-av-scene="still"]').click();assert.equal(pending.size,1);screen.hidden=true;await new Promise(r=>setTimeout(r,0));assert.equal(pending.size,0);screen.hidden=false;await new Promise(r=>setTimeout(r,0));assert.equal(pending.size,1);
 motionChange&&motionChange();
 for(const width of [279,294,349,390,816])for(const yaw of [-.5,-.16,.5])for(const pitch of [-.1,.04,.1])for(const zoom of [.92,1,1.1])for(const s of nodes){const q=w.DEREJ_ARBOL_SCENE.project(w.DEREJ_ARBOL_SCENE.point(s),width,740,yaw,pitch,zoom);assert(Number.isFinite(q.x)&&Number.isFinite(q.y));assert(q.y-21>=0&&q.y+65<=740,'Node must remain inside scene: '+s.id+' @ '+width);}
 api.destroy();assert.equal(pending.size,0);assert(!stage.querySelector('.avSoftCanvas'));dom.window.close();console.log('PASS scene: projected 3D at five viewport widths, Canvas fallback, orbit, drag/tap isolation, quiet/flat controls, context reuse, visibility and cleanup.');
})().catch(e=>{console.error(e);process.exit(1);});

const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const base=path.resolve(__dirname,'..');const KEY='derej.pozo.learning.v1';
class Local extends ResourceLoader{fetch(url){const u=new URL(url);if(u.host!=='derej.test')return null;const file=path.join(base,decodeURIComponent(u.pathname));return fs.existsSync(file)?Promise.resolve(fs.readFileSync(file)):null}}
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function boot(saved,ordered=false){const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>{if(e.type==='unhandled exception')errors.push(e.message)});const dom=new JSDOM(fs.readFileSync(path.join(base,'index.html'),'utf8'),{url:'https://derej.test/',runScripts:'dangerously',resources:new Local(),pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')};const viewport=new w.EventTarget();Object.assign(viewport,{scale:1,width:1024,height:768,offsetLeft:0,offsetTop:0});Object.defineProperty(w,'visualViewport',{value:viewport,configurable:true});if(ordered)w.Math.random=()=>.999999;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.fetch=async input=>{const u=new URL(String(input),'https://derej.test/');const p=path.join(base,u.pathname);return new Response(fs.existsSync(p)?fs.readFileSync(p):'{}',{status:fs.existsSync(p)?200:404,headers:{'Content-Type':'application/json'}})};w.HTMLMediaElement.prototype.load=()=>{};w.HTMLMediaElement.prototype.pause=()=>{};w.HTMLMediaElement.prototype.play=()=>Promise.resolve();w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});if(saved)w.localStorage.setItem(KEY,saved)}});await new Promise(resolve=>dom.window.addEventListener('load',resolve,{once:true}));await pause(100);return {dom,w:dom.window,d:dom.window.document,errors}}
const click=(d,selector)=>{const el=d.querySelector(selector);assert(el,`Missing ${selector}`);el.click()};
const state=w=>JSON.parse(w.localStorage.getItem(KEY));
(async()=>{
let {dom,w,d,errors}=await boot();assert(w.DEREJ_POZO);assert.equal(d.querySelectorAll('.portal').length,5);assert.equal(d.querySelector('.pozoHotspot').textContent.trim(),'');assert(!d.querySelector('.pozoHotspotLabel'));assert(d.querySelector('.pozoHotspot').getAttribute('aria-label'));const audio=d.querySelector('audio');
click(d,'.pozoHotspot');assert(!d.querySelector('[data-screen=pozo]').hidden);assert(d.querySelector('#pzMain').textContent.includes('Hay algo por descubrir'));
click(d,'[data-pz=discover]');assert(state(w).discovered);assert.equal(d.querySelector('.pozoHotspot').textContent.trim(),'');assert(d.querySelector('#pzMain').textContent.includes('Agua y luz'));
click(d,'[data-pz=letters]');assert.equal(d.querySelectorAll('#pozoRoot [role=tab]').length,7);click(d,'[data-pz="letter:6"]');assert(d.querySelector('#pzLetterPanel').textContent.includes('Mem final'));
click(d,'#pzLetterPanel [data-pz^="material:"]');assert(d.querySelector('#pzMain').textContent.includes('Las letras de Agua y luz'));assert.equal(d.querySelectorAll('#pozoRoot a[href]').length,0);click(d,'[data-pz=material-back]');assert(d.querySelector('#pzLetterPanel').textContent.includes('Mem final'));
click(d,'[data-pz-view=home]');click(d,'[data-pz-view=sources]');assert(d.querySelector('#pzMain').textContent.includes('Nuestro material, aquí mismo'));for(const ref of w.DEREJ_POZO_CONTENT.sources){click(d,'[data-pz="material:'+ref.id+'"]');assert(!d.querySelector('#pzMain').textContent.includes('undefined'));assert.equal(d.querySelectorAll('#pozoRoot a[href]').length,0);click(d,'[data-pz=material-back]')}
click(d,'[data-pz-view=words]');const toggle=d.querySelector('#pzNikud');toggle.checked=false;toggle.dispatchEvent(new w.Event('change',{bubbles:true}));assert.equal(d.querySelector('[data-word-he="0"]').textContent,'מים');
click(d,'[data-pz="activity:build"]');for(let word=0;word<2;word++){const target=w.DEREJ_POZO_CONTENT.words[word].bare;for(const glyph of [...target]){const tile=[...d.querySelectorAll('.pzTile')].find(e=>!e.disabled&&e.textContent===glyph);assert(tile);tile.click()}click(d,'[data-pz=build-check]');assert(d.querySelector('#pzFeedback').textContent.includes('La palabra ya está aquí'));click(d,'[data-pz=build-next]')}
assert(state(w).completed.build);click(d,'[data-pz=home]');click(d,'[data-pz="activity:look"]');for(let i=0;i<6;i++){const s=state(w),q=s.session.entries[s.session.index];const answers={'alef-name':'Álef','resh-name':'Resh','dalet-shape':'ד','yod-shape':'י','mem-final':'ם','mem-relation':'Son dos formas de mem'};const idx=q.options.indexOf(answers[q.id]);assert(idx>=0);click(d,'[data-pz="answer:'+idx+'"]');const attempts=state(w).records[q.id].attempts;click(d,'[data-pz="answer:'+idx+'"]');assert.equal(state(w).records[q.id].attempts,attempts);if(i===0){click(d,'#pzFeedback [data-pz^="material:"]');assert.equal(d.querySelectorAll('#pozoRoot a[href]').length,0);click(d,'[data-pz=material-back]');assert(d.querySelector('#pzFeedback'));assert.equal(state(w).records[q.id].attempts,attempts);click(d,'[data-pz=pause]');click(d,'[data-pz="activity:look"]');click(d,'[data-pz=resume]');assert(d.querySelector('#pzFeedback'))}click(d,'[data-pz=next]')}
assert(state(w).completed.look);assert.equal(state(w).sessions.length,2);
click(d,'[data-pz=home]');click(d,'[data-pz="activity:read"]');click(d,'[data-pz="read-answer:0"]');assert(d.querySelector('#pzFeedback').textContent.includes('Busca las letras'));click(d,'[data-pz="read-answer:3"]');click(d,'[data-pz=read-next]');click(d,'[data-pz="read-answer:5"]');assert(d.querySelector('#pzFeedback').textContent.includes('volvió'));click(d,'[data-pz=read-next]');assert(state(w).completed.read);
click(d,'[data-pz=home]');click(d,'[data-pz="activity:trace"]');assert(d.querySelector('#pzTrace'));
const svg=d.querySelector('#pzTrace');svg.getBoundingClientRect=()=>({left:0,top:0,width:360,height:270});let captured=null;svg.setPointerCapture=id=>captured=id;
const pointer=(type,x,y)=>{const e=new w.MouseEvent(type,{bubbles:true,cancelable:true,button:0,clientX:x,clientY:y});Object.defineProperty(e,'pointerId',{value:7});Object.defineProperty(e,'isPrimary',{value:true});svg.dispatchEvent(e);return e};
assert(pointer('pointerdown',100,100).defaultPrevented);assert.equal(captured,7);assert(pointer('pointermove',140,170).defaultPrevented);assert.equal(svg.querySelector('polyline').getAttribute('points'),'100,100 140,170');
const wheel=new w.Event('wheel',{bubbles:true,cancelable:true});svg.dispatchEvent(wheel);assert(wheel.defaultPrevented);pointer('pointerup',140,170);
const idleWheel=new w.Event('wheel',{bubbles:true,cancelable:true});svg.dispatchEvent(idleWheel);assert(!idleWheel.defaultPrevented);
const touch=(target,type,x,y)=>{const e=new w.Event(type,{bubbles:true,cancelable:true});Object.defineProperty(e,'touches',{value:[{clientX:x,clientY:y}]});target.dispatchEvent(e);return e};
assert(touch(svg,'touchstart',80,90).defaultPrevented);assert(touch(svg,'touchmove',120,130).defaultPrevented);touch(svg,'touchend',120,130);assert.equal(svg.querySelectorAll('polyline').length,2);assert.equal(svg.querySelectorAll('polyline')[1].getAttribute('points'),'80,90 120,130');
assert(!touch(d.querySelector('#pzMain h2'),'touchmove',10,10).defaultPrevented);assert(fs.readFileSync(path.join(base,'pozo-learning.css'),'utf8').includes('.pozoScreen .pzTraceBox,.pozoScreen .pzTraceBox *{touch-action:pinch-zoom'));

const tools=d.querySelector('#pzTraceTools');assert(tools);assert(d.querySelector('.pozoScreen.pzTracing'));
const inkBefore=svg.querySelector('#pzInk').innerHTML;
click(d,'[data-pz=trace-mode]');assert(d.querySelector('.pzTraceNavigate'));assert.equal(d.querySelector('#pzTraceMode').textContent,'Dibujar');
assert(!touch(svg,'touchstart',30,40).defaultPrevented);assert(!touch(svg,'touchmove',60,80).defaultPrevented);assert(!pointer('pointerdown',40,50).defaultPrevented);pointer('pointermove',100,120);pointer('pointerup',100,120);assert.equal(svg.querySelector('#pzInk').innerHTML,inkBefore);
click(d,'[data-pz=trace-mode]');assert(!d.querySelector('.pzTraceNavigate'));assert.equal(svg.querySelector('#pzInk').innerHTML,inkBefore);
pointer('pointerdown',200,200);const zoomWheel=new w.WheelEvent('wheel',{bubbles:true,cancelable:true,ctrlKey:true});svg.dispatchEvent(zoomWheel);assert(!zoomWheel.defaultPrevented);
const multiTouch=new w.Event('touchstart',{bubbles:true,cancelable:true});Object.defineProperty(multiTouch,'touches',{value:[{clientX:10,clientY:10},{clientX:30,clientY:30}]});svg.dispatchEvent(multiTouch);assert(!multiTouch.defaultPrevented);pointer('pointermove',250,250);assert.equal(svg.querySelectorAll('polyline')[2].getAttribute('points'),'200,200');
Object.assign(w.visualViewport,{scale:2,width:195,height:250,offsetLeft:120,offsetTop:200});w.visualViewport.dispatchEvent(new w.Event('resize'));
assert.equal(tools.style.left,'217.5px');assert(tools.style.transform.includes('scale(0.5)'));assert.equal(tools.style.top,'442px');
w.visualViewport.offsetTop=300;w.visualViewport.dispatchEvent(new w.Event('scroll'));assert.equal(tools.style.top,'542px');
Object.assign(w.visualViewport,{scale:1,width:1024,height:768,offsetLeft:0,offsetTop:0});w.visualViewport.dispatchEvent(new w.Event('resize'));
assert.equal(tools.style.left,'512px');assert(tools.style.transform.includes('scale(1)'));

click(d,'[data-pz=trace-finish]');assert(state(w).completed.trace);assert(!d.querySelector('#pzTraceTools'));assert(!d.querySelector('.pozoScreen.pzTracing'));
click(d,'[data-pz=home]');click(d,'[data-pz="activity:memory"]');click(d,'[data-pz="memory-level:0"]');click(d,'[data-pz=memory-play]');assert.equal(d.querySelectorAll('.pzMemoryCard').length,8);click(d,'[data-pz="flip:0"]');assert(d.querySelector('.pzMemoryCard.face'));click(d,'[data-pz=large]');assert(d.querySelector('.pozoScreen.pzLarge'));
click(d,'[data-pz-view=progress]');assert(d.querySelector('#pzMain').textContent.includes('prácticas completadas'));const saved=w.localStorage.getItem(KEY);
click(d,'.pzTop [data-route=home]');assert(!d.querySelector('[data-screen=home]').hidden);click(d,'.portalRadio');await pause(40);assert(!d.querySelector('[data-screen=radio]').hidden);assert.equal(d.querySelector('audio'),audio);assert(d.querySelector('[data-screen=radio]').textContent.includes('Radio'));
assert.deepEqual(errors,[]);dom.window.close();
({dom,w,d,errors}=await boot(saved));click(d,'.pozoHotspot');assert(!d.querySelector('[data-pz=discover]'));assert(state(w).completed.look);assert(d.querySelector('.pozoScreen.pzLarge'));assert.deepEqual(errors,[]);dom.window.close();
({dom,w,d,errors}=await boot(saved));click(d,'.pozoHotspot');
const completedBefore=JSON.stringify(state(w).completed),sessionsBefore=state(w).sessions.length;
click(d,'[data-pz=welcome]');assert.equal(d.querySelectorAll('.pzFirstSteps>li').length,4);assert(d.querySelector('#pzMain').textContent.includes('No necesitas saber hebreo'));assert(d.querySelector('[data-pz-view=welcome]').getAttribute('aria-current')==='page');
click(d,'[data-pz=welcome-letter]');assert(d.querySelector('#pzLetterPanel').textContent.includes('Mem'));assert.equal(d.querySelector('#pozoRoot [role=tab][aria-selected=true]').dataset.pz,'letter:3');
click(d,'[data-pz-view=welcome]');click(d,'[data-pz="trace:3"]');assert(d.querySelector('#pzTrace').getAttribute('aria-label').includes('Mem'));
click(d,'[data-pz-view=welcome]');click(d,'[data-pz="word:0"]');assert(d.querySelector('#pzMain').textContent.includes('Máyim'));
click(d,'[data-pz-view=welcome]');click(d,'[data-pz="read-word:0"]');click(d,'[data-pz="read-answer:3"]');assert(d.querySelector('#pzFeedback').textContent.includes('artículo definido'));click(d,'[data-pz=welcome]');
assert.equal(JSON.stringify(state(w).completed),completedBefore);assert.equal(state(w).sessions.length,sessionsBefore);assert.equal(d.querySelectorAll('#pozoRoot a[href]').length,0);assert.deepEqual(errors,[]);dom.window.close();

({dom,w,d,errors}=await boot(saved,true));click(d,'.pozoHotspot');click(d,'[data-pz="activity:memory"]');
assert.equal(d.querySelectorAll('[data-pz^="memory-level:"]').length,9); // eight cards plus suggested action
const alphabet=w.DEREJ_POZO_CONTENT.memoryAlphabet,levels=w.DEREJ_POZO_CONTENT.memoryLevels;
assert.equal(alphabet.length,27);assert.equal(new Set(alphabet.map(l=>l.glyph)).size,27);
assert.equal(alphabet.filter(l=>!l.base).map(l=>l.glyph).join(''),'אבגדהוזחטיכלמנסעפצקרשת');
assert.equal(alphabet.filter(l=>l.base).map(l=>l.glyph).join(''),'ךםןףץ');
assert.equal(new Set(levels.slice(0,6).flatMap(l=>Array.from(l.ids))).size,22);
assert.equal(levels.length,8);
const reviewSeen=[],initialSessions=state(w).sessions.length;
for(let level=0;level<8;level++){
 click(d,'[data-pz="memory-level:'+level+'"]');
 const rounds=level===7?7:1;
 for(let round=0;round<rounds;round++){
  const names=[...d.querySelectorAll('.pzMemoryStudy b')].map(el=>el.textContent),glyphs=[...d.querySelectorAll('.pzMemoryStudy .pzHeb')].map(el=>el.textContent);
  assert(names.length>=3&&names.length<=5);if(level===7)reviewSeen.push(...glyphs);
  assert(!d.querySelector('[data-pz=memory-finish]'));assert(!state(w).memory.completed.includes(level));
  click(d,'[data-pz=memory-play]');assert.equal(d.querySelectorAll('.pzMemoryCard').length,names.length*2);
  if(level===0){
   click(d,'[data-pz="flip:0"]');click(d,'[data-pz="flip:2"]');click(d,'[data-pz="flip:3"]');assert.equal(d.querySelectorAll('.pzMemoryCard.face').length,2);
   click(d,'[data-pz=memory-help]');assert.equal(d.querySelectorAll('.pzMemoryStudy b').length,4);await pause(1150);click(d,'[data-pz=memory-play]');assert.equal(d.querySelectorAll('.pzMemoryCard.face').length,0);
  }
  for(let pair=0;pair<names.length;pair++){
   click(d,'[data-pz="flip:'+(pair*2)+'"]');assert.equal(d.querySelector('[data-pz="flip:'+(pair*2)+'"]').getAttribute('aria-label'),'Letra '+names[pair]);
   click(d,'[data-pz="flip:'+(pair*2+1)+'"]');assert.equal(d.querySelectorAll('.pzMemoryCard.matched').length,(pair+1)*2);
  }
  if(round<rounds-1){assert(!d.querySelector('[data-pz=memory-finish]'));click(d,'[data-pz=memory-next-round]')}
  else {click(d,'[data-pz=memory-finish]');assert(state(w).memory.completed.includes(level));assert.equal(state(w).sessions.length,initialSessions+level+1);assert(!d.querySelector('[data-pz=memory-finish]'))}
 }
 click(d,'[data-pz=memory-levels]');
}
assert.equal(reviewSeen.length,27);assert.equal(new Set(reviewSeen).size,27);assert(alphabet.every(l=>reviewSeen.includes(l.glyph)));
assert.equal(state(w).memory.completed.length,8);assert.deepEqual(state(w).records,JSON.parse(saved).records);assert(state(w).completed.look);assert(d.querySelector('#pzMain').textContent.includes('8 de 8'));
const fullSave=w.localStorage.getItem(KEY);assert.deepEqual(errors,[]);dom.window.close();
({dom,w,d,errors}=await boot(fullSave));click(d,'.pozoHotspot');click(d,'[data-pz="activity:memory"]');assert(d.querySelector('#pzMain').textContent.includes('8 de 8'));assert.deepEqual(errors,[]);dom.window.close();
const damaged=JSON.parse(saved);damaged.memory={completed:[0,0,-1,99,"1",2],last:99};
({dom,w,d,errors}=await boot(JSON.stringify(damaged)));assert.deepEqual(Array.from(state(w).memory.completed),[0,2]);assert.equal(state(w).memory.last,0);assert.deepEqual(errors,[]);dom.window.close();
console.log('PASS · Trazado: navegación libre sin perder tinta, vuelta a dibujo, gestos de dos dedos y zoom sin cancelar, controles reposicionados con viewport ampliado y salida al terminar.');
console.log('PASS · Ocho niveles completados: 22 letras, cinco formas finales, aprendizaje previo, consulta sin intentos, bloqueo de clics durante un error, repaso de 27 formas sin omisiones, guardado por nivel, recarga, migración y validación de datos.');

console.log('PASS · Primer encuentro: cuatro pasos, mem seleccionada, trazo, máyim, reconocimiento en el pasaje, retorno a la guía y ningún avance completado ficticio.');
console.log('PASS · Patio original, descubrimiento persistente, 7 formas, vocalización, construcción RTL, seis preguntas, pausa, recarga, lectura con dos respuestas válidas, trazado, parejas, texto ampliado y regreso a Radio sin recrear audio.');
assert(!/https?:\/\//.test(fs.readFileSync(path.join(base,'pozo-content.js'),'utf8')));console.log('PASS · 12 fichas internas, retorno al ejercicio sin duplicar intentos, sin URLs externas en contenido ni enlaces de salida en el Pozo.');
})().catch(e=>{console.error(e);process.exit(1)});

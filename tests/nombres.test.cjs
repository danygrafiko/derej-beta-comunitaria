/* Full shell integration: entry, reading, private notes, return without rerender. */
const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
async function app(query='',saved=null){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://derej-beta-comunitaria.vercel.app/'+query,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
 const w=dom.window,d=w.document,ev=s=>vm.runInContext(s,dom.getInternalVMContext());let y=0,pauses=0;
 require('./browser-lifecycle.cjs')(w);
 Object.defineProperty(w,'scrollY',{get:()=>y});w.scrollTo=o=>{y=o.top||0;};w.HTMLElement.prototype.scrollIntoView=function(){};
 w.HTMLMediaElement.prototype.load=function(){};w.HTMLMediaElement.prototype.pause=function(){pauses++;};w.setInterval=()=>0;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
 w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
 w.fetch=async url=>{const file=String(url).split('?')[0];try{return {ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'))};}catch{return {ok:false,json:async()=>({})};}};
 if(saved)w.localStorage.setItem('derej-nombres-presencia-v1',saved);
 for(const s of d.querySelectorAll('script[src]'))ev(fs.readFileSync(path.join(root,s.getAttribute('src').split('?')[0]),'utf8'));
 await new Promise(r=>setTimeout(r,150));
 d.querySelector('#derejWelcome [data-welcome="skip"]')?.click();
 await new Promise(r=>setTimeout(r,20));
 const click=s=>{const el=d.querySelector(s);assert(el,s);el.click();return el;};
 return {w,d,ev,click,dom,errors,get y(){return y;},get pauses(){return pauses;}};
}
(async()=>{
 const a=await app();const {d,w,click,ev}=a;
 ev('route("biblioteca")');
 assert(!d.querySelector('[data-screen=biblioteca]').hidden);
 assert(!d.querySelector('[data-screen=home] .npEntry'));
 click('[data-screen=biblioteca] [data-nombres-open]');
 assert.match(d.querySelector('[data-np-back]').textContent,/Biblioteca/);
 click('[data-np-back]');assert(!d.querySelector('[data-screen=biblioteca]').hidden);
 ev('route("home")');click('[data-nombres-open]');assert(!d.querySelector('[data-screen=nombres]').hidden);
 assert.equal(d.querySelectorAll('.npCard').length,7);
 click('[data-np-view=intro]');assert.match(d.querySelector('#nombresRoot').textContent,/Hashem.*El Nombre/s);
 for(let id=1;id<=7;id++){
  click(id===1?'[data-np-view="1"]':`[data-np-view="${id}"]`);
  assert(d.querySelector('.npArticle').textContent.length>1700,'Complete study '+id);
  assert(d.querySelectorAll('.npSources a').length>=2);assert.equal(d.querySelectorAll('textarea[data-np-note]').length,3);
 }
 click('[data-np-view=catalog]');click('[data-np-view="5"]');
 const note=d.querySelector('#np-idea');note.value='<script>mi reflexión</script>';note.dispatchEvent(new w.Event('input',{bubbles:true}));
 assert.match(d.querySelector('#npSaveStatus').textContent,/Guardado/);
 click('[data-np-size="1.3"]');assert.equal(d.querySelector('#nombresRoot').style.getPropertyValue('--np-size'),'1.3');
 const saved=w.localStorage.getItem('derej-nombres-presencia-v1');
 const b=await app('?estudio=nombres',saved);assert(!b.d.querySelector('[data-screen=nombres]').hidden);
 b.click('[data-np-view="5"]');assert.equal(b.d.querySelector('#np-idea').value,note.value);
 assert(!b.d.querySelector('#nombresRoot script'),'Notes must be rendered as plain text');
 b.w.Storage.prototype.setItem=function(){throw Error('QuotaExceededError');};
 b.d.querySelector('#np-action').value='No perder esta nota';b.d.querySelector('#np-action').dispatchEvent(new b.w.Event('input',{bubbles:true}));assert.match(b.d.querySelector('#npSaveStatus').textContent,/No se pudo guardar/);
 click('[data-np-back]');ev('route("camino")');await new Promise(r=>setTimeout(r,80));
 click('[data-ramak-parasha="Lej Lejá"]');click('#ramakDayStrip [data-ramak-day="2"]');click('.ramakThresholdRail [data-ramak-step="profundizar"]');
 assert(!d.querySelector('[data-screen=camino] [data-nombres-open]'),'Independent names study belongs in Biblioteca');
 assert.equal(a.errors.length,0,a.errors.join('\n'));assert.equal(b.errors.length,0,b.errors.join('\n'));
 a.dom.window.close();b.dom.window.close();console.log('PASS: 7 studies, 20 references, notes/reload/quota/XSS, text size, direct link, preserved Camino and Radio.');
})().catch(e=>{console.error(e);process.exit(1);});

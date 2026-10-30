const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),pause=ms=>new Promise(r=>setTimeout(r,ms||75));
async function boot({url='https://derej.example/',saved={},blocked=false,failStudy=false,failRadio=false,studyDelay=0}={}){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc}),w=dom.window;
 require('./browser-lifecycle.cjs')(w);
 const DateBase=w.Date;w.Date=class extends DateBase{constructor(...args){super(...(args.length?args:['2026-10-29T12:00:00Z']));}static now(){return DateBase.parse('2026-10-29T12:00:00Z');}};
 let y=0,mediaLoads=0;
 Object.defineProperty(w,'scrollY',{get:()=>y});w.scrollTo=arg=>{y=arg?.top||0;};
 w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLElement.prototype.scrollTo=function(){};
 w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.setInterval=()=>0;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
 w.HTMLMediaElement.prototype.load=function(){mediaLoads++;};w.HTMLMediaElement.prototype.pause=function(){};
 for(const [k,v]of Object.entries({'derej-welcome-v1':'{"completed":true}','derej.metrics.enabled.v1':'false',...saved}))w.localStorage.setItem(k,v);
 if(blocked)Object.defineProperty(w,'localStorage',{get(){throw Error('blocked');}});
 w.fetch=async url=>{
  const source=String(url);
  if(source.includes('caminos-ramak')&&studyDelay)await pause(studyDelay);
  if(source.includes('caminos-ramak')&&failStudy)throw Error('offline');
  if(source.includes('radio-wurlitzer.json')&&failRadio)throw Error('offline');
  const file=path.join(root,source.split('?')[0]);
  if(fs.existsSync(file))return{ok:true,json:async()=>JSON.parse(fs.readFileSync(file,'utf8'))};
  return{ok:false,status:503,json:async()=>({}),arrayBuffer:async()=>new ArrayBuffer(0)};
 };
 const run=s=>vm.runInContext(s,dom.getInternalVMContext());
 for(const script of w.document.querySelectorAll('script[src]'))run(fs.readFileSync(path.join(root,script.getAttribute('src').split('?')[0]),'utf8'));
 await pause(180);
 return {w,run,errors,get mediaLoads(){return mediaLoads;},setStudyOffline:v=>failStudy=v,setRadioOffline:v=>failRadio=v,click:selector=>{const el=w.document.querySelector(selector);assert(el,selector);el.click();},screen:()=>w.document.querySelector('.screen.active:not([hidden])')?.dataset.screen,close:()=>w.close()};
}
(async()=>{
 let b=await boot();
 b.run('route("biblioteca")');b.click('.aeEntry a');await pause();
 assert.equal(b.screen(),'autoestima');assert.equal(new URLSearchParams(b.w.location.search).get('puerta'),'autoestima');
 assert.equal(b.w.document.getElementById('aeChapters').children.length,19);
 const loads=b.mediaLoads;
 for(const id of ['1','5','9','13','14','fuentes']){
  b.click('[data-ae-chapter="'+id+'"]');assert.equal(b.w.document.querySelector('#aeChapters [aria-current]').dataset.aeChapter,id);
  assert.equal(b.w.location.hash,'#autoestima-'+id);assert(b.w.document.querySelector('#aeArticle p'));
 }
 assert.equal(b.mediaLoads,loads,'No reiniciar Radio al cambiar capítulos');
 assert.equal(b.w.document.querySelectorAll('#aeArticle a[target="_blank"]').length,11);
 b.click('[data-ae-chapter="2"]');b.click('[data-ae-source="1"]');assert.equal(b.w.document.activeElement.id,'aeSource1');
 b.click('.aeBack');assert.equal(b.screen(),'biblioteca');assert.equal(b.w.location.hash,'');
 b.w.history.back();await pause();assert.equal(b.screen(),'autoestima');
 b.run('route("home")');assert.equal(b.screen(),'home');assert.equal(b.w.location.hash,'');assert.deepEqual(b.errors,[]);b.close();
 b=await boot({url:'https://derej.example/?puerta=autoestima#autoestima-14'});assert.equal(b.screen(),'autoestima');assert(b.w.document.getElementById('aeChapterTitle').textContent.includes('siete días'));b.close();
 b=await boot({url:'https://derej.example/?puerta=autoestima#autoestima-999',blocked:true});b.click('[data-welcome="skip"]');await pause();assert.equal(b.screen(),'autoestima');assert(b.w.document.getElementById('aeChapterTitle').textContent.includes('Propósito'));assert.deepEqual(b.errors,[]);b.close();
 b=await boot({url:'https://derej.example/?puerta=autoestima#autoestima-13',saved:{'derej-welcome-v1':'{"completed":false}'}});b.click('[data-welcome="skip"]');await pause();assert.equal(b.screen(),'autoestima');assert(b.w.document.getElementById('aeChapterTitle').textContent.includes('quince minutos'));assert.deepEqual(b.errors,[]);b.close();
 console.log('PASS autoestima: Biblioteca, 19 lecturas, fuentes, siete días, práctica, enlaces directos, historial, bienvenida, almacenamiento bloqueado y continuidad de Radio.');
})().catch(e=>{console.error(e);process.exit(1);});

const {JSDOM}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function boot({url='https://derej-beta-comunitaria.vercel.app/?metricas=prueba',disabled=false,gpc=false,hidden=false,storage={},tabStorage={}}={}){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url,runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,events=[],requests=[],observers=[];let visible=!hidden,wallOffset=0;const NativeDate=w.Date;
 w.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[NativeDate.now()+wallOffset]));}static now(){return NativeDate.now()+wallOffset;}};
 const Observer=w.MutationObserver;w.MutationObserver=class extends Observer{constructor(fn){super(fn);observers.push(this);}};
 Object.defineProperty(w.document,'visibilityState',{get:()=>visible?'visible':'hidden'});Object.defineProperty(w.navigator,'globalPrivacyControl',{value:gpc});
 w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.HTMLElement.prototype.scrollIntoView=function(){};w.scrollTo=()=>{};w.setInterval=()=>0;w.HTMLMediaElement.prototype.load=function(){};w.HTMLMediaElement.prototype.pause=function(){};
 for(const [k,v] of Object.entries(storage))w.localStorage.setItem(k,v);for(const [k,v] of Object.entries(tabStorage))w.sessionStorage.setItem(k,v);if(disabled)w.localStorage.setItem('derej.metrics.enabled.v1','false');
 w.fetch=async(url,options)=>{
  if(options?.method==='POST'){requests.push({url,options});events.push(...JSON.parse(options.body).events);return {ok:true,status:204};}
  return {ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,String(url).includes('caminos-ramak')?'content/caminos-ramak-v25.json':'radio.json'),'utf8'))};
 };
 const run=s=>vm.runInContext(s,dom.getInternalVMContext());
 for(const f of ['encuentros-v21.js','prelaunch-local.js','mobile-v234.js','navigation-v235.js','cleanup-v236.js','navigation-v241.js','analytics.js'])run(fs.readFileSync(path.join(root,f),'utf8'));
 await pause(30);
 const snapshot=area=>Object.fromEntries(Array.from({length:area.length},(_,i)=>{const k=area.key(i);return[k,area.getItem(k)];}));
 return {w,run,events,requests,count:type=>events.filter(e=>e.event_type===type).length,
  click:async selector=>{const el=w.document.querySelector(selector);assert(el,selector);el.click();await pause(25);},
  show:async()=>{run('route("camino")');await pause(160);},
  visibility:async value=>{visible=value;w.document.dispatchEvent(new w.Event('visibilitychange'));await pause(25);},
  jump:ms=>wallOffset+=ms,
  snapshot:()=>({storage:snapshot(w.localStorage),tabStorage:snapshot(w.sessionStorage)}),
  close:()=>{observers.forEach(o=>o.disconnect());dom.window.close();}};
}
(async()=>{
 let b=await boot();assert.equal(b.count('study_start'),0);await b.show();assert.equal(b.count('study_start'),1);assert.equal(b.count('study_complete'),0);
 for(const step of ['raiz','profundizar','practica','llevar'])await b.click(`.ramakThreshold[data-ramak-step=${step}]`);assert.equal(b.count('study_start'),1);assert.equal(b.count('study_complete'),0);
 const note=b.w.document.querySelector('#ramakNote');note.value='PRIVATE NOTE SENTINEL';note.dispatchEvent(new b.w.Event('input',{bubbles:true}));
 await b.click('[data-ramak-complete]');assert.equal(b.count('study_complete'),1);
 await b.click('[data-ramak-complete]');assert.equal(b.count('study_complete'),1);await b.click('[data-ramak-complete]');assert.equal(b.count('study_complete'),1);
 const saved=b.snapshot(),originalDay=b.run('selectedDay');
 await b.click(`#ramakDayStrip [data-ramak-day="${originalDay===1?2:1}"]`);assert.equal(b.count('study_start'),2);await b.click(`#ramakDayStrip [data-ramak-day="${originalDay}"]`);assert.equal(b.count('study_start'),2);
 const payload=JSON.stringify(b.events);assert(!payload.includes('PRIVATE NOTE SENTINEL'));assert(!payload.includes('Lej'));assert(!payload.includes('Bereshit'));assert(b.events.filter(e=>e.event_type.startsWith('study_')).every(e=>e.section==='camino'&&e.collection_id===null&&e.track_id===null&&e.seconds===null&&e.is_test));b.close();
 // Recargar la misma pestaña no duplica el inicio ya enviado en esta sesión.
 b=await boot(saved);await b.show();assert.equal(b.count('study_start'),0);assert.equal(b.count('study_complete'),0);b.close();
 // El botón de guardar una nota no equivale a declarar terminado un estudio.
 b=await boot();await b.show();await b.click('.ramakThreshold[data-ramak-step=llevar]');await b.click('#ramakSaveMemory');assert.equal(b.count('study_complete'),0);
 // Si el navegador no guarda el marcador, no se envía un final.
 const set=b.w.Storage.prototype.setItem;b.w.Storage.prototype.setItem=function(k,v){if(k==='derej-v23-camino-progress')throw Error('quota');return set.call(this,k,v);};await b.click('[data-ramak-complete]');assert.equal(b.count('study_complete'),0);b.w.Storage.prototype.setItem=set;
 b.jump(31*60*1000);b.w.document.dispatchEvent(new b.w.Event('pointerdown'));await pause(25);assert.equal(b.count('study_start'),2);b.close();
 // Oculto, exclusión voluntaria, GPC y previews.
 b=await boot({hidden:true});await b.show();assert.equal(b.count('study_start'),0);await b.visibility(true);assert.equal(b.count('study_start'),1);b.close();
 for(const config of [{disabled:true},{gpc:true},{url:'https://preview.vercel.app/'}]){b=await boot(config);await b.show();await b.click('.ramakThreshold[data-ramak-step=llevar]');await b.click('[data-ramak-complete]');assert.equal(b.requests.length,0);b.close();}
 b=await boot();await b.show();const toggle=b.w.document.querySelector('#metricsConsent');toggle.checked=false;toggle.dispatchEvent(new b.w.Event('change'));const count=b.events.length;await b.click('.ramakThreshold[data-ramak-step=llevar]');await b.click('[data-ramak-complete]');assert.equal(b.events.length,count);assert.equal(b.w.sessionStorage.getItem('derej.metrics.study.v1'),null);b.close();
 console.log('PASS: inicios reales de jornada, etapas y recargas sin duplicados, final declarado tras guardado confirmado, desmarcar y guardar nota sin falsos finales, privacidad y ocultación respetadas, sin enviar notas ni identidad de la lectura.');
})().catch(e=>{console.error(e);process.exit(1);});

const {JSDOM}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'content/caminos-ramak-v25.json'),'utf8'));
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function until(check){for(let i=0;i<50;i++){if(check())return;await pause(10);}assert(check(),'La acción no terminó en el tiempo esperado');}
async function boot({storage={},slow=false,offline=false}={}){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://derej-beta-comunitaria.vercel.app/?metricas=prueba',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,observers=[];const NativeObserver=w.MutationObserver;
 w.MutationObserver=class extends NativeObserver{constructor(fn){super(fn);observers.push(this);}};
 w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
 w.HTMLElement.prototype.scrollIntoView=function(){};w.scrollTo=()=>{};
 w.HTMLMediaElement.prototype.load=function(){};w.HTMLMediaElement.prototype.pause=function(){};w.setInterval=()=>0;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 for(const [key,value] of Object.entries(storage))w.localStorage.setItem(key,value);
 let release,failed=offline,studyRequests=0;const gate=new Promise(r=>release=r);
 w.fetch=async url=>{
  if(String(url).includes('caminos-ramak')){studyRequests++;if(slow)await gate;if(failed)throw Error('offline');return {ok:true,json:async()=>JSON.parse(JSON.stringify(data))};}
  return {ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,'radio.json'),'utf8'))};
 };
 const run=s=>vm.runInContext(s,dom.getInternalVMContext());
 for(const f of ['encuentros-v21.js','prelaunch-local.js','mobile-v234.js','navigation-v235.js','cleanup-v236.js','navigation-v241.js','welcome.js'])run(fs.readFileSync(path.join(root,f),'utf8'));
 await pause(30);
 return {w,run,release,setOffline:value=>{failed=value;},get studyRequests(){return studyRequests;},click:selector=>{const el=w.document.querySelector(selector);assert(el,selector);el.click();},snapshot:()=>Object.fromEntries(Array.from({length:w.localStorage.length},(_,i)=>{const k=w.localStorage.key(i);return [k,w.localStorage.getItem(k)];})),close:()=>{observers.forEach(x=>x.disconnect());dom.window.close();}};
}
(async()=>{
 const privateNote=JSON.stringify({schema:'ramak-v21',parasha:'Lej Lejá',dia:2,note:'Nota privada de prueba',savedAt:'2026-10-20T12:00:00Z'});
 const memoKey='derej-v21-encuentro-ramak-lej-leja-2';
 const progress=JSON.stringify({schema:'derej-progress-v1',completed:{'Lej Lejá|1':{day:1}}});
 const prefs={'derej.metrics.enabled.v1':'false',[memoKey]:privateNote,'derej-v23-camino-progress':progress};
 // Primera visita: cinco pasos, final en el Patio y preferencias privadas intactas.
 let b=await boot({storage:prefs});assert(b.w.document.querySelector('#derejWelcome').open);
 b.click('[data-welcome=new]');for(let i=0;i<5;i++)b.click('[data-welcome=next]');
 assert(!b.w.document.querySelector('#derejWelcome').open);assert(!b.w.document.querySelector('[data-screen=home]').hidden);
 for(const [k,v] of Object.entries(prefs))assert.equal(b.w.localStorage.getItem(k),v);
 const firstVisit=b.snapshot();b.close();
 // Regreso: el Patio abre directamente, sin volver a imponer la guía.
 b=await boot({storage:firstVisit});assert(!b.w.document.querySelector('#derejWelcome').open);assert(!b.w.document.querySelector('[data-screen=home]').hidden);b.close();
 // Recuperar un estudio anterior conserva exactamente día, etapa, nota y completados.
 b=await boot({storage:{...prefs,'derej-welcome-v1':JSON.stringify({completed:true}),'derej-welcome-resume-v1':JSON.stringify({parasha:'Lej Lejá',day:2,step:'practica'})}});
 b.click('[data-welcome-open]');b.click('[data-welcome=return]');b.click('[data-welcome=resume]');await pause(160);
 assert.equal(b.run('selectedParasha'),'Lej Lejá');assert.equal(b.run('selectedDay'),2);assert.equal(b.run('selectedRamakStep'),'practica');assert.equal(b.w.document.querySelector('#ramakNote').value,'Nota privada de prueba');
 assert.equal(b.w.localStorage.getItem('derej-v23-camino-progress'),progress);assert.equal(b.w.localStorage.getItem('derej.metrics.enabled.v1'),'false');
 b.click('[data-ramak-step=profundizar]');const resumed=b.snapshot();b.close();
 b=await boot({storage:resumed});b.click('[data-welcome-open]');b.click('[data-welcome=return]');b.click('[data-welcome=resume]');await pause(160);assert.equal(b.run('selectedDay'),2);assert.equal(b.run('selectedRamakStep'),'profundizar');b.close();
 // Si la primera carga falla durante la espera, debe terminar el aviso de carga;
 // reintentar desde la misma bienvenida reconstruye el estudio y permite entrar.
 b=await boot({slow:true,offline:true});b.click('[data-welcome=return]');b.click('[data-welcome=study]');assert(b.w.document.querySelector('#welcomeStatus').textContent.includes('Preparando'));
 b.release();await until(()=>b.w.document.querySelector('#welcomeStatus').textContent.includes('No pudimos cargar'));
 assert(!b.w.document.querySelector('[data-welcome=study]').disabled);b.setOffline(false);b.click('[data-welcome=study]');await until(()=>!b.w.document.querySelector('#derejWelcome').open);await pause(160);
 assert.equal(b.studyRequests,2);assert(!b.w.document.querySelector('[data-screen=camino]').hidden);assert(b.w.document.querySelector('#ramakWeekIndex'));assert(b.w.document.querySelector('.ramakPanel.on'));b.close();
 // Un encuentro inexistente no debe convertirse silenciosamente en otro.
 b=await boot({storage:{'derej-welcome-v1':JSON.stringify({completed:true}),'derej-welcome-resume-v1':JSON.stringify({parasha:'No existe',day:2,step:'practica'})}});b.click('[data-welcome-open]');b.click('[data-welcome=return]');assert.equal(b.w.document.querySelector('[data-welcome=resume]'),null);assert(b.w.document.querySelector('[data-welcome=study]'));b.close();
 console.log('PASS: primera visita y regreso, recuperación exacta entre visitas, notas/completados/privacidad conservados, error de red visible y reintento desde la bienvenida, referencias guardadas inválidas descartadas.');
})().catch(e=>{console.error(e);process.exit(1);});

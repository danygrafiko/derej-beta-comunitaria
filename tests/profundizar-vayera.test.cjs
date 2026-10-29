const {JSDOM}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),data=JSON.parse(fs.readFileSync(path.join(root,'content/caminos-ramak-v25.json'),'utf8'));
const pause=()=>new Promise(r=>setTimeout(r,60));
async function boot({url='https://derej.example/',saved={},slow=false}={}){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url,runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 const observers=[],NativeObserver=w.MutationObserver;
 w.MutationObserver=class extends NativeObserver{constructor(fn){super(fn);observers.push(this);}};
 w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.ResizeObserver=class{observe(){}};
 w.HTMLElement.prototype.scrollIntoView=function(){};w.scrollTo=()=>{};w.setInterval=()=>0;
 w.HTMLMediaElement.prototype.load=function(){};w.HTMLMediaElement.prototype.pause=function(){};
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
 w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));};
 for(const [k,v] of Object.entries({'derej-welcome-v1':'{"completed":true}',...saved}))w.localStorage.setItem(k,v);
 let release;const gate=new Promise(r=>release=r);
 w.fetch=async url=>{if(slow&&String(url).includes('caminos-ramak'))await gate;return {ok:true,json:async()=>String(url).includes('caminos-ramak')?JSON.parse(JSON.stringify(data)):JSON.parse(fs.readFileSync(path.join(root,'radio.json'),'utf8'))};};
 const run=s=>vm.runInContext(s,dom.getInternalVMContext());
 for(const f of ['encuentros-v21.js','voces-content.js','prelaunch-local.js','mobile-v234.js','navigation-v235.js','cleanup-v236.js','navigation-v241.js','welcome.js','genealogias-estudios-content.js','genealogias.js','genealogias-estudios.js','profundizar-vayera.js'])run(fs.readFileSync(path.join(root,f),'utf8'));
 await pause();
 const click=s=>{const el=w.document.querySelector(s);assert(el,s);el.click();};
 return {w,run,click,release,dialog:()=>w.document.getElementById('passageResources'),close:()=>{observers.forEach(x=>x.disconnect());dom.window.close();}};
}
(async()=>{
 const privateNote=JSON.stringify({note:'<img src=x onerror=alert(1)> Una reflexión privada',parasha:'Vayera',dia:5});
 const progress='{"schema":"derej-progress-v1","completed":{"Noaj|1":{"day":1}}}';
 const noteKey='derej-v21-encuentro-ramak-vayera-5';
 let b=await boot({saved:{[noteKey]:privateNote,'derej-v23-camino-progress':progress,'derej.metrics.enabled.v1':'false'}});
 b.run('route("biblioteca")');b.click('[data-pr-pilot]');assert(b.dialog().open);await pause();await pause();assert.equal(b.run('selectedRamakStep'),'raiz');
 const audio=b.w.document.getElementById('rwAudio');audio.src='https://example.org/untouched.mp3';audio.currentTime=23;
 for(let n=1;n<=7;n++){
  b.click(`.prDays [data-pr-day="${n}"]`);assert.equal(b.run('selectedDay'),n);assert.equal(b.run('selectedParasha'),'Vayera');
  assert.equal(b.w.document.querySelector('#prTitle').textContent,`Vayerá · ${n}ª aliyá`);
  const c=data.parashot.find(p=>p.parasha==='Vayera').caminos[n-1];assert(b.dialog().textContent.includes(b.run('biblicalRefEs('+JSON.stringify(c.aliyaRange)+')')));
  b.click('[data-pr-tab="voces"]');assert.equal(b.w.document.querySelectorAll('#prContent .prVoice').length,Object.keys(c.voces).length);
  b.click('[data-pr-tab="personas"]');assert(b.w.document.querySelectorAll('[data-pr-person]').length);
  b.click('[data-pr-tab="contexto"]');assert(b.w.document.querySelector('.prVerse').textContent.includes(c.pasuk.es));
 }
 b.click('.prDays [data-pr-day="5"]');b.click('[data-pr-tab="mi"]');
 assert(b.w.document.querySelector('.prPrivateNote').textContent.includes('<img'));assert.equal(b.w.document.querySelectorAll('.prPrivateNote img').length,0);
 b.click('[data-pr-bookmark]');assert.equal(b.w.localStorage.getItem('derej-passage-bookmarks-v1'),'[5]');
 assert.equal(b.w.localStorage.getItem('derej-v23-camino-progress'),progress);assert.equal(b.w.localStorage.getItem('derej.metrics.enabled.v1'),'false');
 b.click('[data-pr-tab="personas"]');b.click('[data-pr-person="hagar"]');assert(!b.dialog().open);assert.equal(b.w.document.querySelector('#genealogyStudyTitle').textContent,'Hagar');
 assert(b.w.document.querySelector('[data-screen="camino"]').hidden);b.click('#prReturnToPassage');await pause();await pause();assert(b.dialog().open);assert.equal(b.run('selectedDay'),5);assert.equal(b.run('selectedRamakStep'),'raiz');assert(!b.w.location.search.includes('persona'));
 assert.equal(audio.getAttribute('src'),'https://example.org/untouched.mp3');assert.equal(audio.currentTime,23);
 b.click('[data-pr-close]');assert(!b.dialog().open);assert(b.w.document.activeElement.hasAttribute('data-pr-open'));
 b.run('route("biblioteca")');b.click('[data-pr-saved]');assert.equal(b.w.document.querySelector('[data-pr-bookmark]').getAttribute('aria-pressed'),'true');
 b.click('[data-pr-bookmark]');assert.equal(b.w.localStorage.getItem('derej-passage-bookmarks-v1'),'[]');
 // Storage unavailable must surface a failure rather than claim a successful save.
 const proto=Object.getPrototypeOf(b.w.localStorage),native=proto.setItem;proto.setItem=function(){throw Error('blocked');};
 b.click('[data-pr-bookmark]');assert(b.w.document.getElementById('prSaveStatus').textContent.includes('No pudimos guardar'));proto.setItem=native;
 b.close();
 // Direct entry waits for the asynchronous study data and selects exactly the requested day.
 b=await boot({url:'https://derej.example/?estudio=profundizar&dia=7',slow:true});assert(!b.dialog().open);b.release();await pause();await pause();assert(b.dialog().open);assert.equal(b.run('selectedDay'),7);b.close();
 b=await boot({url:'https://derej.example/?estudio=profundizar&dia=99'});assert(!b.dialog().open);b.close();
 // The pilot does not add resources or alter stages for other parashot.
 b=await boot();b.run('route("camino");selectedParasha="Noaj";selectedDay=2;renderRamak(false)');assert.equal(b.w.document.querySelectorAll('[data-pr-open]').length,0);b.close();
 console.log('PASS: siete aliyot y fuentes contextualizadas; genealogía y retorno exacto; marcadores persistentes, error de almacenamiento visible, notas escapadas, progreso y privacidad conservados, audio intacto, enlace directo con carga lenta y alcance limitado a Vayerá.');
})().catch(e=>{console.error(e);process.exit(1);});

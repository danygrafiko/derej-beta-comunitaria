/* Full-shell checks for navigation, guided timing and private optional notes. */
const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
async function app(query='',saved=null){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://derej-beta-comunitaria.vercel.app/'+query,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
 const w=dom.window,d=w.document,ev=s=>vm.runInContext(s,dom.getInternalVMContext());let y=0,pauses=0,now=1000000,clockId=0;const clocks=new Map();
 Object.defineProperty(w,'scrollY',{get:()=>y});w.scrollTo=o=>{y=o.top||0;};w.HTMLElement.prototype.scrollIntoView=function(){};
 w.HTMLMediaElement.prototype.load=function(){};w.HTMLMediaElement.prototype.pause=function(){pauses++;};
 w.setInterval=fn=>{const id=++clockId;clocks.set(id,fn);return id;};w.clearInterval=id=>clocks.delete(id);w.Date.now=()=>now;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
 w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
 w.fetch=async url=>{const file=String(url).split('?')[0];try{return {ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'))};}catch{return {ok:false,json:async()=>({})};}};
 if(saved)w.localStorage.setItem('derej.arbol.v1',saved);
 for(const s of d.querySelectorAll('script[src]'))ev(fs.readFileSync(path.join(root,s.getAttribute('src').split('?')[0]),'utf8'));
 await new Promise(r=>setTimeout(r,150));d.querySelector('#derejWelcome [data-welcome="skip"]')?.click();await new Promise(r=>setTimeout(r,30));
 const click=s=>{const el=d.querySelector(s);assert(el,s);el.click();return el;};
 return {w,d,ev,click,dom,errors,tick(ms){now+=ms;for(const fn of [...clocks.values()])fn();},get y(){return y;},get pauses(){return pauses;}};
}
(async()=>{
 const a=await app(),{d,w,click,ev}=a;
 assert(d.querySelector('.courtyard .portalArbol[data-arbol-open] .portalSigil'));assert(!d.querySelector('.avPatioTree'));assert.match(d.querySelector('.courtyardBg').getAttribute('src'),/home-courtyard-library/);
 assert.equal(d.querySelectorAll('.courtyard .portal').length,6);assert(!d.querySelector('.courtyard [data-route=personal]'));ev('route("camino")');await new Promise(r=>setTimeout(r,80));click('.caminoPersonalEntry');assert(!d.querySelector('[data-screen=personal]').hidden);click('.personalBack');assert(!d.querySelector('[data-screen=camino]').hidden);ev('route("home")');
 click('[data-arbol-open]');assert(!d.querySelector('[data-screen=arbol]').hidden);assert.equal(d.querySelectorAll('.avTree [data-av-node]').length,11);
 assert(d.querySelector('.avScene.avFlat'));assert(!d.querySelector('#arbolRoot canvas'));assert(!d.querySelector('#arbolRoot [data-av-scene]'));assert(!d.querySelector('script[src*="arbol-scene"]'));
 click('[data-av-action=intro]');assert(!d.querySelector('.avWelcome'));
 for(const s of w.DEREJ_ARBOL.sefirot){click('.avTree [data-av-node='+s.id+']');assert.match(d.querySelector('#avTitle').textContent,new RegExp(s.name));assert(d.querySelector('#avPanel').textContent.includes(s.question));assert(d.querySelectorAll('#avPanel a[hreflang=es]').length>=1);
  assert.equal(d.querySelectorAll('.avTree [aria-pressed=true]').length,1);assert.equal(d.querySelector('.avTree [aria-pressed=true]').dataset.avNode,s.id);const activeRoute=d.querySelector('[data-av-route][aria-pressed=true]');assert(w.DEREJ_ARBOL.routes.find(r=>r.id===activeRoute.dataset.avRoute).ids.includes(s.id));
  click('[data-av-mode=practice]');click('[data-av-action=start]');
  for(const expected of [s.image,s.question,s.prayer,s.action]){click('[data-av-action=next]');assert(d.querySelector('.avReading').textContent.includes(expected),'Guidance belongs to '+s.id);}
  click('[data-av-action=next]');assert(d.querySelector('#avPanel').textContent.includes(s.balance));
 }
 click('[data-av-route=dar]');click('[data-av-mode=practice]');const duration=d.querySelector('#avDuration');duration.value='3';duration.dispatchEvent(new w.Event('change',{bubbles:true}));
 click('[data-av-action=start]');assert.equal(d.querySelector('#avTimer').textContent,'00:36');
 a.tick(10000);assert.equal(d.querySelector('#avTimer').textContent,'00:26');click('[data-av-action=toggle]');a.tick(60000);assert.equal(d.querySelector('#avTimer').textContent,'00:26');assert.match(d.querySelector('#avRunState').textContent,/pausa/);
 click('[data-av-action=toggle]');a.tick(26000);assert.equal(d.querySelector('#avStepTitle').textContent,'Visualizar');
 click('[data-av-action=previous]');assert.equal(d.querySelector('#avStepTitle').textContent,'Llegar');
 Object.defineProperty(d,'hidden',{configurable:true,value:true});d.dispatchEvent(new w.Event('visibilitychange'));assert.match(d.querySelector('#avRunState').textContent,/pausa/);Object.defineProperty(d,'hidden',{configurable:true,value:false});
 click('[data-av-action=toggle]');click('[data-av-action=back]');a.tick(120000);click('[data-arbol-open]');assert.match(d.querySelector('#avRunState').textContent,/pausa/);
 click('[data-av-action=toggle]');for(let i=0;i<5;i++)a.tick(36000);assert(d.querySelector('#avNotes'));assert(!d.querySelector('#avTimer'));
 const text='<img src=x onerror=alert(1)> Mi reflexión privada';const note=d.querySelector('#avIdea');note.value=text;note.dispatchEvent(new w.Event('input',{bubbles:true}));
 assert(!JSON.parse(w.localStorage.getItem('derej.arbol.v1')).notes.jesed,'Only explicit saving persists notes');click('[data-av-action=save]');assert.match(d.querySelector('#avSaveStatus').textContent,/Guardado/);
 const saved=w.localStorage.getItem('derej.arbol.v1'),b=await app('?estudio=arbol&sefira=jesed',saved);assert(!b.d.querySelector('[data-screen=arbol]').hidden);b.click('[data-av-mode=carry]');assert.equal(b.d.querySelector('#avIdea').value,text);assert(!b.d.querySelector('#avPanel img'),'Note HTML must remain plain text');
 b.w.Storage.prototype.setItem=function(){throw Error('QuotaExceededError');};b.click('[data-av-action=save]');assert.match(b.d.querySelector('#avSaveStatus').textContent,/No se pudo guardar/);
 click('[data-av-action=delete]');assert.equal(d.querySelector('#avIdea').value,'');assert(!JSON.parse(w.localStorage.getItem('derej.arbol.v1')).notes.jesed);
 click('[data-av-action=back]');ev('route("camino")');await new Promise(r=>setTimeout(r,80));click('[data-ramak-parasha="Lej Lejá"]');click('#ramakDayStrip [data-ramak-day="2"]');click('.ramakThresholdRail [data-ramak-step="profundizar"]');
 const input=d.querySelector('[data-ramak-panel="practica"] textarea');assert(input);input.value='Escrito anterior sin guardar';const before={day:ev('selectedDay'),parasha:ev('selectedParasha'),step:ev('selectedRamakStep'),pauses:a.pauses};w.scrollTo({top:800});const entry=click('.avStudyEntry [data-arbol-open]');click('[data-av-action=back]');
 assert.equal(d.querySelector('[data-ramak-panel="practica"] textarea'),input);assert.equal(input.value,'Escrito anterior sin guardar');assert.equal(a.y,800);assert.equal(d.activeElement,entry);assert.equal(ev('selectedDay'),before.day);assert.equal(ev('selectedParasha'),before.parasha);assert.equal(ev('selectedRamakStep'),before.step);assert.equal(a.pauses,before.pauses);
 ev('route("pozo")');await new Promise(r=>setTimeout(r,30));d.querySelector('[data-pz="discover"]')?.click();await new Promise(r=>setTimeout(r,30));click('.avPozoEntry [data-arbol-open]');click('[data-av-action=back]');assert(!d.querySelector('[data-screen=pozo]').hidden);
 assert.equal(a.errors.length,0,a.errors.join('\n'));assert.equal(b.errors.length,0,b.errors.join('\n'));a.dom.window.close();b.dom.window.close();console.log('PASS Árbol: fixed flat tree, courtyard entry, 10 sefirot plus distinguished Dáat, 11 illuminated selections and complete guides; 5-step timing, pause/background/return; opt-in notes, reload, XSS/quota/delete; Camino context and Radio preserved; Pozo entry.');
})().catch(e=>{console.error(e);process.exit(1);});

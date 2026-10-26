const {JSDOM}=require('jsdom');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'content/caminos-ramak-v25.json'),'utf8'));
const pause=()=>new Promise(resolve=>setTimeout(resolve,50));
const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://derej-beta-comunitaria.vercel.app/',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window;
const evaluate=source=>vm.runInContext(source,dom.getInternalVMContext());
w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
w.HTMLElement.prototype.scrollIntoView=function(){};
w.scrollTo=()=>{};
w.HTMLMediaElement.prototype.load=function(){};
w.HTMLMediaElement.prototype.pause=function(){};
w.setInterval=()=>0;
w.fetch=async url=>({ok:true,json:async()=>String(url).includes('caminos-ramak')?JSON.parse(JSON.stringify(data)):JSON.parse(fs.readFileSync(path.join(root,'radio.json'),'utf8'))});
(async()=>{
 for(const f of ['voces-content.js','encuentros-v21.js','prelaunch-local.js','mobile-v234.js','navigation-v235.js','cleanup-v236.js','navigation-v241.js'])evaluate(fs.readFileSync(path.join(root,f),'utf8'));
 await pause();
 evaluate('route("camino")');
 // Recorrido de ida y vuelta: solo una etapa y un panel activos por selección.
 for(const step of ['profundizar','raiz','practica','llevar','encuentro','profundizar','encuentro']){
  w.document.querySelector(`.ramakThreshold[data-ramak-step="${step}"]`).click();
  assert.equal(w.document.querySelectorAll('.ramakThreshold.on').length,1);
  assert.equal(w.document.querySelector('.ramakThreshold.on').dataset.ramakStep,step);
  assert.equal(w.document.querySelectorAll('.ramakThreshold[aria-current="step"]').length,1);
  assert.equal(w.document.querySelectorAll('.ramakPanel.on').length,1);
  assert.equal(w.document.querySelector('.ramakPanel.on').dataset.ramakPanel,step);
 }
 // Cada selección usa el mismo evento que recibe el selector de la página.
 for(const p of data.parashot){
  const tab=w.document.querySelector(`[data-ramak-parasha="${p.parasha}"]`);assert(tab,p.parasha);tab.click();
  for(const c of p.caminos){
   const day=w.document.querySelector(`#ramakDayStrip [data-ramak-day="${c.dia}"]`);assert(day);day.click();await pause();
   const card=w.document.querySelector('.v241AliyahCard');assert(card);
   assert.equal(card.querySelector('.v241AliyahHead b').textContent,`${c.dia}ª Aliyá`);
   const url=new URL(card.querySelector('a').href);assert.equal(url.searchParams.get('aliya'),String(c.dia));
   assert(card.textContent.includes(c.aliyaRange));
   const rootPanel=w.document.querySelector('[data-ramak-panel="raiz"]');assert(rootPanel.textContent.includes(c.pasuk.es));
   if(c.pasuk.es_tipo)assert.equal(rootPanel.querySelector('.derejVerseKind').textContent,c.pasuk.es_tipo);
   assert.equal(w.document.querySelectorAll('.ramakVoices .ramakVoice').length,4+(c.voces.baalshemtov||p.parasha==='Noaj'&&c.dia===1?1:0));
   if(p.parasha!=='Noaj')assert(!/Teivá|entrada de Noaj al arca/.test(w.document.querySelector('.ramakVoices').textContent),p.parasha+'/'+c.dia);
   if(data.parashot.indexOf(p)>=3)for(const voice of Object.values(c.voces)){assert(voice.base);assert(voice.atribucion);}
   assert.equal(w.document.querySelectorAll('.ramakVoices a[href*="sefaria.org"]').length,0);
   assert.equal(url.hostname,'parashot.com.ar');
  }
 }
 // El camino seleccionado conserva datos locales de visitas previas.
 w.localStorage.setItem('derej-v23-camino-progress',JSON.stringify({completed:{'Lej Lejá|1':{day:1}}}));
 const saved=w.localStorage.getItem('derej-v23-camino-progress');
 evaluate('renderRamak(false)');assert.equal(w.localStorage.getItem('derej-v23-camino-progress'),saved);
 // Datos incompletos: no presentar el primer día como sustituto del ausente.
 const incomplete=JSON.parse(JSON.stringify(data));incomplete.parashot[2].caminos.pop();
 w.fetch=async()=>({ok:true,json:async()=>incomplete});
 await evaluate('loadRamak()');assert(w.document.getElementById('ramakChooser').textContent.includes('Contenido diario incompleto'));
 // La guía conserva sus referencias dentro de Dérej, sin enlaces a Sefaria.
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
 w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 w.localStorage.setItem('derej-welcome-v1',JSON.stringify({completed:true}));
 evaluate(fs.readFileSync(path.join(root,'welcome.js'),'utf8'));
 w.document.querySelector('[data-welcome-open]').click();
 w.document.querySelector('[data-welcome="new"]').click();
 for(let i=0;i<5;i++){
  assert.equal(w.document.querySelectorAll('#derejWelcome a[href*="sefaria.org"]').length,0);
  if(i<4)w.document.querySelector('[data-welcome="next"]').click();
 }
 console.log('PASS: selector y voces contextualizadas en 140 jornadas, tarjeta de aliyá y rango, número del enlace externo, progreso local conservado y rechazo visible de una edición incompleta.');
 dom.window.close();
})().catch(e=>{console.error(e);dom.window.close();process.exit(1);});

/* Real app integration: patio / Camino / Pozo → biographies → preserved reading. */
const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const errors=[],consoleForTest=new VirtualConsole();consoleForTest.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://derej-beta-comunitaria.vercel.app/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:consoleForTest});
const w=dom.window,doc=w.document,evaluate=s=>vm.runInContext(s,dom.getInternalVMContext());
let y=0,pauses=0;const requests=[];
Object.defineProperty(w,'scrollY',{get:()=>y});
w.scrollTo=arg=>{y=typeof arg==='object'?arg.top:arg||0;};
w.HTMLElement.prototype.scrollIntoView=function(){};
w.HTMLMediaElement.prototype.load=function(){};w.HTMLMediaElement.prototype.pause=function(){pauses++;};w.setInterval=()=>0;
w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
w.fetch=async url=>{requests.push(String(url));const file=String(url).includes('caminos-ramak')?'content/caminos-ramak-v25.json':'radio.json';return {ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'))};};
const pause=()=>new Promise(r=>setTimeout(r,70));
const storage=()=>JSON.stringify(Object.keys(w.localStorage).sort().map(k=>{
 let value=w.localStorage.getItem(k);
 // The existing welcome controller refreshes its resume timestamp on route changes.
 if(k==='derej-welcome-resume-v1'){value=JSON.parse(value);delete value.updatedAt;}
 return [k,value];
}));
function click(selector){const el=doc.querySelector(selector);assert(el,'Missing '+selector);el.click();return el;}
(async()=>{
 for(const s of doc.querySelectorAll('script[src]'))evaluate(fs.readFileSync(path.join(root,s.getAttribute('src').split('?')[0]),'utf8'));
 await pause();if(doc.querySelector('#derejWelcome')?.open)doc.querySelector('#derejWelcome').close();
 evaluate('route("home")');click('[data-voces-open]');assert(!doc.querySelector('[data-screen="voces"]').hidden);
 assert.equal(doc.querySelectorAll('#vocesRoot .vocCard').length,6);
 click('[data-voc-mode="tiempo"]');assert.match(doc.querySelector('.vocList li').textContent,/1040.*Rashí/);
 click('[data-voc-mode="preguntas"]');assert.equal(doc.querySelectorAll('.vocList li').length,6);
 for(const id of ['rashi','ramjal','rambam','ramak','najman','baalshemtov']){
  click(`#vocesRoot [data-voces-author="${id}"]`);
  assert.equal(doc.querySelectorAll('#vocesVida,#vocesObra,#vocesEnsenanza').length,3);
  assert(!/undefined|\[D[1-5]\]|Selección pendiente/.test(doc.querySelector('#vocesRoot').textContent),id);
  assert(doc.querySelector('#vocesEnsenanza').textContent.length>(id==='baalshemtov'?600:1000),id+' needs a developed reading');
  assert(doc.querySelector('.vocSources a[rel="noopener noreferrer"]'));
  click('[data-voc-action="catalog"]');click('[data-voc-mode="preguntas"]');
 }
 click('#vocesRoot [data-voces-author="baalshemtov"]');
 assert.equal(doc.querySelectorAll('[data-voc-reading]').length,7);
 for(let i=0;i<7;i++){click('[data-voc-reading="'+i+'"]');assert.equal(doc.querySelector('[data-voc-reading="'+i+'"]').getAttribute('aria-pressed'),'true');assert(doc.querySelector('#vocesEnsenanza').textContent.includes(w.DEREJ_VOCES_CONTENT.profiles.baalshemtov.readings[i].title));}
 assert([...doc.querySelectorAll('.vocSources a')].every(a=>a.hreflang==='es'));
 click('[data-voc-action="return"]');assert(!doc.querySelector('[data-screen="home"]').hidden);
 evaluate('route("camino")');await pause();
 click('[data-ramak-parasha="Lej Lejá"]');click('#ramakDayStrip [data-ramak-day="2"]');
 click('.ramakThresholdRail [data-ramak-step="profundizar"]');await pause();
 assert.equal(doc.querySelectorAll('.ramakVoices .vocAuthorLink').length,5);
 const textarea=doc.querySelector('#ramakPracticeNote')||doc.querySelector('[data-ramak-panel="practica"] textarea');assert(textarea,'Practice textarea');
 textarea.value='Mi texto todavía sin guardar';
 const before={storage:storage(),pauses,requests:requests.length,parasha:evaluate('selectedParasha'),day:evaluate('selectedDay'),step:evaluate('selectedRamakStep')};
 w.scrollTo({top:932});click('.ramakVoices [data-voces-author="baalshemtov"]');
 assert.equal(doc.querySelector('#vocesTitle').textContent,'Baal Shem Tov');
 assert.equal(doc.querySelector('[data-voc-reading="1"]').getAttribute('aria-pressed'),'true');
 assert.match(doc.querySelector('#vocesEnsenanza h2').textContent,/Hacer del amor/);
 click('[data-voc-action="return"]');assert.equal(textarea.value,'Mi texto todavía sin guardar');assert.equal(y,932);
 const original=click('.ramakVoices [data-voces-author="rambam"]');
 assert.match(doc.querySelector('.vocContext').textContent,/Lej Lejá.*Día 2/);
 click('#vocesRoot .vocFeature [data-voces-author]');assert(!doc.querySelector('.vocContext'),'Another author must not inherit the daily source');
 click('[data-voc-action="return"]');
 assert.equal(doc.querySelector('[data-ramak-panel="practica"] textarea'),textarea,'Restore the same textarea node');
 assert.equal(textarea.value,'Mi texto todavía sin guardar');assert.equal(y,932);assert.equal(doc.activeElement,original);
 assert.equal(evaluate('selectedParasha'),before.parasha);assert.equal(evaluate('selectedDay'),before.day);assert.equal(evaluate('selectedRamakStep'),before.step);
 assert.equal(storage(),before.storage,'No progress/reflection writes');assert.equal(pauses,before.pauses,'Radio must not pause');assert.equal(requests.length,before.requests,'Biographies must not fetch external content');
 evaluate('route("pozo")');await pause();if(doc.querySelector('[data-pz="discover"]'))click('[data-pz="discover"]');click('[data-pz="voices"]');const pozo=doc.querySelector('#pozoRoot');
 const pozoHTML=pozo.innerHTML;click('#pozoRoot [data-voces-author="ramak"]');assert.match(doc.querySelector('#vocesTitle').textContent,/Ramak/);
 click('[data-voc-action="return"]');assert.equal(pozo.innerHTML,pozoHTML);assert(!doc.querySelector('[data-screen="pozo"]').hidden);
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('PASS: six profiles, seven Baal Shem Tov readings, five daily voices, three catalog views, continuous readings, daily source context, return/focus/scroll/unsaved text, unchanged storage and audio, no external fetch, Pozo return.');
 dom.window.close();
})().catch(e=>{console.error(e);dom.window.close();process.exitCode=1;});

const {JSDOM}=require('jsdom'),fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const root=require('node:path').join(__dirname,'..');
const dom=new JSDOM(fs.readFileSync(root+'/index.html','utf8'),{url:'https://derej.example/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
const requests=[],routes=[];
w.route=name=>{routes.push(name);for(const el of w.document.querySelectorAll('[data-screen]'))el.hidden=el.dataset.screen!==name;};
w.HTMLElement.prototype.scrollIntoView=function(){};
w.matchMedia=()=>({matches:true});
w.fetch=async(url,options)=>{
  if(!options?.method)return {ok:true,json:async()=>({enabled:true})};
  requests.push(JSON.parse(options.body));return {ok:true,json:async()=>({answer:'<img src=x onerror=alert(1)> Síntesis editorial.',reflection:'¿Qué aprendiste?',sources:[{title:'Salmo 6',route:'biblioteca',collection:'tehilim'}]})};
};
vm.runInContext(fs.readFileSync(root+'/preguntas.js','utf8'),dom.getInternalVMContext());
const d=w.document,pause=()=>new Promise(r=>setTimeout(r,30));
(async()=>{
  d.querySelector('.dqLibraryEntry button').click();assert.equal(routes.at(-1),'preguntas');
  const input=d.getElementById('dqQuestion');input.value='Mi pregunta privada';
  d.getElementById('dqForm').dispatchEvent(new w.Event('submit',{cancelable:true}));await pause();assert.equal(requests.length,0);
  d.getElementById('dqConsent').checked=true;
  d.getElementById('dqForm').dispatchEvent(new w.Event('submit',{cancelable:true}));await pause();assert.equal(requests.length,1);assert.equal(requests[0].question,'Mi pregunta privada');
  assert.equal(d.querySelector('#dqThread img'),null);assert(d.querySelector('.dqAssistant').textContent.includes('<img'));
  for(let i=0;i<w.localStorage.length;i++)assert(!w.localStorage.getItem(w.localStorage.key(i)).includes('Mi pregunta privada'));
  assert.equal(w.sessionStorage.length,0);
  d.querySelector('.dqSources button').click();assert.equal(routes.at(-1),'biblioteca');
  d.getElementById('dqClear').click();assert.equal(d.getElementById('dqThread').children.length,0);
  w.route('autoestima');d.querySelector('[data-screen="autoestima"] .dqStudyEntry').click();assert.equal(routes.at(-1),'preguntas');assert(!d.getElementById('dqContext').hidden);
  input.value='Otra pregunta';d.getElementById('dqForm').dispatchEvent(new w.Event('submit',{cancelable:true}));await pause();assert.equal(requests.at(-1).context,'autoestima');assert.equal(requests.at(-1).history.length,0);
  console.log('PASS preguntas UI: library/study entry, consent, sources, safe text rendering, no browser persistence, clear, context.');dom.window.close();
})().catch(error=>{console.error(error);dom.window.close();process.exitCode=1;});

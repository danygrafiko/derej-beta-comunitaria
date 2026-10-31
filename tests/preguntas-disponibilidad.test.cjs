const {JSDOM}=require('jsdom'),fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const root=path.join(__dirname,'..'),dom=new JSDOM(fs.readFileSync(root+'/index.html','utf8'),{url:'https://derej.example',runScripts:'outside-only'}),w=dom.window;
w.route=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};w.matchMedia=()=>({matches:true});
let enabled=false,offline=false,posts=0;
w.fetch=async(u,o)=>{if(o?.method){posts++;return{ok:true,json:async()=>({answer:'Prueba'})};}if(offline)throw Error('offline');return{ok:true,json:async()=>({enabled})};};
vm.runInContext(fs.readFileSync(root+'/preguntas.js','utf8'),dom.getInternalVMContext());
const d=w.document,pause=()=>new Promise(r=>setTimeout(r,20));
(async()=>{
 await pause();assert(d.querySelector('#dqForm').hidden);assert(!d.querySelector('#dqActivation').hidden);assert(d.querySelector('#dqConsent').disabled);
 assert(d.querySelector('#dqSuggestions').hidden);assert.equal(posts,0);
 enabled=true;d.querySelector('#dqRetryAvailability').click();await pause();assert(!d.querySelector('#dqForm').hidden);assert(d.querySelector('#dqActivation').hidden);assert(!d.querySelector('#dqConsent').disabled);
 d.querySelector('#dqConsent').click();assert(d.querySelector('#dqConsent').checked);
 d.querySelector('#dqQuestion').value='Borrador';offline=true;d.querySelector('#dqRetryAvailability').click();await pause();assert(d.querySelector('#dqForm').hidden);assert(d.querySelector('#dqActivation').textContent.includes('No pudimos'));assert.equal(d.querySelector('#dqQuestion').value,'Borrador');assert.equal(posts,0);
 console.log('PASS: pendiente sin formulario, consentimiento activable al habilitarse, fallo de conexión y borrador preservado.');w.close();
})().catch(e=>{console.error(e);w.close();process.exitCode=1;});

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {JSDOM}=require('jsdom');
const root=path.join(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'content/hebreo/diccionario.json')));
const guide=JSON.parse(fs.readFileSync(path.join(root,'content/hebreo/guia.json')));
const tick=()=>new Promise(resolve=>setTimeout(resolve,12));
async function setup(hash='',fail=false){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'diccionario-hebreo.html'),'utf8'),{url:'https://derej-beta-comunitaria.vercel.app/diccionario-hebreo.html'+hash,runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;
 w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};
 w.CSS={escape:s=>s};
 w.fetch=async u=>{if(fail)throw Error('offline');return {ok:true,json:async()=>String(u).includes('diccionario.json')?data:guide};};
 vm.runInContext(fs.readFileSync(path.join(root,'diccionario-hebreo.js'),'utf8'),dom.getInternalVMContext());
 await tick();return dom;
}
(async()=>{
 assert.equal(data.entries.length,128);
 assert.equal(new Set(data.entries.map(e=>e.id)).size,128);
 assert.equal(data.entries.filter(e=>e.study).length,24);
 assert.equal(data.entries.flatMap(e=>e.references).length,256);
 for(const e of data.entries){
  assert(e.context&&e.caution&&e.root&&e.grammar,e.id);
  for(const r of e.references){assert(r.forms.length,e.id+' '+r.osis);assert(r.tokens.some(t=>t.match));}
 }
 for(const j of guide.journeys)for(const id of j.ids)assert(data.entries.some(e=>e.id===id),id);
 let dom=await setup(),w=dom.window,d=w.document;
 assert.equal(d.querySelectorAll('[data-open]').length,24);
 assert.match(d.querySelector('#count').textContent,/128 de 128/);
 const search=value=>{d.querySelector('#query').value=value;d.querySelector('#query').dispatchEvent(new w.Event('input'));};
 for(const value of ['שָׁלוֹם','שלום','shalom']){search(value);assert(d.querySelector('[data-open="shalom"]'),value);}
 for(const value of ['ruah','ruaj','רוּחַ']){search(value);assert(d.querySelector('[data-open="ruach"]'),value);}
 search('שמר');assert(d.querySelector('[data-open="shamar"]'));
 search('zzzzzz');assert.equal(d.querySelector('#empty').hidden,false);
 d.querySelector('#emptyReset').click();
 d.querySelector('#category').value='Nombres y designaciones';d.querySelector('#category').dispatchEvent(new w.Event('change'));
 assert.equal(d.querySelectorAll('[data-open]').length,4);
 d.querySelector('#reset').click();
 search('nefesh');d.querySelector('[data-open="nephesh"]').click();await tick();
 assert.equal(d.querySelector('#entry').hidden,false);assert.equal(d.activeElement.id,'entryTitle');
 assert.equal(d.querySelectorAll('.passage').length,2);assert(d.querySelector('mark'));
 d.querySelector('#saveWord').click();assert.equal(d.querySelector('#saveWord').getAttribute('aria-pressed'),'true');
 assert.deepEqual(JSON.parse(w.localStorage.getItem('derej.hebreo.guardados.v1')),['nephesh']);
 d.querySelector('#backResults').click();await tick();d.querySelector('#onlySaved').click();
 assert.equal(d.querySelectorAll('[data-open]').length,1);
 w.location.hash='tradicion';await tick();assert.equal(d.querySelectorAll('.laterTerm').length,6);
 w.location.hash='guia';await tick();assert.equal(d.querySelector('#guide').hidden,false);assert.equal(d.querySelectorAll('#guide details').length,8);
 w.location.hash='fuentes';await tick();assert(!d.querySelector('#sources').textContent.includes('nli.org.il'));
 dom.window.close();
 dom=await setup('#palabra=yhwh');assert.match(dom.window.document.querySelector('#entryTitle').textContent,/HaShem/);dom.window.close();
 dom=await setup('#palabra=inexistente');assert.match(dom.window.document.querySelector('#entryTitle').textContent,/No encontramos/);dom.window.close();
 dom=await setup('',true);assert(dom.window.document.querySelector('#retryLoad'));dom.window.close();
 console.log('Diccionario: contenido, 256 formas cotejadas, búsqueda multilingüe, filtros, guardados, rutas y error de carga: OK');
})().catch(e=>{console.error(e);process.exitCode=1;});

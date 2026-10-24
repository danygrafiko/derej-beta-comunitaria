const {JSDOM}=require('jsdom');
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8'),script=fs.readFileSync('patio.js','utf8');
function mount(saved,blocked=false){
 const dom=new JSDOM(html,{url:'https://derej.example',runScripts:'outside-only'}),w=dom.window;
 if(saved!==undefined)w.localStorage.setItem('derej.patio.exploring.v1',saved);
 if(blocked)Object.defineProperty(w,'localStorage',{get(){throw new Error('blocked');}});
 w.eval(script);return dom;
}
let dom=mount(),d=dom.window.document,t=d.querySelector('.patioExplore'),doors=[...d.querySelectorAll('.courtyard .portal')];
assert.equal(doors.length,6);assert(doors.every(p=>p.hidden));assert(!t.hidden);assert.equal(t.getAttribute('aria-expanded'),'false');
assert(doors.every(p=>t.getAttribute('aria-controls').split(' ').includes(p.id)));
let routes=0;d.addEventListener('click',e=>{if(e.target.closest('[data-route]'))routes++;});
t.click();assert(doors.every(p=>!p.hidden));assert.equal(t.getAttribute('aria-expanded'),'true');assert.equal(routes,0);assert.equal(dom.window.localStorage.getItem('derej.patio.exploring.v1'),'true');
const water=d.querySelector('.pozoHotspot');assert.equal(water.dataset.route,'pozo');assert(!water.hidden);assert.match(water.textContent,/Aprender/);assert(!d.querySelector('.pozoDescent'));assert.equal(d.querySelector('#patio-biblioteca').dataset.route,'biblioteca');
t.click();assert(doors.every(p=>p.hidden));assert.equal(dom.window.localStorage.getItem('derej.patio.exploring.v1'),'false');dom.window.close();
for(const saved of ['true','false','unexpected']){dom=mount(saved);assert.equal(dom.window.document.querySelector('.portal').hidden,saved!=='true');dom.window.close();}
dom=mount(undefined,true);t=dom.window.document.querySelector('.patioExplore');t.click();assert(!dom.window.document.querySelector('.portal').hidden);t.click();assert(dom.window.document.querySelector('.portal').hidden);dom.window.close();
console.log('PASS patio: first arrival, reveal/hide, accessible state, local preference, blocked storage and Aprender entry and separate Biblioteca.');

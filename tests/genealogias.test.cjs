const fs=require('fs'),vm=require('vm'),assert=require('assert');
class El{
  constructor(tag){this.tagName=tag;this.attrs={};this.children=[];this.dataset={};this.events={};this.hidden=false;this.open=false;this.parentElement=null;this._text='';this.style={setProperty(){}};}
  set className(s){this.attrs.class=s;}get className(){return this.attrs.class||'';}
  get classList(){return {add:(s)=>{this.className+=' '+s;},contains:(s)=>this.className.split(/\s+/).includes(s)};}
  set textContent(s){this.children.forEach(c=>c.parentElement=null);this.children=[];this._text=String(s);}get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
  appendChild(c){if(c.parentElement){const a=c.parentElement.children;a.splice(a.indexOf(c),1);}c.parentElement=this;this.children.push(c);return c;}
  replaceChildren(...cs){this.children.forEach(c=>c.parentElement=null);this.children=[];this._text='';cs.forEach(c=>this.appendChild(c));}
  insertAdjacentElement(pos,c){assert.equal(pos,'afterend');const par=this.parentElement;assert(par);if(c.parentElement){const a=c.parentElement.children;a.splice(a.indexOf(c),1);}const ix=par.children.indexOf(this);par.children.splice(ix+1,0,c);c.parentElement=par;}
  get previousElementSibling(){if(!this.parentElement)return null;const a=this.parentElement.children;return a[a.indexOf(this)-1]||null;}
  setAttribute(k,v){this.attrs[k]=String(v);if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(v);}
  getAttribute(k){return k.startsWith('data-')?this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]:this.attrs[k];}
  addEventListener(k,fn){(this.events[k]??=[]).push(fn);}click(){for(const fn of this.events.click||[])fn();}
  focus(){}scrollIntoView(){}getBoundingClientRect(){return {width:0,height:0,left:0,right:0,top:0,bottom:0};}
  all(){return this.children.flatMap(c=>[c,...c.all()]);}
  querySelectorAll(s){return this.all().filter(x=>match(x,s));}querySelector(s){return this.querySelectorAll(s)[0]||null;}
}
function match(e,s){
  if(s[0]==='['){const m=s.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);assert(m,s);return m[2]===undefined?e.getAttribute(m[1])!==undefined:e.getAttribute(m[1])===m[2];}
  if(s.includes(' > ')){const [a,b]=s.split(' > ');return match(e,b)&&e.parentElement&&match(e.parentElement,a);}
  if(s.includes(' ')){const [a,b]=s.split(/\s+/,2);if(!match(e,b))return false;let p=e.parentElement;while(p){if(match(p,a))return true;p=p.parentElement;}return false;}
  if(s[0]==='#')return e.attrs.id===s.slice(1);
  if(s[0]==='.')return e.classList.contains(s.slice(1));
  if(s[0]==='['){const m=s.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);assert(m,s);return m[2]===undefined?e.getAttribute(m[1])!==undefined:e.getAttribute(m[1])===m[2];}
  return e.tagName===s;
}
function build(n){const e=new El(n.tag);Object.entries(n.attrs).forEach(([k,v])=>e.setAttribute(k,v||''));if(n.text)e._text=n.text;n.children.forEach(c=>e.appendChild(build(c)));return e;}
// Parse the real screen markup rather than a copied fixture.
const path=require('node:path');
const appRoot=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(appRoot,'index.html'),'utf8');
const markup=html.slice(html.indexOf('<section id="derej-raices-v2"'),html.indexOf('</main>'));
const dom=new El('document'),stack=[dom];
for(const token of markup.matchAll(/<\/?[a-zA-Z][^>]*>/g)){
 const tag=token[0];if(tag.startsWith('</')){if(stack.length>1)stack.pop();continue;}
 const name=tag.match(/^<([\w-]+)/)[1],e=new El(name);
 for(const m of tag.slice(name.length+1,-1).matchAll(/([\w-]+)(?:="([^"]*)")?/g)){e.setAttribute(m[1],m[2]??'');if(m[1]==='hidden')e.hidden=true;}
 stack.at(-1).appendChild(e);if(!['br','hr','img','input','link','meta'].includes(name))stack.push(e);
}
const source=fs.readFileSync(path.join(appRoot,'genealogias.js'),'utf8');
const js=source.split('/* Acceso nativo desde Biblioteca;')[0];
const document={getElementById:id=>dom.querySelector('#'+id),createElement:tag=>new El(tag),createElementNS:(ns,tag)=>new El(tag),createTextNode:text=>{const e=new El('#text');e.textContent=text;return e;}};
const ctx={document,ResizeObserver:class{observe(){}},requestAnimationFrame:fn=>fn()};vm.createContext(ctx);vm.runInContext(js,ctx);
const root=document.getElementById('derej-raices-v2'),api=root.genealogy;
function closeToNode(id){api.select(id);const d=document.getElementById('r-reading');assert.equal(d.previousElementSibling.dataset.person,id,'Ficha fuera del personaje '+id);assert(!d.hidden);assert.equal(root.querySelectorAll('#r-reading').length,1);}
assert.equal(document.getElementById('r-detail-name').textContent,'Shelomó · Salomón');
closeToNode('rejavam');root.querySelector('[data-expand="rejavam"]').click();closeToNode('rejavam');root.querySelector('[data-expand="rejavam"]').click();closeToNode('aviya');
root.querySelector('#r-close').click();assert(document.getElementById('r-reading').hidden);
api.setFocus('david');assert.equal(api.children('david').length,20);assert.equal(root.querySelector('#r-reading').parentElement.attrs.id,'r-read-slot');
const opener=root.querySelector('[aria-label="Desplegar rama Ajinoam"]');assert(opener);opener.click();closeToNode('amnon');
root.querySelector('[aria-label="Leer sobre Ajinoam"]').click();assert(root.querySelector('#r-reading').previousElementSibling.classList.contains('r-couple'));
api.setFocus('zerubavel');assert.equal(api.people.zerubavel.father,'pedaya');assert(api.people.zerubavel.note.includes('Shealtiel'));assert.equal(api.children('zerubavel').length,3);assert.equal(api.paternalPath('zerubavel').length,53);
api.setFocus('yaakov');root.querySelector('#r-ancestor-toggle').click();assert(!root.querySelector('#r-ancestors').hidden);assert.equal(api.children('yaakov').length,13);
for(const p of Object.values(api.people)){
  assert(p.ref,'Sin fuente '+p.id);api.setFocus(p.id);
  for(const label of root.querySelectorAll('.r-couple')){const fold=label.querySelector('.r-expand');if(fold&&fold.getAttribute('aria-expanded')==='false')fold.click();}
  for(const kid of api.children(p.id))closeToNode(kid.id);
  const visit=(id,path=new Set())=>{assert(!path.has(id),'Ciclo '+id);const next=new Set(path);next.add(id);for(const par of [api.people[id].father,api.people[id].mother].filter(Boolean)){assert(api.people[par]);visit(par,next);}};visit(p.id);
}
console.log(JSON.stringify({personajes:Object.keys(api.people).length,fichas:'Junto a cada personaje, también después de desplegar',navegacion:'Todas las ramas recorridas',fuentes:'Todos los personajes con referencia',parentescos:'Sin ciclos ni progenitores ausentes'}));

assert(html.includes('href="?estudio=genealogias" data-genealogias-open'));
assert(html.includes('data-screen="genealogias" hidden'));
assert(html.indexOf('data-genealogias-open')<html.indexOf('class="bibliotecaClosing"'));
console.log('PASS: Biblioteca entry and native screen included.');

// Every real tree entry must have an authored study and a working in-place action.
const studyContext={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(appRoot,'genealogias-estudios-content.js'),'utf8'),studyContext);
const profiles=studyContext.window.DEREJ_GENEALOGY_STUDIES.profiles;
assert.deepEqual(Object.keys(profiles).sort(),Object.keys(api.people).sort());
const storySet=new Set();
for(const [id,profile] of Object.entries(profiles)){
 assert(['relato','registro'].includes(profile.kind),id);
 assert(profile.title&&profile.refs.length&&profile.story.length,id);
 const story=profile.story.join(' ');assert(!storySet.has(story),'Copied biography '+id);storySet.add(story);
 assert(story.split(/\s+/).length>=35,'Missing individual context '+id);
 assert(profile.reading.length>150&&profile.question.endsWith('?')&&profile.practice.length>35,id);
 assert(!/undefined|\[object Object\]|<script|\ufffd/.test(JSON.stringify(profile)),id);
 if(profile.tradition)assert(profile.tradition.ref&&profile.tradition.text,id);
 api.setFocus(id);
 const more=root.querySelector('[data-study-person="'+id+'"]');assert(more,'No Saber más for '+id);
 let opened=null;api.openStudy=person=>opened=person;more.click();assert.equal(opened,id,'Wrong person in study action');
}
assert.notEqual(profiles.tamar.story.join(' '),profiles.tamardavid.story.join(' '));
assert.match(profiles.danieldavid.reading,/Quilab|listas|Daniel/);
assert.match(profiles.zerubavel.reading,/Pedayá.*Shealtiel/);
assert.match(profiles.pedaya.reading,/legal|adopción|explicación/);
assert.match(profiles.natan.story.join(' '),/profeta/);
assert.match(profiles.menasherey.story.join(' '),/Yosef/);
console.log('PASS: 176 authored studies, source references, homonyms, textual differences and Saber más actions.');

// Exercise the full reader renderer against every profile and its return navigation.
const controls=new Map();
for(const id of ['genealogyStudy','genealogyCatalog','genealogyCatalogToggle','genealogySearch','genealogyResults','genealogySearchStatus','genealogyStudyTitle','genealogiasTitle']){
 const e=new El('div');e.hidden=['genealogyStudy','genealogyCatalog'].includes(id);e.value='';e.isConnected=true;controls.set(id,e);
}
const studyScreen=new El('section'),reader=controls.get('genealogyStudy');
let position=128;
const focusTarget=new El('button');focusTarget.isConnected=true;
const readerDocument={activeElement:focusTarget,getElementById:id=>id==='derej-raices-v2'?root:controls.get(id)||document.getElementById(id),querySelector:s=>s.includes('data-screen')?studyScreen:null};
const studyWindow={DEREJ_GENEALOGY_STUDIES:studyContext.window.DEREJ_GENEALOGY_STUDIES,get scrollY(){return position;},scrollTo:o=>position=o.top};
vm.runInNewContext(fs.readFileSync(path.join(appRoot,'genealogias-estudios.js'),'utf8'),{document:readerDocument,window:studyWindow,URLSearchParams,location:{search:''}});
for(const id of Object.keys(profiles)){
 api.openStudy(id,focusTarget);
 assert(!reader.hidden&&root.hidden,'Reader visibility '+id);
 assert(reader.innerHTML.includes('id="genealogyStudyTitle"'),id);
 assert(reader.innerHTML.includes(profiles[id].refs[0]),'Missing source in rendered study '+id);
 assert(reader.innerHTML.includes('data-gs-back'),'Missing return action '+id);
 assert(!/undefined|\[object Object\]/.test(reader.innerHTML),'Broken rendered study '+id);
}
const readerClick=studyScreen.events.click[0];
readerClick({target:{closest:s=>s==='[data-gs-back]'?{}:null}});
assert(reader.hidden&&!root.hidden);assert.equal(position,128,'Return must preserve tree reading position');
const oldHTML=reader.innerHTML;api.openStudy('unknown-person');assert.equal(reader.innerHTML,oldHTML);assert(reader.hidden);
console.log('PASS: all 176 full studies render, source lists and return controls included, tree scroll preserved, unknown person rejected.');

api.openStudy('abraham',focusTarget);
for(const parent of ['sara','hagar','ketura'])assert(reader.innerHTML.includes('data-gs-person=\"'+parent+'\"'),'Missing shared family '+parent);
console.log('PASS: shared maternal branches link to their own studies.');

// Reading a relative updates the shareable URL without reloading or creating history entries.
let sharedURL='https://derej-beta-comunitaria.vercel.app/?estudio=genealogias&persona=abraham#gsSources';
studyWindow.location={get href(){return sharedURL;}};
studyWindow.history={state:null,replaceState:(state,title,url)=>sharedURL=url};
// Reload the controller with browser-like URL support; retain the original tree API.
vm.runInNewContext(fs.readFileSync(path.join(appRoot,'genealogias-estudios.js'),'utf8'),{document:readerDocument,window:studyWindow,URL,URLSearchParams,location:{search:''}});
api.openStudy('sara',focusTarget);assert.equal(new URL(sharedURL).searchParams.get('persona'),'sara');assert.equal(new URL(sharedURL).hash,'');
studyScreen.events.click.at(-1)({target:{closest:s=>s==='[data-gs-back]'?{}:null}});
assert(!new URL(sharedURL).searchParams.has('persona'));
console.log('PASS: direct study URL follows related reading and returns to the tree without a reload.');

/* Dérej · Tehilim Biblioteca · colección integrada (2026-10-30)
   150 salmos indexados; estudios editoriales iniciales, no edición versículo a versículo. */
(()=>{
 'use strict';
 const root=document.getElementById('tehilimExplorer');
 const open=document.querySelector('[data-tehilim-open]');
 if(!root||!open)return;
 const $=id=>root.querySelector('#'+id);
 let collection=null,book=0,search='',view='index';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const link=(label,url)=>{const a=document.createElement('a');a.textContent=label;a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;};
 const block=(tag,text,cls)=>{const el=document.createElement(tag);el.textContent=text;if(cls)el.className=cls;return el;};
 const list=(items)=>{const ul=document.createElement('ul');for(const item of items)ul.appendChild(block('li',item));return ul;};
 function scrollTop(){root.scrollIntoView({behavior:'smooth',block:'start'});}
 function showView(which){view=which;$('thIndex').hidden=which!=='index';$('thStudy').hidden=which!=='study';$('thBody').hidden=which!=='body';$('thGlossary').hidden=which!=='glossary';$('thBack').hidden=which==='index';scrollTop();}
 function renderIndex(){
  if(!collection)return;
  const grid=$('thGrid');grid.replaceChildren();
  const items=collection.psalms.filter(p=>(!book||p.book===book)&&(!search||String(p.number).includes(search)||p.title.toLocaleLowerCase('es').includes(search)||p.study?.theme?.toLocaleLowerCase('es').includes(search)));
  $('thCount').textContent=items.length+' de 150 Salmos';
  for(const p of items){
   const b=document.createElement('button');b.type='button';b.className='thPsalm'+(p.study?' thPsalmReady':'');
   b.append(block('span',String(p.number),'thPsalmNumber'),block('strong',p.title,'thPsalmName'),block('small',p.study?'Estudio inicial':'Pendiente de curaduría','thPsalmStatus'));
   b.addEventListener('click',()=>renderStudy(p));grid.appendChild(b);
  }
  if(!items.length)grid.appendChild(block('p','No hay resultados para esta búsqueda.','thEmpty'));
  root.querySelectorAll('[data-th-book]').forEach(b=>{const selected=Number(b.dataset.thBook)===book;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
 }
 function appendSection(container,title,body){container.append(block('h3',title),block('p',body));}
 function renderSources(container,arr){if(!arr?.length)return;container.append(block('h3','Fuentes para consultar'));const ul=document.createElement('ul');ul.className='thSources';for(const src of arr){if(!/^https:\/\/www\.sefaria\.org\//.test(src.url))continue;const li=document.createElement('li');li.appendChild(link(src.label,src.url));ul.appendChild(li);}container.append(ul);}
 function renderStudy(p){
  const c=$('thStudyContent');c.replaceChildren();
  c.append(block('div','LIBRO '+p.book+' · SALMO '+p.number,'thEyebrow'),block('h2',p.title),block('p',p.study?.editorialStatus||'Este Salmo está indexado. Su estudio profundo aún no se ha publicado.','thStatus'));
  if(p.study){
   c.append(block('p',p.study.theme,'thLead'),block('p',p.study.summary));
   for(const s of p.study.sections||[])appendSection(c,s.title,s.body);
   c.append(block('h3','Pasajes para leer'));c.append(list(p.study.refs||[]));
   c.append(block('h3','Preguntas comunitarias'));c.append(list(p.study.questions||[]));
   renderSources(c,p.study.sources);
  }else{
   c.append(block('p','Este capítulo forma parte de la colección completa de Tehilim. Estamos preparando una lectura con texto hebreo, traducción, contexto, comentarios tradicionales, glosario y preguntas comunitarias.'));
  }
  const pLink=block('p','');pLink.appendChild(link('Leer el texto del Salmo '+p.number+' ↗','https://www.sefaria.org/Psalms.'+p.number));c.append(pLink);
  showView('study');
 }
 function renderBody(){
  const c=$('thBodyContent');c.replaceChildren();const u=collection.bodyUnit;
  c.append(block('div','TEHILIM · CUERPO Y ALMA','thEyebrow'),block('h2',u.title),block('p',u.subtitle,'thLead'),block('p',u.safety,'thCaution'));
  c.append(block('h3','Tres Salmos para contemplar'));c.append(list(u.reading));
  for(const study of u.deepDive||[]){
   const article=document.createElement('section');article.className='thDeepDive';
   article.append(block('h3','Salmo '+study.number+' · '+study.title),block('p',study.verse,'thStatus'));
   if(study.hebrew){const he=block('p',study.hebrew,'thHebrew');he.lang='he';he.dir='rtl';article.append(he);}
   article.append(block('p',study.rendering,'thVerse'),block('p',study.commentary),block('p',study.reflection,'thReflection'));c.append(article);
  }
  for(const item of u.traditionalContext||[])appendSection(c,item.title,item.body);
  c.append(block('h3','Glosario de la unidad'));
  for(const term of u.glossary||[]){c.append(block('h4',term.term),block('p',term.definition));}
  c.append(block('h3','Siete días de contemplación'));
  const days=document.createElement('ol');for(const day of u.sevenDays||[])days.append(block('li','Día '+day.day+' · '+day.task));c.append(days);
  if(u.facilitation){c.append(block('h3','Guía para encuentro comunitario · '+u.facilitation.duration),list(u.facilitation.steps));}
  appendSection(c,'Fuente tradicional',u.tradition);appendSection(c,'Lectura contemporánea Dérej',u.contemporary);
  c.append(block('h3','Preguntas para la comunidad'),list(u.questions));
  renderSources(c,u.sources);
  c.append(block('h3','Explorar los Salmos relacionados'));
  const row=document.createElement('div');row.className='thRelated';
  for(const n of u.psalms){const b=block('button','Salmo '+n);b.type='button';b.addEventListener('click',()=>renderStudy(collection.psalms[n-1]));row.append(b);}c.append(row);
  c.append(block('h3','Otras correspondencias contemplativas'));
  for(const region of collection.bodyAtlas){const p=block('p',region.region+' · Salmos '+region.psalms.join(', ')+'. '+region.note);c.append(p);}
  showView('body');
 }
 function renderGlossary(){
  const c=$('thGlossaryContent');c.replaceChildren();c.append(block('h2','Glosario de Tehilim'));
  for(const g of collection.glossary||[]){const d=document.createElement('div');d.className='thGlossaryTerm';d.append(block('h3',g.term+' · '+g.hebrew),block('p',g.definition));c.append(d);}showView('glossary');
 }
 function openExplorer(){
  root.hidden=false;open.setAttribute('aria-expanded','true');
  if(collection){showView('index');return;}
  $('thCount').textContent='Cargando los Salmos…';
  fetch('content/tehilim/indice.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Índice no disponible');return r.json()}).then(d=>{
   if(!Array.isArray(d.psalms)||d.psalms.length!==150)throw Error('Índice incompleto');
   collection=d;renderIndex();showView('index');
  }).catch(()=>{$('thCount').textContent='No fue posible cargar los Salmos. Cierra y vuelve a abrir para reintentar.';});
 }
 open.addEventListener('click',()=>{if(root.hidden)openExplorer();else{root.hidden=true;open.setAttribute('aria-expanded','false');open.focus();}});
 $('thBack').addEventListener('click',()=>showView('index'));
 $('thClose').addEventListener('click',()=>{root.hidden=true;open.setAttribute('aria-expanded','false');open.focus();});
 $('thSearch').addEventListener('input',e=>{search=e.target.value.trim().toLocaleLowerCase('es');renderIndex();});
 root.querySelectorAll('[data-th-book]').forEach(b=>b.addEventListener('click',()=>{book=Number(b.dataset.thBook);renderIndex();}));
 $('thBodyOpen').addEventListener('click',()=>{if(collection)renderBody();});
 $('thGlossaryOpen').addEventListener('click',()=>{if(collection)renderGlossary();});
})();
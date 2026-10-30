/* Dérej · Catálogo: conserva los controles y lectores originales. */
(()=>{
 'use strict';
 const root=document.querySelector('.bibliotecaInner');if(!root)return;
 const intro=root.querySelector('.bibliotecaIntro');
 intro.innerHTML='<span>BIBLIOTECA · BEIT MIDRASH</span><h1 id="bibliotecaTitle" tabindex="-1">Cada lectura,<br>una puerta.</h1><p>Una biblioteca para comprender nuestras raíces, escuchar otras voces y llevar lo aprendido a la vida.</p>';
 const categories={todos:'Toda la biblioteca',texto:'Texto y tradición',voces:'Sabios y legado',raices:'Raíces y relatos',interior:'Vida interior'};
 const catalog=document.createElement('div');catalog.className='libCatalog';
 catalog.innerHTML='<div class="libTools"><label class="libSearch"><span>Buscar una lectura</span><input id="libSearch" type="search" placeholder="Salmos, meditación, Abraham…" autocomplete="off"></label><p class="libHint">Elige un tema.<br>Encuentra una pregunta.</p></div><div class="libFilters" role="group" aria-label="Temas de la biblioteca"></div><aside class="libResume" hidden><div><small>TU ÚLTIMA LECTURA ABIERTA</small><strong></strong></div><button type="button">Volver al estudio ↗</button></aside><div class="libResults"><h2>Explorar la colección</h2><span id="libCount" role="status"></span></div><div class="libGrid"></div><div class="libEmpty" hidden><h3>No encontramos esa lectura.</h3><p>Prueba con otro nombre o explora todos los temas.</p><button type="button">Ver toda la biblioteca</button></div>';
 intro.after(catalog);
 const entries=[
 ['.thEntry','tehilim','texto','Salmos para el camino','COLECCIÓN · 150 SALMOS','tehilim cuerpo alma oración'],
 ['.npEntry','nombres','texto','Nombres y presencia','RECORRIDO DE ESTUDIO','creador nombres hebreo'],
 ['.vocHomeEntry','voces','voces','Voces del Camino','VIDAS · OBRAS · ENSEÑANZAS','hilel baal shem tov ramak rambam najman rashi jonathan sacks abraham ibn ezra sabios esperanza escucha lengua exégesis'],
 ['.genealogyEntry','genealogias','raices','Genealogías','MAPA INTERACTIVO','abraham sara david familias generaciones'],
 ['.psEntry','patriarcas','raices','Patriarcas y matriarcas','SEFIROT · HISTORIAS','árbol vida correspondencias'],
 ['.mdEntry','meditacion','interior','Meditación judía y cabalística','DIEZ ENFOQUES','contemplación atención cabala silencio'],
 ['[aria-labelledby="autoestimaEntryTitle"]','autoestima','interior','Autoestima y dignidad','ESTUDIO · SIETE DÍAS','cuidado valor personal prácticas']
 ];
 const grid=catalog.querySelector('.libGrid');
 const cards=entries.map(([selector,id,category,title,label,tags],i)=>{
  const el=root.querySelector(selector);if(!el)return null;
  el.classList.add('libCard');el.dataset.libId=id;el.dataset.libCategory=category;
  const heading=el.querySelector('h2');if(heading)heading.textContent=title;
  el.querySelectorAll('small,.npEyebrow,.thEntry>small,.prEyebrow,.vocHomeEntry>div>span,.aeEntry>div>span,.mdEntry>div>span').forEach(n=>n.hidden=true);
  const top=document.createElement('div');top.className='libCardTop';const tag=document.createElement('span');tag.textContent=label;const num=document.createElement('span');num.textContent=String(i+1).padStart(2,'0');top.append(tag,num);el.prepend(top);
  grid.append(el);return {el,id,title,category,search:title+' '+tags+' '+(el.querySelector('p')?.textContent||'')};
 }).filter(Boolean);
 let category='todos';const input=catalog.querySelector('input');const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 function render(){const query=normalize(input.value.trim());let count=0;cards.forEach(c=>{c.el.hidden=!(category==='todos'||c.category===category)||!normalize(c.search).includes(query);if(!c.el.hidden)count++;});catalog.querySelector('#libCount').textContent=count+' de '+cards.length+' lecturas y colecciones';catalog.querySelector('.libEmpty').hidden=count!==0;catalog.querySelectorAll('[data-lib-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.libFilter===category)));}
 const filters=catalog.querySelector('.libFilters');Object.entries(categories).forEach(([id,label])=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.libFilter=id;b.addEventListener('click',()=>{category=id;render();});filters.append(b);});input.addEventListener('input',render);
 catalog.querySelector('.libEmpty button').addEventListener('click',()=>{category='todos';input.value='';render();input.focus();});
 const key='derej.library.last.v1',resume=catalog.querySelector('.libResume');
 function showResume(id){const c=cards.find(c=>c.id===id);if(!c)return;resume.hidden=false;resume.querySelector('strong').textContent=c.title;resume.querySelector('button').onclick=()=>c.el.querySelector('button,a')?.click();}
 root.addEventListener('click',e=>{const c=e.target.closest('.libCard');if(!c||!e.target.closest('button,a'))return;try{localStorage.setItem(key,c.dataset.libId);}catch{}showResume(c.dataset.libId);},true);
 try{const saved=localStorage.getItem(key);showResume(saved==='sacks'||saved==='ibnezra'?'voces':saved);}catch{}render();
})();

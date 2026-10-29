/* Lectura de los 176 personajes, integrada en la misma pantalla y sin recargar Dérej. */
(()=>{
 'use strict';
 const tree=document.getElementById('derej-raices-v2');
 const reader=document.getElementById('genealogyStudy');
 const catalog=document.getElementById('genealogyCatalog');
 const data=window.DEREJ_GENEALOGY_STUDIES;
 const api=tree?.genealogy;
 if(!reader||!catalog||!api||!data?.profiles)return;
 const {people,children}=api,profiles=data.profiles;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fold=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const paragraphs=list=>list.map(t=>`<p>${esc(t)}</p>`).join('');
 const studyButton=(id,label)=>`<button type="button" data-gs-person="${esc(id)}">${esc(label||people[id].name)}</button>`;
 let point=null,current=null,fontSize=1;
 const featured=['abraham','sara','hagar','rivka','yaakov','yosef','david','zerubavel'];
 function catalogResults(){
  const query=fold(document.getElementById('genealogySearch').value.trim()).slice(0,120);
  const all=Object.values(people);
  const matches=query?all.filter(p=>fold([p.name,p.alias,profiles[p.id].title,p.ref].join(' ')).includes(query)):featured.map(id=>people[id]);
  const result=document.getElementById('genealogyResults');
  result.innerHTML=matches.map(p=>`<li><button type="button" data-gs-person="${esc(p.id)}"><b>${esc(p.name)}</b>${p.alias?`<span>${esc(p.alias)}</span>`:''}<small>${esc(p.ref)}</small></button></li>`).join('');
  document.getElementById('genealogySearchStatus').textContent=query?`${matches.length} ${matches.length===1?'personaje encontrado':'personajes encontrados'}`:'176 personajes disponibles · Algunas lecturas para comenzar';
 }
 function showCatalog(){
  catalog.hidden=!catalog.hidden;
  document.getElementById('genealogyCatalogToggle').setAttribute('aria-expanded',String(!catalog.hidden));
  if(!catalog.hidden){catalogResults();document.getElementById('genealogySearch').focus({preventScroll:true});catalog.scrollIntoView({block:'nearest'});}
 }
 function relatives(id){
  const p=people[id],items=[];
  if(p.father)items.push([p.father,'Padre']);
  if(p.mother)items.push([p.mother,'Madre']);
  api.grouping(id).filter(g=>g.other).forEach(g=>items.push([g.other,'Familia compartida']));
  children(id).forEach(k=>items.push([k.id,'Descendencia incluida']));
  Object.values(people).filter(k=>k.id!==id&&((p.father&&p.father===k.father)||(p.mother&&p.mother===k.mother))).forEach(k=>items.push([k.id,'Hermandad por un progenitor conocido']));
  return [...new Map(items.map(item=>[item[0],item])).values()];
 }
 function openStudy(id,trigger=null){
  const p=people[id],s=profiles[id];if(!p||!s)return;
  if(reader.hidden)point={y:window.scrollY,focus:trigger||document.activeElement};
  current=id;
  const related=relatives(id);
  const words=[...s.story,s.reading,s.question,s.practice,s.tradition?.text||''].join(' ').split(/\s+/).length;
  const minutes=Math.max(1,Math.ceil(words/180));
  reader.innerHTML=`<nav class="gsToolbar" aria-label="Navegación del estudio"><button type="button" data-gs-back>← Volver al árbol</button><div role="group" aria-label="Tamaño de lectura">${[[1,'A'],[1.15,'A+'],[1.3,'A++']].map(([size,label])=>`<button type="button" data-gs-size="${size}" aria-pressed="${fontSize===size}">${label}</button>`).join('')}</div></nav>
   <article class="gsArticle"><header class="gsHero"><p class="gsEyebrow">DÉREJ · BIBLIOTECA · SABER MÁS</p><h1 id="genealogyStudyTitle" tabindex="-1">${esc(p.name)}</h1>${p.alias?`<p class="gsAlias">${esc(p.alias)}</p>`:''}<p class="gsLead">${esc(s.title)}</p><p class="gsMeta">${s.kind==='registro'?'Lectura de un registro genealógico':'Estudio del relato y su contexto'} · ${minutes} min de lectura</p></header>
   <nav class="gsContents" aria-label="Partes del estudio"><a href="#gsStory">El relato</a><a href="#gsReading">Leer con atención</a><a href="#gsReflection">Reflexionar</a><a href="#gsSources">Fuentes</a></nav>
   <div class="gsKinship"><b>Su lugar en esta selección</b><p>${p.father?`Padre: ${esc(people[p.father].name)}.`:'El árbol no fija una filiación paterna para esta entrada.'}${p.mother?` Madre: ${esc(people[p.mother].name)}.`:''} ${children(id).length?`${children(id).length} ${children(id).length===1?'descendiente incluido':'descendientes incluidos'} en el árbol.`:'Esta vista no despliega su descendencia; no implica que no la tuviera.'}</p></div>
   <section id="gsStory"><p class="gsSectionLabel">TEXTO · SÍNTESIS DÉREJ</p><h2>${s.kind==='registro'?'Lo que conserva el registro':'La persona en el relato'}</h2>${paragraphs(s.story)}</section>
   <section id="gsReading"><p class="gsSectionLabel">CONTEXTO · ALCANCE DE LA LECTURA</p><h2>Leer con atención</h2><p>${esc(s.reading)}</p></section>
   ${s.tradition?`<section class="gsTradition"><p class="gsSectionLabel">TRADICIÓN · FUENTE IDENTIFICADA</p><h2>Una lectura tradicional</h2><p>${esc(s.tradition.text)}</p><p class="gsSourceRef">${esc(s.tradition.ref)}</p></section>`:''}
   <section id="gsReflection" class="gsReflection"><p class="gsSectionLabel">YO · REFLEXIÓN ORIGINAL DÉREJ</p><h2>Una pregunta para detenerse</h2><p class="gsQuestion">${esc(s.question)}</p><h3>Llevarlo a la vida</h3><p>${esc(s.practice)}</p><p class="gsSmall">Esta propuesta de reflexión no es una cita ni una enseñanza atribuida a un sabio.</p></section>
   <section id="gsSources"><p class="gsSectionLabel">FUENTES · VOLVER AL PASAJE</p><h2>Para estudiar con el texto</h2><p>Abre estos pasajes en tu edición del Tanaj y contrasta la síntesis con las palabras del relato.</p><ol class="gsSources">${s.refs.map(ref=>`<li>${esc(ref)}</li>`).join('')}${s.tradition?`<li>${esc(s.tradition.ref)} · fuente tradicional.</li>`:''}</ol>${s.links?.length?`<p class="gsSmall">Lectura complementaria en español; no sustituye el pasaje:</p><ul>${s.links.filter(l=>/^https:\/\/es\.chabad\.org\//.test(l.url)).map(l=>`<li><a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer" hreflang="es">${esc(l.label)} ↗</a></li>`).join('')}</ul>`:''}
   <details class="gsEditorial"><summary>Criterio de esta lectura</summary><p>Los textos son síntesis y propuestas originales de Dérej. La genealogía no reconstruye una biografía donde sólo hay nombres. Las interpretaciones tradicionales se identifican por obra y pasaje; las diferencias de nombres y filiaciones se conservan cuando afectan la lectura.</p><p>Las edades, parentescos y acontecimientos se presentan como datos de las fuentes bíblicas; no constituyen por sí solos una comprobación histórica. Las conexiones dibujadas no expresan una jerarquía de valor humano.</p><p>${esc(data.edition)}</p></details></section>
   ${related.length?`<section class="gsRelated"><p class="gsSectionLabel">FAMILIA · CONTINUAR LA LECTURA</p><h2>Otros nombres de esta rama</h2><div>${related.map(([pid,label])=>`<button type="button" data-gs-person="${esc(pid)}"><small>${esc(label)}</small><b>${esc(people[pid].name)}</b>${people[pid].alias?`<span>${esc(people[pid].alias)}</span>`:''}</button>`).join('')}</div></section>`:''}
   <footer class="gsFooter"><button type="button" data-gs-back>← Volver donde estabas en el árbol</button><button type="button" data-gs-tree="${esc(id)}">Ver a ${esc(p.name)} en el árbol</button><a href="?estudio=genealogias&amp;persona=${encodeURIComponent(id)}" target="_blank" rel="noopener">Abrir enlace de este estudio ↗</a></footer></article>`;
  reader.style.setProperty('--gs-size',fontSize);
  tree.hidden=true;reader.hidden=false;
  document.getElementById('genealogyStudyTitle').focus({preventScroll:true});
  window.scrollTo({top:0,behavior:'instant'});
 }
 function closeStudy(center=null){
  if(reader.hidden)return;
  reader.hidden=true;tree.hidden=false;current=null;
  if(center){api.setFocus(center);document.getElementById('r-root-name').focus({preventScroll:true});}
  else{if(point?.focus?.isConnected)point.focus.focus({preventScroll:true});else document.getElementById('genealogiasTitle').focus({preventScroll:true});window.scrollTo({top:point?.y||0,behavior:'instant'});}
  point=null;
 }
 api.openStudy=openStudy;
 document.getElementById('genealogyCatalogToggle').addEventListener('click',showCatalog);
 document.getElementById('genealogySearch').addEventListener('input',catalogResults);
 document.querySelector('[data-screen="genealogias"]').addEventListener('click',event=>{
  const person=event.target.closest('[data-gs-person]');if(person){openStudy(person.dataset.gsPerson,person);return;}
  if(event.target.closest('[data-gs-back]')){closeStudy();return;}
  const branch=event.target.closest('[data-gs-tree]');if(branch){closeStudy(branch.dataset.gsTree);return;}
  const size=event.target.closest('[data-gs-size]');if(size){const value=Number(size.dataset.gsSize);if(![1,1.15,1.3].includes(value))return;fontSize=value;reader.style.setProperty('--gs-size',value);reader.querySelectorAll('[data-gs-size]').forEach(b=>b.setAttribute('aria-pressed',String(b===size)));}
 });
 const params=new URLSearchParams(location.search),deep=params.get('persona');
 if(params.get('estudio')==='genealogias'&&deep){
  const start=()=>{if(profiles[deep]&&people[deep]){api.setFocus(deep);openStudy(deep);}else{catalog.hidden=false;document.getElementById('genealogyCatalogToggle').setAttribute('aria-expanded','true');catalogResults();document.getElementById('genealogySearchStatus').textContent='No encontramos ese personaje. Busca por su nombre para continuar.';}};
  const welcome=document.querySelector('#derejWelcome');
  if(welcome?.open)welcome.addEventListener('close',()=>queueMicrotask(start),{once:true});else start();
 }
})();

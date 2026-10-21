/* Dérej · Biblioteca de voces. No escribe reflexiones ni progreso. */
(()=>{
 'use strict';
 const root=document.getElementById('vocesRoot'),screen=root?.closest('[data-screen]'),content=window.DEREJ_VOCES_CONTENT;
 if(!root||!screen||!content?.profiles)return;
 const people=content.profiles,order=content.order;
 const aliases={rambam:'rambam',ramak:'ramak',ramjal:'ramjal',rabinajman:'najman',najman:'najman',rashi:'rashi'};
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z]/g,'');
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clean=s=>String(s||'').replace(/\s*\[D[1-5]\]/g,'');
 const paragraphs=list=>list.map(t=>`<p>${esc(clean(t))}</p>`).join('');
 const connections={rashi:'Del detalle del texto al examen de una decisión.',ramjal:'De revisar una acción a pensar cómo se afianza.',rambam:'Otra formulación del vínculo entre cualidades y acciones.',ramak:'Expresar ante el Creador lo que hemos reconocido.',najman:'Volver al pasaje y descubrir una pregunta nueva.'};
 let mode='voces',selected=null,returnPoint=null,dailyContext=null;
 function top(profile=false){return `<div class="vocTop"><button type="button" class="vocTextButton" data-voc-action="return">← ${returnPoint?.name==='camino'?'Volver a mi estudio':returnPoint?.name==='pozo'?'Volver al Pozo':'Patio'}</button>${profile?'<button type="button" class="vocTextButton" data-voc-action="catalog">Ver todas las voces</button>':'<span class="vocEyebrow">DÉREJ · EL CAMINO</span>'}</div>`;}
 function catalog(){
  selected=null;
  let ids=mode==='tiempo'?['rashi','rambam','ramak','ramjal','najman']:['rambam','ramak','ramjal','najman','rashi'];
  const cards=mode==='voces'?`<div class="vocGrid">${ids.map(id=>{const p=people[id];return `<button type="button" class="vocCard" data-voces-author="${id}"><span class="vocMeta">${esc(p.date)} · ${esc(p.place)}</span><h2>${esc(p.name)}</h2><p>${esc(p.hook)}</p><span class="vocCardFoot">Conocer su vida y su obra →</span></button>`;}).join('')}</div>`:`<ul class="vocList">${ids.map(id=>{const p=people[id];return `<li><button type="button" data-voces-author="${id}">${esc(mode==='preguntas'?p.question:p.date+' · '+p.name)}<small>${esc(mode==='preguntas'?p.name+' · '+p.source:p.place+' · '+p.context)}</small></button></li>`;}).join('')}</ul>`;
  root.innerHTML=`${top()}<header class="vocHero"><span class="vocEyebrow">VIDAS · OBRAS · ENSEÑANZAS</span><h1 id="vocesTitle">Voces del Camino</h1><p>Detrás de cada nombre hay una vida, un tiempo y una manera de preguntar. Conoce a quienes leemos en Dérej y vuelve al texto con una mirada más atenta.</p></header><section class="vocFeature"><span class="vocEyebrow">PRIMERA COLECCIÓN · VOLVER CON LO APRENDIDO</span><h2>Volver por un camino conocido</h2><p>Abram regresa a lugares donde antes había estado. Rashí se detiene en ese recorrido. Comencemos por el detalle y por la pregunta que nos abre.</p><button type="button" class="vocButton" data-voces-author="rashi">Abrir esta lectura →</button></section><div class="vocModes" role="group" aria-label="Maneras de explorar">${[['voces','Voces'],['preguntas','Preguntas'],['tiempo','En el tiempo']].map(([id,label])=>`<button type="button" aria-pressed="${mode===id}" data-voc-mode="${id}">${label}</button>`).join('')}</div>${cards}<p class="vocEditorialNote">Cinco voces para comenzar. Las conexiones del recorrido son selecciones editoriales de Dérej. Puedes leer sin responder preguntas ni guardar un registro.</p><div class="vocStatus" role="status" aria-live="polite">Explorar ${esc(mode)}</div>`;
 }
 function profile(id){
  const p=people[id];if(!p)return;selected=id;const s=p.study,next=order[(order.indexOf(id)+1)%order.length];
  const context=dailyContext?.author===id?`<aside class="vocContext"><span class="vocEyebrow">DESDE TU LECTURA</span><p>${esc(dailyContext.parasha)} · Día ${esc(dailyContext.day)}</p><p>Fuente de esa tarjeta: ${esc(dailyContext.source)}.</p><p>El estudio de abajo es la lectura de entrada a esta voz; puede utilizar una fuente diferente.</p></aside>`:'';
  root.innerHTML=`${top(true)}<article class="vocProfile"><header><span class="vocEyebrow">${esc(p.context)}</span><h1 id="vocesTitle">${esc(p.name)}</h1><div class="vocSubtitle">${esc(p.full)}<br>${esc(p.date)} · ${esc(p.place)}</div><p class="vocLead">${esc(s.title)}</p></header>${context}<nav class="vocIndex" aria-label="Índice de ${esc(p.name)}"><a href="#vocesVida">Vida</a><a href="#vocesObra">Obra</a><a href="#vocesEnsenanza">Enseñanza</a></nav><section id="vocesVida"><span class="vocEyebrow">CONOCER A UNA PERSONA</span><h2>Su vida y su mundo</h2>${paragraphs(p.life)}</section><section id="vocesObra"><span class="vocEyebrow">ORIENTARSE ANTES DE LEER</span><h2>Acercarse a su obra</h2>${p.works.map(([title,text])=>`<h3>${esc(title)}</h3><p>${esc(text)}</p>`).join('')}</section><section id="vocesEnsenanza"><span class="vocEyebrow">UNA ENSEÑANZA PARA DETENERSE</span><h2>${esc(s.title)}</h2><div class="vocSource">${esc(p.source)}</div>${s.passage?`<h3>El pasaje y su contexto</h3><p>${esc(s.passage)}</p>`:''}<h3>La enseñanza · Síntesis en español</h3><p>${esc(clean(s.summary))}</p><h3>Lectura Dérej</h3>${paragraphs(s.reflection)}</section><details class="vocQuestions"><summary>Para comprender y conversar</summary><p>${esc(s.understand)}</p><p>${esc(s.personal)}</p><p class="vocEditorialNote">Puedes conservar tu pregunta sin compartirla. Esta lectura no guarda respuestas.</p></details><details class="vocSources"><summary>Fuentes y notas de lectura</summary><p>${esc(p.notes)}</p><ul>${p.sources.map(([title,note,url])=>`<li>${esc(title)} · ${esc(note)}. <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Consultar referencia externa ↗</a></li>`).join('')}</ul><p>El contenido de Dérej se lee en español. Las referencias externas documentan la edición y pueden estar en otros idiomas.</p></details><section class="vocFeature"><span class="vocEyebrow">CONTINUAR EL RECORRIDO DÉREJ</span><h2>Seguir con ${esc(people[next].name)}</h2><p>${esc(connections[id])}</p><button type="button" class="vocButton" data-voces-author="${next}">Abrir la siguiente voz →</button><p class="vocEditorialNote">Esta conexión es una propuesta de Dérej; no representa una conversación histórica entre los autores.</p></section></article><div class="vocStatus" role="status" aria-live="polite">Lectura de ${esc(p.name)}</div>`;
 }
 function open(id,trigger){
  const active=document.querySelector('.screen.active:not([hidden])');
  if(active!==screen){
   returnPoint={name:active?.dataset.screen||'home',y:window.scrollY,focus:trigger};
   dailyContext=null;
   if(trigger?.closest('.ramakVoice')&&typeof currentParasha==='function'&&typeof currentCamino==='function'){
    dailyContext={author:id,parasha:currentParasha()?.parasha||'',day:currentCamino()?.dia||'',source:trigger.closest('.ramakVoice').querySelector('.derejVoiceSource')?.textContent||''};
   }
   if(typeof route==='function')route('voces');
  }
  if(id)profile(id);else catalog();
  root.querySelector('h1')?.setAttribute('tabindex','-1');root.querySelector('h1')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});
 }
 function restore(){
  const point=returnPoint||{name:'home',y:0};
  // Restore existing nodes instead of rendering Camino again: unsaved writing survives.
  document.querySelectorAll('.screen[data-screen]').forEach(el=>{const on=el.dataset.screen===point.name;el.hidden=!on;el.classList.toggle('active',on);});
  if(point.focus?.isConnected)point.focus.focus({preventScroll:true});
  window.scrollTo({top:point.y,behavior:'instant'});returnPoint=null;dailyContext=null;
 }
 function authorButton(id,text){return `<button type="button" class="vocAuthorLink" data-voces-author="${id}" aria-label="Conocer la vida y obra de ${esc(people[id].name)}">${esc(text)}</button>`;}
 if(typeof renderVoiceCard==='function'){
  const original=renderVoiceCard;
  renderVoiceCard=function(raw,label){const html=original(raw,label),id=aliases[norm(label)];return id?html.replace(/<small>([^<]*)<\/small>/,(_,text)=>`<small>${authorButton(id,text)}</small>`):html;};
 }
 document.querySelectorAll('.ramakVoice>small').forEach(el=>{const id=aliases[norm(el.textContent)];if(id&&!el.querySelector('button'))el.innerHTML=authorButton(id,el.textContent);});
 document.addEventListener('click',event=>{
  const openButton=event.target.closest('[data-voces-open]');
  const author=event.target.closest('[data-voces-author]');
  if(openButton){event.preventDefault();open(null,openButton);return;}
  if(author){const id=aliases[norm(author.dataset.vocesAuthor)];if(id){event.preventDefault();open(id,author);}return;}
  const button=event.target.closest('[data-voc-action],[data-voc-mode]');if(!button)return;
  if(button.dataset.vocAction==='return')restore();
  else if(button.dataset.vocAction==='catalog'){catalog();window.scrollTo({top:0,behavior:'instant'});root.querySelector('[data-voc-action]')?.focus({preventScroll:true});}
  else if(button.dataset.vocMode){mode=button.dataset.vocMode;catalog();root.querySelector(`[data-voc-mode="${mode}"]`)?.focus({preventScroll:true});}
 });
 catalog();
})();

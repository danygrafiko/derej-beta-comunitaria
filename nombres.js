/* Nombres y presencia · lectura y notas privadas en este navegador. */
(()=>{
 'use strict';
 const root=document.getElementById('nombresRoot'),screen=root?.closest('[data-screen]'),data=window.DEREJ_NOMBRES;
 if(!root||!screen||!data?.sessions)return;
 const KEY='derej-nombres-presencia-v1';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const paras=list=>list.map(s=>`<p>${esc(s)}</p>`).join('');
 let state={last:'intro',notes:{},size:1},returnPoint=null,view='catalog',storageOK=true;
 try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&typeof saved==='object'){
   state.last=['intro',...data.sessions.map(s=>s.id)].includes(saved.last)?saved.last:'intro';
   if(saved.notes&&typeof saved.notes==='object'&&!Array.isArray(saved.notes))state.notes=saved.notes;
   if([1,1.15,1.3].includes(saved.size))state.size=saved.size;
 }}catch{storageOK=false;}
 function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}return storageOK;}
 function focusTitle(){const title=root.querySelector('#npTitle');title?.setAttribute('tabindex','-1');title?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
 const btn=(id,label)=>`<button type="button" data-np-view="${esc(id)}">${esc(label)}</button>`;
 function top(){return `<nav class="npTop" aria-label="Navegación del estudio"><button type="button" data-np-back>← ${returnPoint?.name==='camino'?'Volver a mi estudio':'Patio'}</button>${view!=='catalog'?btn('catalog','Ver el recorrido'):''}</nav>`;}
 function sourceList(ids){return `<ul class="npSources">${data.sources.filter(s=>!ids||ids.includes(s.id)).map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" hreflang="es">${s.id}. ${esc(s.label)} ↗</a></li>`).join('')}</ul>`;}
 function catalog(){
  const last=data.sessions.find(s=>s.id===state.last);
  root.innerHTML=`${top()}<header class="npHero"><span class="npEyebrow">BEIT MIDRASH · SIETE ENCUENTROS</span><h1 id="npTitle">Nombres y presencia</h1><p>Acercarnos al Creador a través de los nombres que leemos en las Escrituras. Un espacio para comprender, contemplar y responder con una vida más atenta.</p></header><section class="npStart"><h2>Antes de comenzar</h2><p>Un mismo Dios, distintos nombres y contextos. Conoce cómo leer este recorrido y cómo distinguimos el texto, la tradición y las reflexiones de Dérej.</p>${btn('intro','Leer la introducción')}${last?btn(last.id,'Continuar · '+last.title):''}</section><div class="npGrid">${data.sessions.map(s=>`<button type="button" class="npCard" data-np-view="${s.id}"><small>ENCUENTRO ${s.id}</small><h2>${esc(s.title)}</h2><p>${esc(s.kicker.replace(/^ENCUENTRO \d+\s+/,''))}</p><span>Leer con calma →</span></button>`).join('')}</div><details class="npDetails"><summary>Mapa de nombres y expresiones</summary><dl>${data.glossary.map(([name,meaning,ref])=>`<dt>${esc(name)}</dt><dd>${esc(meaning)} <small>${esc(ref)}</small></dd>`).join('')}</dl></details><details class="npDetails"><summary>Profundización · Las sefirot y los 72 nombres</summary><p>Las sefirot se estudian como modalidades de manifestación divina. La oración se dirige a Dios; las correspondencias no lo dividen en partes.</p><p>La explicación cabalística de los 72 nombres parte de Éxodo 14,19–21: tres versículos hebreos de 72 letras cada uno, dispuestos para formar tripletes invirtiendo el segundo. No son 72 palabras con traducciones españolas independientes.</p><p>Este apartado es una introducción a la interpretación tradicional. Las acciones cotidianas de Dérej son propuestas pedagógicas originales.</p>${sourceList([8,10,18])}</details><details class="npDetails"><summary>Fuentes del recorrido · Lecturas en español</summary>${sourceList()}</details><p class="npNote">Puedes entrar por cualquiera de los encuentros y volver a la introducción cuando lo necesites. Tus notas y el punto de lectura se guardan sólo en este navegador.</p>`;
 }
 function intro(){
  root.innerHTML=`${top()}<article class="npArticle"><span class="npEyebrow">ORIENTARSE ANTES DE LEER</span><h1 id="npTitle">Un mismo Dios</h1><p class="npLead">Los nombres nos acercan a los modos en que el Creador se da a conocer en la tradición. Ninguno encierra por completo lo divino.</p><h2>Hashem y el Nombre de cuatro letras</h2><p>Hashem significa «El Nombre» y es una expresión reverente de uso habitual. YHWH representa cuatro consonantes: yod, he, vav, he. En la práctica judía se evita vocalizar ese Nombre y se usan lecturas sustitutivas. Aquí estudiamos su contexto y significado con respeto.</p><h2>Leer con contexto</h2><p>Una traducción, un comentario de los sabios y una propuesta Dérej cumplen funciones diferentes. Cada encuentro conserva esa distinción y permite consultar las fuentes en español. El recorrido está abierto a personas de distintas trayectorias y no presupone identidad judía.</p><h2>Comprender y contemplar</h2><p>En el Tania, Rabí Shneur Zalman de Liadí relaciona la reflexión sostenida con el amor y la reverencia hacia Dios. Esta orientación pertenece a la enseñanza jasídica de Jabad. Nuestra adaptación breve no pretende reemplazar ese trabajo espiritual ni representar todas las escuelas de la Cabalá.</p><p>Lee una idea, explícatela con tus palabras y vuelve a ella en silencio. Después, si lo deseas, expresa una plegaria personal y elige una acción. No necesitas forzar una emoción.</p><h2>La vida recibida</h2><p>El Tania transmite una enseñanza del Baal Shem Tov sobre la creación sostenida continuamente por la palabra divina. Para contemplar: ¿qué cambia al recibir la existencia cotidiana como un don?</p><p class="npNote">Las preguntas, las contemplaciones y las plegarias de este recorrido son elaboraciones originales Dérej. La bitácora es opcional y se conserva sólo en este dispositivo.</p><details class="npDetails"><summary>Fuentes de esta introducción</summary>${sourceList([1,8,9,19,20])}</details><div class="npActions">${btn('1','Comenzar · Nombrar al Dios único')}</div></article>`;
 }
 function session(id){
  const s=data.sessions.find(s=>s.id===id);if(!s)return catalog();
  const refs=s.reading.match(/Fuentes? ([\d, y]+)/i)?.[1].match(/\d+/g)?.map(Number)||[14,15,16];
  if(id==='2')refs.push(19);if(id==='7')refs.push(20);
  const notes=state.notes[id]||{};
  root.innerHTML=`${top()}<article class="npArticle"><span class="npEyebrow">ENCUENTRO ${s.id} · LECTURA SIN PRISA</span><h1 id="npTitle">${esc(s.title)}</h1><p class="npLead">${esc(s.kicker.replace(/^ENCUENTRO \d+\s+/,''))}</p><div class="npReading"><b>Lectura bíblica</b><p>${esc(s.reading.replace(/Fuentes.*$/,'').replace(/Lecturas complementarias.*$/,''))}</p></div><div class="npFont" role="group" aria-label="Tamaño del texto">${[1,1.15,1.3].map(n=>`<button type="button" data-np-size="${n}" aria-pressed="${n===state.size}">${Math.round(n*100)} %</button>`).join('')}</div><section><h2>Texto · El relato y su contexto</h2>${paras(s.text)}</section><section><h2>Tradición · Acercarse a las fuentes</h2>${paras(s.tradition)}</section><section><h2>Yo · Comprender y contemplar</h2><p>Vuelve a una idea de esta lectura. Considera qué te permite reconocer en tu relación con el Creador, antes de buscar una respuesta o una acción.</p><details class="npDetails"><summary>Preguntas para detenerse y conversar</summary><p>${esc(s.questions)}</p></details></section><section><h2>Mundo · Llevarlo a la vida</h2>${paras(s.life)}<h3>Una acción posible</h3><p>${esc(s.action)}</p></section><section><h2>Plegaria personal</h2><p class="npPrayer">${esc(s.prayer)}</p><p class="npNote">Plegaria original Dérej. Puedes hacer silencio o expresarte con tus propias palabras.</p></section><details class="npDetails"><summary>Bitácora personal · Opcional</summary><p>Estas notas se guardan sólo en este navegador. No se envían a Dérej. Se perderán si borras los datos del navegador.</p>${[['idea','Lo que comprendí'],['question','Lo que todavía pregunto'],['action','Lo que llevaré a la práctica']].map(([key,label])=>`<label for="np-${key}">${label}</label><textarea id="np-${key}" data-np-note="${key}" maxlength="6000" rows="3">${esc(typeof notes[key]==='string'?notes[key]:'')}</textarea>`).join('')}<p class="npNote" id="npSaveStatus" role="status">${storageOK?'Tus notas permanecen en este dispositivo.':'El navegador no permite guardar. Conserva una copia antes de salir.'}</p></details><details class="npDetails"><summary>Fuentes y lecturas en español</summary>${sourceList(refs)}</details><div class="npActions">${Number(id)>1?btn(String(Number(id)-1),'← Encuentro anterior'):btn('intro','Volver a la introducción')}${Number(id)<7?btn(String(Number(id)+1),'Encuentro siguiente →'):btn('catalog','Volver al recorrido')}</div></article>`;
 }
 function render(id){view=id;if(['intro',...data.sessions.map(s=>s.id)].includes(id)){state.last=id;persist();}if(id==='catalog')catalog();else if(id==='intro')intro();else session(id);root.style.setProperty('--np-size',state.size);focusTitle();}
 function open(trigger){
  const active=document.querySelector('.screen.active:not([hidden])');
  if(active!==screen){returnPoint={name:active?.dataset.screen||'home',y:scrollY,focus:trigger};route('nombres');}
  render('catalog');
 }
 function back(){
  const point=returnPoint||{name:'home',y:0};
  document.querySelectorAll('.screen[data-screen]').forEach(el=>{const on=el.dataset.screen===point.name;el.hidden=!on;el.classList.toggle('active',on);});
  point.focus?.isConnected&&point.focus.focus({preventScroll:true});window.scrollTo({top:point.y,behavior:'instant'});returnPoint=null;
 }
 document.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-nombres-open]');if(trigger){event.preventDefault();open(trigger);return;}
  if(!screen.contains(event.target))return;
  const choice=event.target.closest('[data-np-view]');if(choice){render(choice.dataset.npView);return;}
  if(event.target.closest('[data-np-back]')){back();return;}
  const size=event.target.closest('[data-np-size]');if(size){state.size=Number(size.dataset.npSize);persist();root.style.setProperty('--np-size',state.size);root.querySelectorAll('[data-np-size]').forEach(b=>b.setAttribute('aria-pressed',b===size));}
 });
 root.addEventListener('input',event=>{
  const key=event.target.dataset.npNote;if(!['idea','question','action'].includes(key)||!data.sessions.some(s=>s.id===view))return;
  state.notes[view]||={};state.notes[view][key]=event.target.value;
  const ok=persist();root.querySelector('#npSaveStatus').textContent=ok?'Guardado en este dispositivo.':'No se pudo guardar. Conserva una copia antes de salir.';
 });
 function studyEntry(){
  const anchor=document.querySelector('[data-ramak-panel="profundizar"] .ramakSourceNote');
  if(anchor&&!anchor.parentElement.querySelector('.npStudyEntry'))anchor.insertAdjacentHTML('afterend','<div class="npStudyEntry"><span>BEIT MIDRASH</span><h3>Nombres y presencia</h3><p>Siete encuentros para estudiar cómo las Escrituras hablan del Creador.</p><button type="button" data-nombres-open>Explorar este estudio →</button></div>');
 }
 if(typeof renderRamak==='function'){
  const previousRender=renderRamak;
  renderRamak=function(...args){const result=previousRender.apply(this,args);studyEntry();return result;};
 }
 studyEntry();
 view='catalog';catalog();
 if(new URLSearchParams(location.search).get('estudio')==='nombres'){
  const welcome=document.querySelector('#derejWelcome');
  if(welcome?.open)welcome.addEventListener('close',()=>queueMicrotask(()=>open(null)),{once:true});
  else open(null);
 }
})();

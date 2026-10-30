/* Recursos del pasaje: piloto Vayerá. Redacción y conexiones editoriales Dérej.
   Reutiliza la edición vigente y su memoria local; no importa traducciones externas. */
(()=>{
 'use strict';
 const KEY='derej-passage-bookmarks-v1',RESUME='derej-welcome-resume-v1';
 const STEPS=['encuentro','raiz','profundizar','practica','llevar'];
 const PEOPLE={1:['abraham','sara','itzjak'],2:['abraham','lot'],3:['lot'],4:['abraham','sara','itzjak','lot','moab','benami'],5:['hagar','ismael','abraham','sara','itzjak'],6:['abraham'],7:['abraham','itzjak','nahor','milca','betuel','rivka']};
 const TITLES=['Una tienda abierta','Escuchar el clamor','Una mano en la urgencia','Volver por la mañana','Agua en el desierto','La claridad de un acuerdo','La vida y la promesa'];
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const read=key=>{try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}};
 const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
 const pilot=()=>typeof RAMAK_DATA!=='undefined'?RAMAK_DATA?.parashot?.find(p=>p.parasha==='Vayera'):null;
 const dayData=n=>pilot()?.caminos.find(c=>Number(c.dia)===Number(n));
 const validDay=n=>Number.isInteger(Number(n))&&Number(n)>=1&&Number(n)<=7&&!!dayData(n);
 const id=n=>'Vayera|'+Number(n);
 const bookmarks=()=>{const raw=read(KEY);return Array.isArray(raw)?[...new Set(raw.filter(n=>Number.isInteger(n)&&n>=1&&n<=7))]:[];};
 const ref=s=>typeof biblicalRefEs==='function'?biblicalRefEs(s):s;
 const names={rambam:'Rambam',ramak:'Ramak',ramjal:'Ramjal',rabiNajman:'Rabí Najman',baalshemtov:'Baal Shem Tov'};
 let tab='contexto',openedDay=1,origin=null,returnPoint=null,pendingDeep=false;
 const dialog=document.createElement('dialog');
 dialog.id='passageResources';dialog.className='prDialog';dialog.setAttribute('aria-labelledby','prTitle');
 document.body.appendChild(dialog);
 const status=document.createElement('p');status.className='prSrOnly';status.setAttribute('role','status');document.body.appendChild(status);
 function announce(text){status.textContent=text;}
 function remember(){
  if(typeof currentParasha!=='function'||currentParasha()?.parasha!=='Vayera'||document.querySelector('[data-screen="camino"]')?.hidden)return;
  write(RESUME,{parasha:'Vayera',day:Number(selectedDay),step:STEPS.includes(selectedRamakStep)?selectedRamakStep:'encuentro',updatedAt:new Date().toISOString()});
 }
 function urlForDay(n){return 'https://parashot.com.ar/?section=parashot&parasha=vayera&aliya='+Number(n);}
 function verse(c){return `<section class="prVerse"><p class="prEyebrow">PASAJE · ${esc(ref(c.pasuk.ref))}</p><p lang="he" dir="rtl" class="prHebrew">${esc(normalizeHebrewText(c.pasuk.hebreo))}</p><p>${esc(c.pasuk.es)}</p><small>Paráfrasis Dérej · redacción propia en español. No es una traducción literal.</small></section>`;}
 function context(c){return `${verse(c)}<section><p class="prEyebrow">CONTEXTO · SÍNTESIS DÉREJ</p><h3>Volver a la escena</h3><p>${esc(c.rootNote)}</p><a class="prPrimary" href="${urlForDay(c.dia)}" target="_blank" rel="noopener noreferrer" hreflang="es">Leer la ${c.dia}ª aliyá completa ↗</a><p class="prSmall">Lectura en español en Parashot.com.ar. Se abre aparte para conservar tu lugar y la música.</p></section>`;}
 function voices(c){return `<p class="prIntro">Estas fuentes ofrecen un marco de estudio. La conexión con el pasaje y su aplicación cotidiana son elaboraciones de Dérej.</p>${Object.entries(c.voces).map(([key,v])=>`<article class="prVoice"><p class="prEyebrow">${esc(names[key]||key)}</p><h3>${esc(v.fuente)}</h3><p class="prSmall">MARCO DE LA FUENTE · SÍNTESIS DÉREJ</p><p>${esc(v.base)}</p><details><summary>Leer la aplicación de Dérej</summary><p>${esc(v.texto)}</p><p class="prSmall">${esc(v.atribucion)}</p></details></article>`).join('')}<p class="prSmall">Las referencias permiten contrastar estas síntesis con tu edición de las obras. No se reproducen aquí traducciones de terceros.</p>${c.voces.baalshemtov?.url?`<a href="${esc(c.voces.baalshemtov.url)}" target="_blank" rel="noopener noreferrer" hreflang="es">Consultar la exposición de Gal Einai en español ↗</a>`:''}`;}
 function people(c){
  const api=document.getElementById('derej-raices-v2')?.genealogy;
  return `<p class="prIntro">Conoce a las personas de esta aliyá y su lugar en las familias del relato.</p><div class="prPeople">${PEOPLE[c.dia].filter(pid=>api?.people[pid]).map(pid=>`<button type="button" data-pr-person="${pid}"><b>${esc(api.people[pid].name)}</b><span>${esc(api.people[pid].alias||'Estudio en Biblioteca')}</span><small>Leer su historia →</small></button>`).join('')}</div><p class="prSmall">La selección sigue el pasaje del día; las fichas pueden recorrer otros episodios de la vida del personaje. La genealogía registra parentescos, sin establecer una jerarquía entre personas.</p>`;
 }
 function mine(c){
  const saved=bookmarks(),resume=read(RESUME),completed=read('derej-v23-camino-progress')?.completed||{};
  const note=typeof loadRamakMemory==='function'?loadRamakMemory('Vayera',c.dia)?.note:null;
  return `<section><p class="prEyebrow">MI LECTURA · PRIVADA</p><h3>Una huella para volver</h3><p>Guarda este pasaje para encontrarlo después. Guardarlo no lo marca como terminado.</p><button type="button" class="prPrimary" data-pr-bookmark aria-pressed="${saved.includes(Number(c.dia))}">${saved.includes(Number(c.dia))?'✓ Lectura guardada · Quitar':'Guardar esta lectura'}</button><p id="prSaveStatus" role="status" class="prSmall"></p><h3>Mis lecturas de Vayerá</h3>${saved.length?`<div class="prSaved">${saved.map(n=>`<button type="button" data-pr-day="${n}">${n}ª aliyá · ${esc(TITLES[n-1])} →</button>`).join('')}</div>`:'<p>Aquí aparecerán las lecturas que elijas guardar.</p>'}<p class="prSmall">${completed[id(c.dia)]?'Este estudio está marcado como realizado en Mi Camino.':'Este estudio aún no está marcado como realizado en Mi Camino.'}</p><h3>Mi reflexión</h3>${note?`<p class="prPrivateNote">${esc(note)}</p>`:'<p>Puedes escribir una reflexión en Práctica y volver a ella desde Mi Camino.</p>'}<button type="button" class="prSecondary" data-pr-practice>${note?'Volver a mi reflexión':'Escribir una reflexión'} →</button>${resume?.parasha==='Vayera'&&validDay(resume.day)?`<p class="prSmall">Puedes retomar tu última etapa desde «Comenzar / volver» → «Ya he estado aquí».</p>`:''}<p class="prPrivacy">Guardado sólo en este navegador. Si borras sus datos, puedes perder tus lecturas y reflexiones; no se sincronizan entre dispositivos.</p></section>`;
 }
 function draw(focus=false){
  const c=dayData(openedDay);if(!c)return;
  dialog.innerHTML=`<header class="prHeader"><div><p class="prEyebrow">DÉREJ · RECURSOS DEL PASAJE</p><h2 id="prTitle" tabindex="-1">Vayerá · ${c.dia}ª aliyá</h2><p>${esc(ref(c.aliyaRange))}</p></div><button type="button" class="prClose" data-pr-close aria-label="Cerrar recursos y volver a la lectura">×</button></header><nav class="prDays" aria-label="Explorar las siete aliyot de Vayerá">${[1,2,3,4,5,6,7].map(n=>`<button type="button" data-pr-day="${n}" aria-label="${n}ª aliyá: ${esc(TITLES[n-1])}" aria-pressed="${Number(c.dia)===n}">${n}</button>`).join('')}</nav><nav class="prTabs" aria-label="Recursos del pasaje">${[['contexto','El pasaje'],['voces','Voces'],['personas','Personajes'],['mi','Mi lectura']].map(([key,label])=>`<button type="button" data-pr-tab="${key}" aria-controls="prContent" aria-pressed="${tab===key}">${label}</button>`).join('')}</nav><div id="prContent" class="prContent">${tab==='voces'?voices(c):tab==='personas'?people(c):tab==='mi'?mine(c):context(c)}</div><footer class="prFooter"><button type="button" class="prSecondary" data-pr-close>Volver al punto de lectura</button></footer>`;
  if(focus){dialog.scrollTop=0;dialog.querySelector('#prTitle').focus({preventScroll:true});}
 }
 function open(n,trigger,section='contexto'){
  if(!validDay(n)){announce('El estudio está cargando. Vuelve a intentarlo en un momento.');return;}
  origin={trigger,y:window.scrollY};openedDay=Number(n);tab=section;draw();
  dialog.showModal();dialog.querySelector('#prTitle').focus({preventScroll:true});remember();
 }
 function close(){if(dialog.open)dialog.close();}
 function select(n,step=selectedRamakStep){
  if(!validDay(n))return;
  if(typeof saveRamakDraft==='function'&&currentParasha()?.parasha==='Vayera')saveRamakDraft();
  selectedParasha='Vayera';selectedDay=Number(n);selectedRamakStep=STEPS.includes(step)?step:'profundizar';
  renderRamak(false);remember();
 }
 function enter(n=1,section='contexto'){
  if(!validDay(n)){announce('El estudio está cargando. Vuelve a intentarlo en un momento.');return;}
  openCamino(n,'raiz');open(n,document.querySelector('.ramakPanel.on [data-pr-open]'),section);
 }
 function openCamino(day,step){
  const resuming=window.DEREJ_INTRO_RESUMING;
  window.DEREJ_INTRO_RESUMING=true;
  try{route('camino');select(day,step);}finally{window.DEREJ_INTRO_RESUMING=resuming;}
 }
 function attach(){
  const p=typeof currentParasha==='function'?currentParasha():null,c=typeof currentCamino==='function'?currentCamino():null;
  if(p?.parasha!=='Vayera'||!c)return;
  for(const stage of ['profundizar']){
   const body=document.querySelector(`[data-ramak-panel="${stage}"] .ramakBody`);
   if(!body||body.querySelector('[data-pr-open]'))continue;
   const block=document.createElement('div');block.className='prEntry';
   block.innerHTML=`<div><small>UNA LECTURA, VARIOS CAMINOS</small><b>El pasaje y sus conexiones</b><span>Contexto · voces · personajes · guardar</span></div><button type="button" data-pr-open aria-haspopup="dialog" aria-controls="passageResources">Profundizar en el pasaje ↗</button>`;
   const nav=body.querySelector('.ramakNav');if(nav)nav.before(block);else body.appendChild(block);
  }
 }
 function deepLink(){
  if(!pendingDeep||!pilot())return;
  const welcome=document.querySelector('#derejWelcome');if(welcome?.open)return;
  pendingDeep=false;const day=Number(new URLSearchParams(location.search).get('dia')||1);
  if(!validDay(day)){announce('No existe esa aliyá. Elige una de las siete lecturas de Vayerá.');return;}
  enter(day);
 }
 const prev=renderRamak;
 renderRamak=function(...args){const value=prev.apply(this,args);attach();queueMicrotask(deepLink);return value;};
 const previousStep=activateRamakStep;
 activateRamakStep=function(...args){const value=previousStep.apply(this,args);remember();return value;};
 dialog.addEventListener('close',()=>{
  document.querySelectorAll('[data-pr-open]').forEach(b=>b.setAttribute('aria-expanded','false'));
  const trigger=origin?.trigger?.isConnected?origin.trigger:document.querySelector('.ramakPanel.on [data-pr-open]');
  if(trigger&&!document.querySelector('[data-screen="camino"]').hidden)trigger.focus({preventScroll:true});
  if(origin&&!document.querySelector('[data-screen="camino"]').hidden)window.scrollTo({top:origin.y,behavior:'instant'});
 });
 dialog.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-pr-close')){close();return;}
  if(button.dataset.prTab){tab=button.dataset.prTab;draw();dialog.querySelector(`[data-pr-tab="${tab}"]`).focus({preventScroll:true});return;}
  if(button.dataset.prDay){openedDay=Number(button.dataset.prDay);select(openedDay);draw(true);return;}
  if(button.hasAttribute('data-pr-bookmark')){
   const saved=bookmarks(),n=openedDay,next=saved.includes(n)?saved.filter(x=>x!==n):[...saved,n].sort((a,b)=>a-b);
   if(!write(KEY,next)){document.getElementById('prSaveStatus').textContent='No pudimos guardar en este navegador. Revisa si permite almacenamiento local.';return;}
   draw();dialog.querySelector('[data-pr-bookmark]').focus({preventScroll:true});document.getElementById('prSaveStatus').textContent=next.includes(n)?'Lectura guardada en este navegador.':'Lectura retirada de tus guardadas.';return;
  }
  if(button.hasAttribute('data-pr-practice')){origin=null;close();activateRamakStep('practica',false);document.getElementById('ramakNote')?.focus();return;}
  if(button.dataset.prPerson){
   const api=document.getElementById('derej-raices-v2')?.genealogy,pid=button.dataset.prPerson;
   if(!api?.people[pid]||!api.openStudy)return;
   returnPoint={day:openedDay,step:selectedRamakStep,y:origin?.y||0,url:location.href};
   close();route('genealogias');api.openStudy(pid);
   let back=document.getElementById('prReturnToPassage');
   if(!back){back=document.createElement('button');back.id='prReturnToPassage';back.type='button';back.className='prReturn';document.querySelector('.genealogyInner').prepend(back);}
   back.hidden=false;back.textContent=`← Volver a Vayerá · ${openedDay}ª aliyá`;
  }
 });
 document.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-pr-open]');
  if(trigger){trigger.setAttribute('aria-expanded','true');open(selectedDay,trigger);return;}
  if(event.target.closest('[data-pr-pilot]')){event.preventDefault();enter(1);return;}
  if(event.target.closest('[data-pr-saved]')){event.preventDefault();enter(bookmarks()[0]||1,'mi');return;}
  if(event.target.closest('#prReturnToPassage')&&returnPoint){
   const point=returnPoint;returnPoint=null;event.target.closest('button').hidden=true;
   history.replaceState(history.state,'',point.url);openCamino(point.day,point.step);window.scrollTo({top:point.y,behavior:'instant'});
   open(point.day,document.querySelector('.ramakPanel.on [data-pr-open]'),'personas');
  }
 });
 const originalRoute=route;
 route=function(name,...args){
  if(dialog.open)close();
  if(name!=='genealogias'&&name!=='camino'){returnPoint=null;const back=document.getElementById('prReturnToPassage');if(back)back.hidden=true;}
  return originalRoute.call(this,name,...args);
 };
 pendingDeep=new URLSearchParams(location.search).get('estudio')==='profundizar';
 document.querySelector('#derejWelcome')?.addEventListener('close',()=>queueMicrotask(deepLink));
 attach();deepLink();
})();

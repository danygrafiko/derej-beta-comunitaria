/* DÉREJ · Bienvenida y orientación. Sólo preferencias locales; no modifica consentimiento ni reflexiones. */
(()=>{
  'use strict';
  const INTRO_KEY='derej-welcome-v1', RESUME_KEY='derej-welcome-resume-v1';
  const STEPS=['encuentro','raiz','profundizar','practica','llevar'];
  const STEP_NAMES=['Encuentro','Raíz','Profundizar','Práctica','Llevar'];
  const read=(key)=>{try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
  const esc=(value)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let guideStep=0,destination='camino',pending=null,working=false,suspendCapture=false,priorFocus=null;
  const dialog=document.createElement('dialog');
  dialog.id='derejWelcome';dialog.className='welcomeDialog';dialog.setAttribute('aria-labelledby','welcomeTitle');
  document.body.appendChild(dialog);
  function validResume(value,data){
    if(!value||typeof value!=='object'||typeof value.parasha!=='string'||!Number.isInteger(value.day)||value.day<1||value.day>7||!STEPS.includes(value.step))return null;
    if(data&&!data.parashot?.some(p=>p.parasha===value.parasha&&p.caminos?.some(c=>Number(c.dia)===value.day)))return null;
    return value;
  }
  function currentData(){return typeof RAMAK_DATA!=='undefined'?RAMAK_DATA:null;}
  function getResume(){return validResume(read(RESUME_KEY),currentData());}
  function remember(){
    if(suspendCapture||dialog.open||!currentData()||document.querySelector('[data-screen="camino"]')?.hidden)return;
    const value={parasha:selectedParasha,day:Number(selectedDay),step:selectedRamakStep,updatedAt:new Date().toISOString()};
    if(validResume(value,currentData()))write(RESUME_KEY,value);
  }
  function frame(kicker,title,description){return `<header class="welcomeBrand"><strong>DÉREJ</strong><span>EL CAMINO</span></header><div class="welcomeBody"><div class="welcomeHero"><div class="welcomeDoor" aria-hidden="true">ד</div><div class="welcomeEyebrow">${kicker}</div><h1 id="welcomeTitle" tabindex="-1">${title}</h1><p>${description}</p></div>`;}
  function statusMarkup(){return '<p class="welcomeStatus" id="welcomeStatus" role="status" aria-live="polite"></p></div>';}
  function focusTitle(){dialog.scrollTop=0;dialog.querySelector('#welcomeTitle')?.focus({preventScroll:true});}
  function open(){
    if(dialog.open)return;
    priorFocus=document.activeElement;
    dialog.showModal();
  }
  function close(){dialog.close();pending=null;working=false;priorFocus?.isConnected&&priorFocus.focus({preventScroll:true});}
  function home(){write(INTRO_KEY,{completed:true});close();route('home');document.getElementById('homeTitle')?.focus({preventScroll:true});}
  function entry(){
    dialog.innerHTML=frame('Bienvenido a Dérej','Hay un lugar para ti.','Un lugar para estudiar, escuchar y llevar lo aprendido a la vida cotidiana. Puedes recorrerlo a tu propio ritmo.')+`<h2 class="welcomeQuestion">¿Es tu primera visita?</h2><div class="welcomeChoices"><article class="welcomeChoice"><div class="welcomeEyebrow">Comenzar</div><h2>Es mi primera vez</h2><p>Te acompañamos a conocer la casa y dar tu primer paso. No necesitas conocimientos previos.</p><button type="button" class="welcomePrimary" data-welcome="new">Conocer Dérej →</button></article><article class="welcomeChoice"><div class="welcomeEyebrow">Regresar</div><h2>Ya he estado aquí</h2><p>Qué bueno encontrarte de nuevo. Elige por dónde continuar hoy.</p><button type="button" class="welcomeSecondary" data-welcome="return">Volver a entrar →</button></article></div><p class="welcomeFoot"><button type="button" class="welcomeQuiet" data-welcome="skip">Explorar por mi cuenta</button></p>`+statusMarkup();open();focusTitle();
  }
  function returning(){
    const saved=getResume();
    dialog.innerHTML=frame('Bienvenido de vuelta','Qué bueno encontrarte de nuevo.','¿Por dónde quieres seguir hoy?')+`<div class="welcomeGuide"><div class="welcomeReturn">${saved?`<button type="button" class="welcomePrimary" data-welcome="resume">Continuar donde quedé →</button><p class="welcomeResumeMeta">${esc(saved.parasha)} · Día ${saved.day} · ${STEP_NAMES[STEPS.indexOf(saved.step)]}<br>Guardado en este navegador.</p>`:''}<button type="button" class="welcomeSecondary" data-welcome="study">Estudio de hoy · Camino →</button><button type="button" class="welcomeSecondary" data-welcome="radio">Escuchar Radio Dérej →</button><button type="button" class="welcomeSecondary" data-welcome="skip">Ir al patio →</button></div><p class="welcomeFoot"><button type="button" class="welcomeQuiet" data-welcome="new">Quiero conocer la casa</button><button type="button" class="welcomeQuiet" data-welcome="entry">Volver a la bienvenida</button></p></div>`+statusMarkup();open();focusTitle();
  }
  function guide(){
    const picks=[['camino','Estudiar hoy','Abrir el recorrido de la parashá y elegir un encuentro.'],['radio','Escuchar Radio Dérej','Elegir una playlist para acompañar este momento.'],['home','Explorar el patio','Recorrer las cinco puertas a tu propio ritmo.']];
    const content=[`<h2>Conoce la casa</h2><p>El patio reúne cinco puertas. Puedes entrar por la que resuene contigo y regresar al centro cuando quieras.</p><div class="welcomeRooms"><div><b>Camino</b><small>Estudio de la Torá: una pregunta, una raíz y una práctica cotidiana.</small></div><div><b>Radio</b><small>Música, meditación y oración para acompañar el estudio y la pausa.</small></div><div><b>Shabat</b><small>Un espacio para recibir, compartir y descansar.</small></div><div><b>Moed</b><small>Acercarte a los tiempos señalados y sus enseñanzas.</small></div><div><b>Mi Camino</b><small>Volver a tus reflexiones y a lo que decidiste guardar.</small></div></div>`,`<h2>¿Cómo te gustaría comenzar?</h2><p>Puedes cambiar de espacio cuando quieras.</p>${picks.map(([id,title,text])=>`<button type="button" class="welcomePick" data-welcome-destination="${id}" aria-pressed="${destination===id}">${title}<small>${text}</small></button>`).join('')}`,`<h2>Lleva algo contigo</h2><p>Cada visita puede dejarte una pregunta, una reflexión o una pequeña acción para tu día.</p><p>En Camino encontrarás cinco momentos: <b>Encuentro, Raíz, Profundizar, Práctica y Llevar.</b> Puedes detenerte y volver a tu ritmo.</p><p><b>Tu primer paso: ${picks.find(p=>p[0]===destination)?.[1]||'Explorar el patio'}.</b></p><p class="welcomeNotice welcomePrivacyHint">Tus reflexiones permanecen en este dispositivo. Esta bienvenida recuerda tu elección en este navegador. Puedes consultar o cambiar la preferencia de métricas en «Privacidad y métricas», al pie del patio.</p>`];
    dialog.innerHTML=frame('Tu primer recorrido',['Una casa para descubrir.','Un paso a tu ritmo.','El camino continúa en tu día.'][guideStep],'Una orientación breve para entrar con confianza.')+`<div class="welcomeGuide"><p class="welcomeResumeMeta">Paso ${guideStep+1} de 3</p><div class="welcomeProgress" aria-hidden="true">${[0,1,2].map(i=>`<span class="${i<=guideStep?'on':''}"></span>`).join('')}</div><div class="welcomeGuideCard">${content[guideStep]}</div><div class="welcomeGuideNav"><button type="button" class="welcomeSecondary" data-welcome="back">← ${guideStep===0?'Bienvenida':'Anterior'}</button><button type="button" class="welcomePrimary" data-welcome="next">${guideStep===2?'Entrar a Dérej →':'Continuar →'}</button></div><p class="welcomeFoot"><button type="button" class="welcomeQuiet" data-welcome="skip">Omitir la guía e ir al patio</button></p></div>`+statusMarkup();focusTitle();
  }
  function error(text){working=false;pending=null;dialog.querySelectorAll('button').forEach(b=>b.disabled=false);const status=dialog.querySelector('#welcomeStatus');if(status)status.textContent=text;}
  function enter(target,mode='today'){
    if(working)return;
    if(target==='camino'&&!currentData()){
      pending={target,mode};const status=dialog.querySelector('#welcomeStatus');if(status)status.textContent='Preparando el estudio… Puedes ir al patio mientras carga.';
      if(typeof ramakLoadError!=='undefined'&&ramakLoadError){error('No pudimos cargar el estudio. Inténtalo de nuevo o entra al patio.');loadRamak();}
      return;
    }
    working=true;
    let saved=mode==='resume'?getResume():null;
    if(mode==='resume'&&!saved){error('Ese encuentro ya no está disponible. Puedes abrir el estudio de hoy o ir al patio.');return;}
    suspendCapture=true;
    try{
      if(saved)window.DEREJ_INTRO_RESUMING=true;
      route(target);
      if(saved){selectedParasha=saved.parasha;selectedDay=saved.day;selectedRamakStep=saved.step;renderRamak(false);activateRamakStep(saved.step,false);}
      write(INTRO_KEY,{completed:true});close();
      const active=document.querySelector('[data-screen].active');
      if(saved){const rail=active?.querySelector('.ramakThresholdRail');rail?.scrollIntoView({behavior:'instant',block:'start'});const button=rail?.querySelector(`[data-ramak-step="${saved.step}"]`);button?.focus({preventScroll:true});}
      else{const heading=active?.querySelector('h1,h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
    }catch(e){error('No pudimos abrir ese espacio. Inténtalo de nuevo o entra al patio.');}
    finally{window.DEREJ_INTRO_RESUMING=false;suspendCapture=false;working=false;}
    if(target==='camino')remember();
  }
  const previousRender=renderRamak;
  renderRamak=function(...args){const value=previousRender.apply(this,args);if(pending&&currentData()){const action=pending;pending=null;queueMicrotask(()=>{if(dialog.open)enter(action.target,action.mode);});}return value;};
  const previousStep=activateRamakStep;
  activateRamakStep=function(...args){const value=previousStep.apply(this,args);remember();return value;};
  dialog.addEventListener('click',e=>{
    const pick=e.target.closest('[data-welcome-destination]');if(pick){destination=pick.dataset.welcomeDestination;dialog.querySelectorAll('[data-welcome-destination]').forEach(b=>b.setAttribute('aria-pressed',String(b===pick)));return;}
    const action=e.target.closest('[data-welcome]')?.dataset.welcome;if(!action)return;
    pending=null;
    if(action==='entry')entry();else if(action==='new'){guideStep=0;guide();}else if(action==='return')returning();else if(action==='skip')home();else if(action==='back'){if(guideStep===0)entry();else{guideStep--;guide();}}else if(action==='next'){if(guideStep===2)enter(destination);else{guideStep++;guide();}}else if(action==='study')enter('camino');else if(action==='radio')enter('radio');else if(action==='resume')enter('camino','resume');
  });
  dialog.addEventListener('cancel',e=>{e.preventDefault();home();});
  document.addEventListener('click',e=>{if(e.target.closest('[data-welcome-open]')){remember();entry();}});
  const priorRoute=route;
  route=function(...args){if(args[0]!=='camino')remember();return priorRoute.apply(this,args);};
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')remember();});
  if(read(INTRO_KEY)?.completed!==true)entry();
})();

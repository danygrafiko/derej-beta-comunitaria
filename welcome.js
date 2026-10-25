/* DÉREJ · Bienvenida y orientación. Sólo preferencias locales; no modifica consentimiento ni reflexiones. */
(()=>{
  'use strict';
  const INTRO_KEY='derej-welcome-v1', RESUME_KEY='derej-welcome-resume-v1';
  const STEPS=['encuentro','raiz','profundizar','practica','llevar'];
  const STEP_NAMES=['Encuentro','Raíz','Profundizar','Práctica','Llevar'];
  const read=(key)=>{try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
  const esc=(value)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let guideStep=0,pending=null,working=false,suspendCapture=false,priorFocus=null;
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
  function home(){write(INTRO_KEY,{completed:true});close();route('home');const title=document.getElementById('homeTitle');if(title){title.tabIndex=-1;title.focus({preventScroll:true});}}
  function entry(){
    dialog.innerHTML=frame('Bienvenido a Dérej','Hay un lugar para ti.','Un portal abierto a toda persona que quiera acercarse al Creador de todo, estudiar y aprender a amar a los demás.')+`<h2 class="welcomeQuestion">¿Es tu primera visita?</h2><div class="welcomeChoices"><article class="welcomeChoice"><div class="welcomeEyebrow">Comenzar</div><h2>Es mi primera vez</h2><p>Te acompañamos a conocer la casa y dar tu primer paso. No necesitas conocimientos previos.</p><button type="button" class="welcomePrimary" data-welcome="new">Conocer Dérej →</button></article><article class="welcomeChoice"><div class="welcomeEyebrow">Regresar</div><h2>Ya he estado aquí</h2><p>Qué bueno encontrarte de nuevo. Elige por dónde continuar hoy.</p><button type="button" class="welcomeSecondary" data-welcome="return">Volver a entrar →</button></article></div><div class="welcomePurpose"><p>Este portal no tiene objetivos religiosos ni persigue fines económicos.</p><p>Nos reúne el deseo de amarnos los unos a los otros. Para nosotros, todas las almas tienen el mismo valor ante el Creador.</p></div><p class="welcomeFoot"><button type="button" class="welcomeQuiet" data-welcome="skip">Entrar directamente al patio</button></p>`+statusMarkup();open();focusTitle();
  }
  function returning(){
    const saved=getResume();
    dialog.innerHTML=frame('Bienvenido de vuelta','Qué bueno encontrarte de nuevo.','¿Por dónde quieres seguir hoy?')+`<div class="welcomeGuide"><div class="welcomeReturn">${saved?`<button type="button" class="welcomePrimary" data-welcome="resume">Continuar donde quedé →</button><p class="welcomeResumeMeta">${esc(saved.parasha)} · Día ${saved.day} · ${STEP_NAMES[STEPS.indexOf(saved.step)]}<br>Guardado en este navegador.</p>`:''}<button type="button" class="welcomeSecondary" data-welcome="study">Estudio de hoy · Camino →</button><button type="button" class="welcomeSecondary" data-welcome="radio">Escuchar Radio Dérej →</button><button type="button" class="welcomeSecondary" data-welcome="skip">Ir al patio →</button></div><p class="welcomeFoot"><button type="button" class="welcomeQuiet" data-welcome="new">Quiero conocer la casa</button><button type="button" class="welcomeQuiet" data-welcome="entry">Volver a la bienvenida</button></p></div>`+statusMarkup();open();focusTitle();
  }
  const GUIDE=[
    {
      title:'Un encuentro abierto a todos.',
      content:`<h2>Lo que nos reúne</h2><p>Dérej significa «camino». Este portal nace para acompañar a toda persona que quiera acercarse al Creador de todo y cultivar una vida más consciente, amorosa y responsable.</p><p><b>No tenemos objetivos religiosos.</b> La participación es libre y no exige pertenecer a una religión ni adoptar una identidad religiosa. Aquí puedes estudiar, preguntar y compartir desde tu propia historia.</p><p>Nos orienta el deseo de <b>amarnos los unos a los otros</b>. Sostenemos que <b>todas las almas tienen el mismo valor para el Creador</b>: cada persona merece respeto, escucha y un lugar digno, cualquiera sea su origen, creencia o trayectoria.</p><p>Somos una comunidad no judía que se acerca a la Torá y a sus sabios con gratitud y respeto por la tradición judía. Procuramos reconocer el contexto de sus enseñanzas y traducir lo aprendido en gestos de cuidado hacia los demás.</p><p>En la voz editorial de Dérej usamos «el Creador» y «el Creador de todo» como expresiones de cercanía y reverencia. Son formas descriptivas en español, no nombres hebreos ni traducciones literales de todos los nombres bíblicos. Conservamos la redacción de las citas y explicamos los nombres de cada fuente en su contexto.</p><p class="welcomePrinciple"><b>No perseguimos fines económicos.</b> El propósito de este espacio es compartir el estudio, el encuentro y la práctica cotidiana.</p>`
    },
    {
      title:'Las letras nos acercan a la raíz.',
      content:`<h2>El hebreo, lengua original de la Torá</h2><p>La Torá está escrita en hebreo. Acercarnos a esta lengua nos permite reconocer sus palabras en su forma original, escuchar sus sonidos y explorar matices que una traducción puede expresar de otra manera.</p><p>Su alfabeto, llamado <b>alef-bet</b>, tiene veintidós letras. Aprender sus formas, nombres y sonidos es un primer paso para familiarizarnos con la escritura. No necesitas saber hebreo para comenzar: iremos letra por letra, con paciencia y curiosidad.</p><h3>La mirada de los sabios místicos y cabalistas</h3><p>En la mística judía, que alimenta la tradición cabalística, las letras reciben también una lectura espiritual y simbólica. El <i>Séfer Yetzirá</i> habla de veintidós letras fundamentales y relaciona su formación con la voz, el aliento y la articulación.</p><p>Desde esta perspectiva, contemplar las letras invita a reflexionar sobre el vínculo entre palabra, creación y vida interior. Nos acercamos a estas enseñanzas como interpretaciones de una tradición espiritual, con respeto por sus fuentes.</p><p>En Dérej, reconocer, pronunciar y trazar una letra es una práctica de atención: detenernos, observar y acercarnos al texto con mayor presencia. Cada aprendizaje puede ayudarnos también a cuidar las palabras que dirigimos a otros.</p><details class="welcomeSources"><summary>Fuentes para este acercamiento</summary><p>Referencia de la lectura mística: Séfer Yetzirá 1:2 y 2:1. La numeración puede variar entre versiones. La aplicación a la atención y al cuidado de la palabra es nuestra propuesta de práctica.</p></details>`
    },
    {
      title:'El tiempo también puede enseñarnos.',
      content:`<h2>¿Por qué los tiempos y las fiestas?</h2><p>La Torá llama <i>moadim</i> a sus tiempos señalados. Levítico 23:2–4 presenta estas ocasiones y el Shabat como momentos para detener la rutina y dar un sentido especial al tiempo compartido.</p><p>Las festividades pertenecen a la historia y a la tradición de Israel. En Dérej las estudiamos con respeto por ese contexto y nos preguntamos qué pueden despertar en nuestra manera de vivir.</p><div class="welcomeSeasons"><div><b>Shabat · detenernos y descansar</b><p>Nos invita a mirar el valor del descanso, la presencia y el encuentro, y a dejar espacio para recibir a otros.</p></div><div><b>Pésaj · recordar la libertad</b><p>La memoria de la salida de Egipto abre preguntas sobre la dignidad, la gratitud y nuestra responsabilidad frente a quien vive oprimido.</p></div><div><b>Sukot · habitar con gratitud</b><p>El recuerdo de las cabañas del desierto nos permite reflexionar sobre la fragilidad, la hospitalidad y aquello que sostiene nuestra vida.</p></div><div><b>Iom Kipur · revisar y reparar</b><p>Su llamado a la expiación y la purificación nos ofrece un tiempo de reflexión sobre nuestros actos, el daño que necesitamos reconocer y los vínculos que podemos cuidar.</p></div></div><p>Estas preguntas son una invitación de Dérej al estudio y a la reflexión. La participación no exige observancia religiosa. Cada persona puede acercarse libremente, con respeto por su conciencia y por la tradición que estudiamos.</p><details class="welcomeSources"><summary>Fuentes y contexto</summary><p>Los tiempos señalados y el Shabat: Levítico 23:2–4. La memoria de la salida: Éxodo 13:3. Las cabañas: Levítico 23:42–43. Iom Kipur: Levítico 16:30. Las aplicaciones al cuidado, la hospitalidad y la vida cotidiana son propuestas de reflexión de Dérej.</p></details>`
    },
    {
      title:'El patio es nuestro punto de encuentro.',
      content:`<h2>Un patio para recorrer a tu ritmo</h2><p>Al entrar a Dérej llegarás al patio. Puedes contemplarlo en silencio o pulsar <b>«Explorar el patio»</b> para mostrar sus accesos. Con «Contemplar el patio» vuelves a ocultarlos; Dérej recuerda tu elección en este navegador.</p><div class="welcomeRooms"><div><b>Camino</b><small>La parashá —porción semanal de la Torá— se acerca a tu vida mediante preguntas, fuentes y una práctica concreta.</small></div><div><b>Biblioteca · junto a los libros</b><small>Casa de estudio o Beit Midrash. Aquí encuentras «Nombres y presencia» y «Voces del Camino», con vidas, obras y enseñanzas de los sabios. Las siete lecturas de Hilel están dentro de su ficha.</small></div><div><b>Árbol de la Vida · en el olivo</b><small>Un espacio propio para acercarte a las sefirot, contemplar una enseñanza y llevar una intención a la vida cotidiana.</small></div><div><b>Aprender · sobre el agua del Pozo</b><small>La entrada al Taller de la Memoria: letras hebreas, palabras, trazado y juegos para aprender a tu ritmo. Se muestra al explorar el patio, junto con las demás puertas.</small></div><div><b>Shabat</b><small>Conoce sus prácticas en la tradición judía y explora propuestas de Dérej para el descanso, la gratitud y el encuentro.</small></div><div><b>Moed</b><small>Estudia los tiempos señalados y consulta sus fechas por año, con la opción de Israel o diáspora.</small></div><div><b>Radio</b><small>Música para acompañar el estudio, el silencio y los momentos de pausa. Puedes explorar las colecciones disponibles.</small></div></div><h3>¿Dónde encuentro Mi Camino?</h3><p>Entra a <b>Camino</b> y pulsa <b>«Mi Camino · Mis huellas y recuerdos»</b>. Allí puedes volver a las reflexiones y memorias que decidiste guardar en este navegador y dispositivo.</p><p>En cada espacio, los botones con una flecha hacia abajo te llevan al contenido que continúa al deslizar. Puedes regresar al patio con el botón «Patio» o con el nombre Dérej en la parte superior.</p><p>No hace falta recorrerlo todo en una visita. Puedes estudiar un poco, escuchar una canción o simplemente detenerte antes de continuar tu día.</p>`
    },
    {
      title:'Un pequeño paso puede dar fruto.',
      content:`<h2>Lo aprendido continúa en la vida</h2><p>En Camino encontrarás cinco momentos: <b>Encuentro, Raíz, Profundizar, Práctica y Llevar</b>. Te ayudan a pasar de una pregunta al texto, del texto a la reflexión y de la reflexión a una acción posible.</p><p>Una visita puede dejarte una palabra, una pregunta o un gesto: escuchar con más atención, agradecer, reparar una conversación o acompañar a alguien que lo necesita.</p><p>El sentido de este portal se expresa en cómo nos tratamos. Queremos acercarnos al Creador de todo y aprender a amarnos los unos a los otros, reconociendo el mismo valor en cada alma.</p><p><b>Al pulsar «Entrar a Dérej» llegarás al patio.</b> Allí podrás elegir por dónde comenzar.</p><p class="welcomeNotice welcomePrivacyHint">Tu avance y tus reflexiones se guardan en este navegador. Al cambiar de navegador o dispositivo no se trasladan automáticamente; si borras sus datos, puedes perderlos. Esta bienvenida recuerda aquí tu elección. Puedes consultar o cambiar la preferencia de métricas en «Privacidad y métricas», al pie del patio.</p>`
    }
  ];
  function guide(){
    const page=GUIDE[guideStep],last=guideStep===GUIDE.length-1;
    dialog.innerHTML=frame('Tu primer recorrido',page.title,'Conoce el sentido de este espacio y encuentra tu propia forma de recorrerlo.')+`<div class="welcomeGuide"><p class="welcomeResumeMeta">Paso ${guideStep+1} de ${GUIDE.length}</p><div class="welcomeProgress" aria-hidden="true">${GUIDE.map((_,i)=>`<span class="${i<=guideStep?'on':''}"></span>`).join('')}</div><div class="welcomeGuideCard">${page.content}</div><div class="welcomeGuideNav"><button type="button" class="welcomeSecondary" data-welcome="back">← ${guideStep===0?'Bienvenida':'Anterior'}</button><button type="button" class="welcomePrimary" data-welcome="next">${last?'Entrar a Dérej →':'Continuar →'}</button></div><p class="welcomeFoot"><button type="button" class="welcomeQuiet" data-welcome="skip">Omitir la guía e ir al patio</button></p></div>`+statusMarkup();focusTitle();
  }
  function error(text){working=false;pending=null;dialog.querySelectorAll('button').forEach(b=>b.disabled=false);const status=dialog.querySelector('#welcomeStatus');if(status)status.textContent=text;}
  function enter(target,mode='today'){
    if(working)return;
    if(target==='camino'&&!currentData()){
      pending={target,mode};const status=dialog.querySelector('#welcomeStatus');if(status)status.textContent='Preparando el estudio… Puedes ir al patio mientras carga.';
      if(typeof ramakLoadError!=='undefined'&&ramakLoadError)loadRamak();
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
  document.addEventListener('derej-study-load-failed',()=>{
    if(pending&&dialog.open)error('No pudimos cargar el estudio. Comprueba tu conexión y vuelve a pulsar la opción elegida, o entra al patio.');
  });
  const previousRender=renderRamak;
  renderRamak=function(...args){const value=previousRender.apply(this,args);if(pending&&currentData()){const action=pending;pending=null;queueMicrotask(()=>{if(dialog.open)enter(action.target,action.mode);});}return value;};
  const previousStep=activateRamakStep;
  activateRamakStep=function(...args){const value=previousStep.apply(this,args);remember();return value;};
  dialog.addEventListener('click',e=>{
    const action=e.target.closest('[data-welcome]')?.dataset.welcome;if(!action)return;
    pending=null;
    if(action==='entry')entry();else if(action==='new'){guideStep=0;guide();}else if(action==='return')returning();else if(action==='skip')home();else if(action==='back'){if(guideStep===0)entry();else{guideStep--;guide();}}else if(action==='next'){if(guideStep===GUIDE.length-1)home();else{guideStep++;guide();}}else if(action==='study')enter('camino');else if(action==='radio')enter('radio');else if(action==='resume')enter('camino','resume');
  });
  dialog.addEventListener('cancel',e=>{e.preventDefault();home();});
  document.addEventListener('click',e=>{if(e.target.closest('[data-welcome-open]')){remember();entry();}});
  const priorRoute=route;
  route=function(...args){if(args[0]!=='camino')remember();return priorRoute.apply(this,args);};
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')remember();});
  if(read(INTRO_KEY)?.completed!==true)entry();
})();

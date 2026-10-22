/* Mi momento diario · Opt-in independiente de las métricas, sin notas ni historial. */
(()=>{
  'use strict';
  const KEY='derej.connection.v1',API='https://ryeztkcyopbmwwaacpxl.supabase.co/functions/v1/connection-reminders';
  const canonical=location.hostname==='derej-beta-comunitaria.vercel.app';
  let registration,publicKey,busy=false,opener;
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch{return null;}};
  const save=value=>localStorage.setItem(KEY,JSON.stringify(value));
  const zone=()=>Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
  const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const ios=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const supported=()=>canonical&&isSecureContext&&'serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window&&(!ios()||standalone());
  const dialog=document.createElement('dialog');dialog.className='connectionDialog';dialog.id='connectionReminder';dialog.setAttribute('aria-labelledby','connectionTitle');
  dialog.innerHTML=`<small class="connectionEyebrow">MI MOMENTO DIARIO</small><h2 id="connectionTitle" tabindex="-1">Un espacio para conectar</h2><p>Reserva de cinco a diez minutos para agradecer, estudiar o conversar con el Creador. Elige un horario que puedas sostener con tranquilidad.</p>
    <label class="connectionField">Hora del recordatorio<input id="connectionTime" type="time" value="07:30" required></label><small id="connectionZone"></small>
    <label class="connectionField">Al tocar la notificación, abrir<select id="connectionDestination"><option value="camino">Camino · estudio de hoy</option><option value="radio">Radio · elegir una escucha</option></select></label>
    <p id="connectionHelp"></p><label class="connectionConsent"><input type="checkbox" id="connectionConsent"><span>Quiero recibir un recordatorio diario en este dispositivo. Autorizo guardar su suscripción de notificaciones, horario y zona horaria para enviarlo. Puedo desactivarlo aquí.</span></label>
    <p class="connectionStatus" id="connectionStatus" role="status" aria-live="polite"></p><div class="connectionActions"><button type="button" class="connectionPrimary" id="connectionEnable">Activar recordatorio</button><button type="button" id="connectionDisable" hidden>Desactivar recordatorio</button><button type="button" id="connectionCalendar">Usar mi Calendario</button><button type="button" id="connectionClose">Volver</button></div>
    <small>Una notificación al día, cerca de la hora elegida. La entrega depende de la conexión y los ajustes del teléfono. La radio se abre sin reproducir automáticamente. Si cambias de zona horaria, vuelve aquí y guarda el horario.</small>
    <details><summary>¿Por qué reservar un momento?</summary><p>La tradición judía distingue la oración de mañana, tarde y noche. En Dérej nos inspira a reservar una pausa libre, adaptada a la vida de cada persona.</p><p>Hilel enseña en Pirkei Avot 2:4 a no dejar el estudio para cuando sobre tiempo. La enseñanza de Rabí Najmán sobre hitbodedut invita a conversar con Dios en el propio idioma y a buscar constancia.</p><p>Los cinco a diez minutos y el horario sugerido son una propuesta de Dérej; la participación es libre.</p><p><a href="https://es.chabad.org/library/article_cdo/aid/2104934/jewish/La-Tefil.htm" target="_blank" rel="noopener noreferrer">Los momentos de oración · Jabad en español</a><br><a href="https://es.breslov.org/hitbodedut-que-como-cuando-donde-1a-parte/" target="_blank" rel="noopener noreferrer">Hitbodedut y constancia · Breslov en español</a></p></details>
    <details><summary>Privacidad del recordatorio</summary><p>Esta opción es independiente de las métricas anónimas. Para enviarlo guardamos la dirección técnica del servicio de notificaciones del dispositivo, sus claves de entrega, la hora, la zona horaria y la puerta elegida. No se adjuntan tus notas, reflexiones ni historial de estudio. El aviso puede verse en la pantalla bloqueada y pasa por el proveedor de notificaciones del dispositivo. Al desactivarlo se elimina la suscripción del servidor cuando hay conexión.</p></details>`;
  document.body.appendChild(dialog);
  const testButton=document.createElement('button');testButton.id='connectionTest';testButton.type='button';testButton.textContent='Enviar aviso de prueba';testButton.hidden=true;dialog.querySelector('.connectionActions').insertBefore(testButton,dialog.querySelector('#connectionDisable'));
  const $=id=>dialog.querySelector('#'+id),status=text=>{$('connectionStatus').textContent=text;};
  const lock=value=>{busy=value;for(const id of ['connectionEnable','connectionDisable','connectionCalendar','connectionClose','connectionTest'])$(id).disabled=value;};
  async function request(body){
    const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(15000)});
    const data=await response.json();if(!response.ok)throw Error(data.error||'No pudimos guardar el recordatorio.');return data;
  }
  function controls(){const s=read();$('connectionDisable').hidden=!s?.subscription;$('connectionTest').hidden=!s?.active;$('connectionEnable').textContent=s?.active?'Guardar cambios':'Activar recordatorio';}
  async function prepare(){
    if(!supported()){
      $('connectionEnable').disabled=true;
      $('connectionConsent').disabled=true;
      $('connectionHelp').textContent=ios()&&!standalone()?'En iPhone o iPad, usa Compartir → Añadir a pantalla de inicio. Abre Dérej desde ese icono y vuelve a «Mi momento diario» para activar notificaciones. También puedes usar tu Calendario.':'Este navegador no permite activar notificaciones aquí. Puedes crear el recordatorio en tu Calendario.';
      status('Elige la hora y usa la opción disponible para tu dispositivo.');return;
    }
    $('connectionHelp').textContent='El teléfono te pedirá permiso al pulsar «Activar recordatorio». Puedes silenciar o desactivar el aviso cuando quieras.';
    $('connectionEnable').disabled=true;status('Preparando las notificaciones…');
    try{
      const response=await fetch(API,{credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(12000)});
      const config=await response.json();if(!response.ok||!config.publicKey)throw Error(config.error||'Servicio no disponible.');
      publicKey=config.publicKey;
      registration=await navigator.serviceWorker.register('/connection-sw.js',{scope:'/'});
      const worker=registration.installing||registration.waiting;
      if(worker&&worker.state!=='activated')await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Vuelve a abrir esta opción para terminar de preparar el dispositivo.')),12000);worker.addEventListener('statechange',()=>{if(worker.state==='activated'){clearTimeout(timer);resolve();}});});
      if(!registration.active)throw Error('Vuelve a abrir esta opción para terminar de preparar el dispositivo.');
      const s=read(),sub=await registration.pushManager.getSubscription();
      $('connectionEnable').disabled=Notification.permission==='denied';
      if(Notification.permission==='denied')status('Las notificaciones están bloqueadas. Puedes habilitarlas en los ajustes del dispositivo o usar tu Calendario.');
      else if(s?.active&&sub)status(`Recordatorio activo a las ${s.time} (${s.timezone}).`);
      else status('Todavía no hay un recordatorio activo.');
    }catch(error){status(error.message+' Puedes usar tu Calendario o volver a abrir esta opción.');}
  }
  function open(button){
    if(dialog.open)return;opener=button;const s=read();$('connectionTime').value=s?.time||'07:30';$('connectionDestination').value=s?.destination==='radio'?'radio':'camino';$('connectionConsent').checked=!!s?.active;$('connectionZone').textContent='Zona horaria de este dispositivo: '+zone();controls();dialog.showModal();$('connectionTitle').focus();prepare();
  }
  function close(){if(busy)return;dialog.close();opener?.focus();}
  $('connectionClose').addEventListener('click',close);dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  $('connectionEnable').addEventListener('click',async()=>{
    if(busy||!registration?.active||!publicKey)return;
    if(!$('connectionConsent').checked){status('Marca la autorización si quieres recibir el recordatorio.');return;}
    if(!$('connectionTime').checkValidity()){$('connectionTime').reportValidity();return;}
    // Must start inside the user gesture, before awaiting network or registration.
    const permission=Notification.permission==='default'?Notification.requestPermission():Promise.resolve(Notification.permission);
    lock(true);let created=false,subscription,previous=read(),pending;
    try{
      if(await permission!=='granted')throw Error('No se activó el permiso. Puedes volver a intentarlo desde los ajustes o usar tu Calendario.');
      const token=previous?.token||Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
      pending={token,time:$('connectionTime').value,timezone:zone(),destination:$('connectionDestination').value,active:false};
      save({...previous,...pending,subscription:previous?.subscription});
      subscription=await registration.pushManager.getSubscription();
      if(subscription&&!previous?.token){await subscription.unsubscribe();subscription=null;}
      if(!subscription){subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:publicKey});created=true;}
      pending.subscription=subscription.toJSON();save({...previous,...pending});
      await request({action:'subscribe',...pending});
      save({...pending,active:true});controls();status(`Listo. Recibirás un recordatorio diario cerca de las ${pending.time}.`);
    }catch(error){
      if(created&&subscription){try{await request({action:'unsubscribe',token:pending.token,subscription:subscription.toJSON()});}catch{}try{await subscription.unsubscribe();}catch{}}
      try{if(previous)save(previous);else if(!created)localStorage.removeItem(KEY);else save({...pending,active:false});}catch{}
      status(error.message||'No pudimos activar el recordatorio.');
    }finally{lock(false);$('connectionEnable').disabled=Notification.permission==='denied';controls();}
  });
  $('connectionDisable').addEventListener('click',async()=>{
    if(busy)return;lock(true);const saved=read();
    try{
      if(saved?.subscription&&saved.token)await request({action:'unsubscribe',token:saved.token,subscription:saved.subscription});
      const reg=registration||await navigator.serviceWorker.getRegistration('/');const sub=await reg?.pushManager.getSubscription();if(sub)await sub.unsubscribe();
      save({time:saved?.time||'07:30',destination:saved?.destination||'camino',active:false});controls();$('connectionConsent').checked=false;status('Recordatorio desactivado en este dispositivo.');
    }catch{status('No pudimos completar la desactivación. Comprueba tu conexión y vuelve a intentarlo. También puedes bloquear las notificaciones en los ajustes del teléfono.');}
    finally{lock(false);controls();}
  });
  $('connectionTest').addEventListener('click',async()=>{
    const s=read();if(busy||!s?.active)return;lock(true);
    try{await request({action:'test',token:s.token,subscription:s.subscription});status('Prueba enviada al servicio del dispositivo. Comprueba la notificación; también puede aparecer en su centro de notificaciones.');}
    catch(error){status(error.message);}finally{lock(false);controls();}
  });
  $('connectionCalendar').addEventListener('click',()=>{
    if(!$('connectionTime').checkValidity()){$('connectionTime').reportValidity();return;}
    const [h,m]=$('connectionTime').value.split(':').map(Number),date=new Date();date.setHours(h,m,0,0);if(date<=new Date())date.setDate(date.getDate()+1);
    const pad=n=>String(n).padStart(2,'0');const start=`${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}T${pad(h)}${pad(m)}00`;
    const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    const destination=$('connectionDestination').value==='radio'?'radio':'camino';
    const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Derej//Mi momento diario//ES','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:${crypto.randomUUID()}@derej`,`DTSTAMP:${stamp}`,`DTSTART:${start}`,'DURATION:PT10M','RRULE:FREQ=DAILY','SUMMARY:Un momento para ti · Dérej',`URL:https://derej-beta-comunitaria.vercel.app/?conexion=${destination}`,'DESCRIPTION:Una pausa para agradecer y conectar. Abre Derej desde el enlace.','BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:Un momento para ti · Dérej','END:VALARM','END:VEVENT','END:VCALENDAR',''].join('\r\n');
    const url=URL.createObjectURL(new Blob([ics],{type:'text/calendar;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='Derej-mi-momento-diario.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
    status('Abre el archivo y confirma el evento diario y su aviso en tu Calendario. Esta alternativa se administra y elimina desde Calendario; no activa notificaciones de Dérej.');
  });
  function addButtons(){
    const footer=document.querySelector('.homeFooter');if(footer&&!footer.querySelector('[data-connection-open]')){const b=document.createElement('button');b.type='button';b.className='connectionOpen';b.dataset.connectionOpen='';b.textContent='Mi momento diario · Recordatorio';footer.insertBefore(b,footer.querySelector('#metricsPrivacyOpen'));}
    const personal=document.querySelector('[data-screen="personal"]');if(personal&&!personal.querySelector('[data-connection-open]')){const wrap=document.createElement('div');wrap.className='connectionPersonal';wrap.innerHTML='<button type="button" class="connectionOpen" data-connection-open>Mi momento diario · Recordatorio</button>';personal.appendChild(wrap);}
  }
  document.addEventListener('click',e=>{const button=e.target.closest('[data-connection-open]');if(button)open(button);});
  addButtons();new MutationObserver(addButtons).observe(document.querySelector('.appShell'),{childList:true,subtree:true});
  function go(destination){
    const target=destination==='radio'?'radio':'camino',welcome=document.getElementById('derejWelcome');
    const enter=()=>{route(target);const heading=document.querySelector(`[data-screen="${target}"] h1`);if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}};
    if(welcome?.open)welcome.addEventListener('close',enter,{once:true});else enter();
  }
  navigator.serviceWorker?.addEventListener('message',e=>{if(e.data?.type==='DEREJ_CONNECTION')go(e.data.destination);});
  const destination=new URLSearchParams(location.search).get('conexion');if(['camino','radio'].includes(destination)){go(destination);const url=new URL(location.href);url.searchParams.delete('conexion');history.replaceState(null,'',url);}
  if(new URLSearchParams(location.search).get('recordatorio')==='1'){
    const show=()=>open(document.querySelector('.connectionHeader')||document.querySelector('[data-connection-open]'));
    const welcome=document.getElementById('derejWelcome');
    if(welcome?.open)welcome.addEventListener('close',show,{once:true});else show();
  }
})();

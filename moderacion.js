(()=>{
  'use strict';
  const cfg=window.DEREJ_CONFIG||{};
  const BASE=String(cfg.supabaseUrl||'').replace(/\/$/,'');
  const KEY=cfg.supabasePublishableKey||'';
  const FUNCTION=cfg.moderationFunction||'moderation-console';
  const SESSION_KEY='derej:moderator:session:v1';
  const $=id=>document.getElementById(id);
  const state={status:'pending',session:null,role:null};

  function headers(token=null,json=false){
    const h={apikey:KEY};
    if(token)h.Authorization=`Bearer ${token}`;
    if(json)h['Content-Type']='application/json';
    return h;
  }
  function readSession(){try{return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
  function saveSession(raw){
    const s={access_token:raw.access_token,refresh_token:raw.refresh_token,expires_at:raw.expires_at||Math.floor(Date.now()/1000)+(raw.expires_in||3600)};
    sessionStorage.setItem(SESSION_KEY,JSON.stringify(s));state.session=s;return s;
  }
  function clearSession(){sessionStorage.removeItem(SESSION_KEY);state.session=null;state.role=null}
  function valid(s){return Boolean(s?.access_token&&Number(s.expires_at)>Math.floor(Date.now()/1000)+90)}

  async function auth(path,body){
    const res=await fetch(`${BASE}/auth/v1/${path}`,{method:'POST',headers:headers(null,true),body:JSON.stringify(body)});
    const data=await res.json().catch(()=>({}));
    if(!res.ok)throw new Error(data.error_description||data.msg||data.error||`Auth ${res.status}`);
    return data;
  }
  async function ensureSession(){
    let s=state.session||readSession();
    if(valid(s)){state.session=s;return s}
    if(s?.refresh_token){
      try{return saveSession(await auth('token?grant_type=refresh_token',{refresh_token:s.refresh_token}))}catch{clearSession()}
    }
    throw new Error('session_required');
  }
  async function api(method='GET',body=null,status=state.status){
    const s=await ensureSession();
    const url=new URL(`${BASE}/functions/v1/${FUNCTION}`);
    if(method==='GET'){url.searchParams.set('status',status);url.searchParams.set('limit','100')}
    const res=await fetch(url,{method,headers:headers(s.access_token,Boolean(body)),body:body?JSON.stringify(body):undefined});
    const data=await res.json().catch(()=>({}));
    if(res.status===401||res.status===403){
      if(['invalid_session','authentication_required'].includes(data.error))clearSession();
      throw new Error(data.error||`HTTP ${res.status}`);
    }
    if(!res.ok)throw new Error(data.error||`HTTP ${res.status}`);
    return data;
  }

  function showLogin(message=''){
    $('modLogin').hidden=false;$('modConsole').hidden=true;$('modLogout').hidden=true;
    $('modLoginStatus').textContent=message;
  }
  function showConsole(){
    $('modLogin').hidden=true;$('modConsole').hidden=false;$('modLogout').hidden=false;
  }
  function fmtDate(value){try{return new Intl.DateTimeFormat('es-CL',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value))}catch{return value||''}}
  function titleFor(status){return status==='pending'?'Pendientes':status==='published'?'Publicados':'Ocultos'}
  function errorText(err){
    const map={
      moderator_access_required:'Esta cuenta existe, pero no está autorizada como moderador.',
      permanent_account_required:'Las identidades anónimas no pueden acceder al panel de moderación.',
      invalid_session:'La sesión expiró. Ingresa nuevamente.',
      authentication_required:'Debes iniciar sesión.',
      queue_load_failed:'No fue posible cargar la cola de moderación.',
      moderation_update_failed:'No fue posible guardar la decisión de moderación.',
      report_resolution_failed:'No fue posible cerrar los reportes asociados.'
    };
    return map[err.message]||err.message||'No fue posible completar la acción.';
  }

  function render(items){
    const box=$('modQueue');box.replaceChildren();
    if(!items.length){const empty=document.createElement('div');empty.className='emptyState';empty.textContent='No hay testimonios en este estado.';box.append(empty);return}
    for(const item of items){
      const card=document.createElement('article');card.className=`moderatorItem ${item.moderation_level||'green'}`;card.dataset.id=item.id;
      const head=document.createElement('div');head.className='moderatorItemHead';
      const left=document.createElement('div');
      const eyebrow=document.createElement('div');eyebrow.className='eyebrow';eyebrow.textContent=item.conversation?.title||item.conversation?.slug||'Conversación';
      const level=document.createElement('div');level.className='moderatorLevel';level.textContent=`${(item.moderation_level||'green').toUpperCase()} · ${item.status}`;
      left.append(eyebrow,level);
      const time=document.createElement('div');time.className='moderatorTimestamp';time.textContent=fmtDate(item.created_at);head.append(left,time);
      const body=document.createElement('div');body.className='moderatorBodyText';body.textContent=item.body;
      card.append(head,body);
      const flags=document.createElement('div');flags.className='moderatorFlags';
      (item.moderation_flags||[]).forEach(flag=>{const x=document.createElement('span');x.className='moderatorFlag';x.textContent=flag;flags.append(x)});
      if(flags.childNodes.length)card.append(flags);
      if(item.moderation_note){const auto=document.createElement('p');auto.className='small';auto.textContent=`Señal automática: ${item.moderation_note}`;card.append(auto)}
      if(item.reports?.open_count){
        const reports=document.createElement('div');reports.className='moderatorReports';
        const rt=document.createElement('strong');rt.textContent=`${item.reports.open_count} reporte(s) abierto(s)`;reports.append(rt);
        for(const r of item.reports.items||[]){
          const row=document.createElement('div');row.className='moderatorReport';
          const rr=document.createElement('div');rr.className='moderatorReportReason';rr.textContent=r.reason;row.append(rr);
          if(r.details){const rd=document.createElement('p');rd.className='moderatorReportDetails';rd.textContent=r.details;row.append(rd)}
          reports.append(row);
        }
        card.append(reports);
      }
      const label=document.createElement('label');label.className='moderatorNoteLabel';label.textContent='Nota interna de revisión';
      const note=document.createElement('textarea');note.className='moderatorNote';note.rows=2;note.maxLength=1000;note.value=item.moderator_note||'';label.append(note);card.append(label);
      const actions=document.createElement('div');actions.className='moderatorActions';
      if(item.status!=='published')actions.append(makeAction('Publicar','publish',card,note));
      if(item.status!=='hidden')actions.append(makeAction('Ocultar','hide',card,note,true));
      if(item.status!=='pending')actions.append(makeAction('Volver a pendiente','return_pending',card,note));
      if(item.status==='published'&&item.reports?.open_count)actions.append(makeAction('Mantener publicado · cerrar reportes','dismiss_reports',card,note));
      card.append(actions);box.append(card);
    }
  }
  function makeAction(label,action,card,note,danger=false){
    const b=document.createElement('button');b.type='button';b.textContent=label;b.className=danger?'dangerBtn':'secondaryBtn';
    b.addEventListener('click',async()=>{
      card.setAttribute('aria-busy','true');$('modStatus').textContent='Guardando decisión…';
      try{await api('POST',{testimony_id:card.dataset.id,action,note:note.value.trim()||null});$('modStatus').textContent='Decisión guardada y auditada ✓';await loadQueue()}
      catch(e){$('modStatus').textContent=errorText(e)}finally{card.removeAttribute('aria-busy')}
    });return b;
  }

  async function loadQueue(){
    $('modQueueTitle').textContent=titleFor(state.status);$('modStatus').textContent='Cargando…';
    try{
      const data=await api('GET',null,state.status);state.role=data.moderator?.role||'moderator';$('modRole').textContent=`Rol: ${state.role}`;render(data.items||[]);$('modStatus').textContent=`${data.count||0} testimonio(s) · datos no almacenados en caché local.`;showConsole();
    }catch(e){
      if(['session_required','invalid_session','authentication_required','moderator_access_required','permanent_account_required'].includes(e.message))showLogin(errorText(e));
      else $('modStatus').textContent=errorText(e);
    }
  }

  $('modLoginForm').addEventListener('submit',async e=>{
    e.preventDefault();$('modLoginStatus').textContent='Verificando acceso…';
    try{
      const data=await auth('token?grant_type=password',{email:$('modEmail').value.trim(),password:$('modPassword').value});saveSession(data);$('modPassword').value='';await loadQueue();
    }catch(err){clearSession();showLogin(errorText(err))}
  });
  $('modLogout').addEventListener('click',()=>{clearSession();$('modQueue').replaceChildren();showLogin('Sesión cerrada en este dispositivo.')});
  $('modRefresh').addEventListener('click',loadQueue);
  document.querySelectorAll('[data-status]').forEach(btn=>btn.addEventListener('click',()=>{state.status=btn.dataset.status;document.querySelectorAll('[data-status]').forEach(x=>x.classList.toggle('on',x===btn));loadQueue()}));

  if(!BASE||!KEY){showLogin('Configuración de Supabase incompleta.')}else{state.session=readSession();if(valid(state.session)||state.session?.refresh_token)loadQueue();else showLogin()}
})();

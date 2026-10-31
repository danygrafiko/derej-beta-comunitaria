/* Pregúntale a Dérej · session memory only; no conversation analytics or browser storage. */
(() => {
  'use strict';
  const screen = document.querySelector('[data-screen="preguntas"]');
  if (!screen) return;
  const $ = id => screen.querySelector('#' + id);
  let history = [], busy = false, context = '', studyTitle = '', controller = null;
  const questions = ['¿Qué diferencia hay entre Nétzaj y Hod?', '¿Cómo trabajar mi autoestima desde la dignidad?', '¿Qué propone Dérej para empezar a meditar?', '¿Cómo leer los Salmos relacionados con el cuerpo?'];
  function open(from = '', title = '') {
    context = from; studyTitle = title;
    $('dqContext').hidden = !from;
    $('dqContextLabel').textContent = title || 'Tu estudio en Dérej';
    route('preguntas'); $('dqQuestion').focus();
  }
  function busyState(value) {
    busy = value; $('dqSend').disabled = value; $('dqQuestion').disabled = value;
    $('dqStop').hidden = !value;
    screen.querySelectorAll('[data-dq-suggestion]').forEach(b => b.disabled = value);
    $('dqThread').setAttribute('aria-busy', String(value));
  }
  function notice(text) { $('dqStatus').textContent = text; }
  function message(label, text, cls) {
    const article = document.createElement('article'); article.className = 'dqMessage ' + cls;
    const who = document.createElement('p'); who.className = 'dqWho'; who.textContent = label;
    const body = document.createElement('div'); body.className = 'dqMessageBody'; body.textContent = text;
    article.append(who,body); $('dqThread').append(article); $('dqWelcome').hidden = true;
    return article;
  }
  function sourceButton(source) {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = source.title + ' ↗';
    button.addEventListener('click', () => {
      route(source.route);
      if (source.collection === 'tehilim') document.querySelector('[data-tehilim-open]')?.click();
    }); return button;
  }
  async function ask(event) {
    event.preventDefault(); if (busy) return;
    const question = $('dqQuestion').value.trim();
    if (!question) { $('dqQuestion').focus(); return; }
    if (!$('dqConsent').checked) { notice('Confirma el envío de tu pregunta para continuar.'); $('dqConsent').focus(); return; }
    if (!navigator.onLine) { notice('Necesitas conexión a internet para conversar con Dérej IA.'); return; }
    const user = message('TÚ',question,'dqUser');
    busyState(true); notice('Buscando en los estudios y preparando una respuesta…');
    controller = new AbortController();
    const timeout = setTimeout(() => controller?.abort(),35000);
    try {
      const response = await fetch('/api/preguntas', { method:'POST', headers:{'Content-Type':'application/json'}, cache:'no-store', signal:controller.signal,
        body:JSON.stringify({question,history:history.slice(-6),context,studyTitle,consent:true}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No pudimos conectar. Inténtalo nuevamente.');
      const article = message('DÉREJ · IA',data.answer,'dqAssistant');
      if (data.sources?.length) {
        const sources = document.createElement('details'); sources.className = 'dqSources';
        const title = document.createElement('summary'); title.textContent = 'Pasajes de Dérej utilizados · ' + data.sources.length; sources.append(title);
        data.sources.forEach(source => sources.append(sourceButton(source))); article.append(sources);
      }
      if (data.reflection) { const reflection = document.createElement('p'); reflection.className = 'dqReflection'; reflection.textContent = 'Para llevar contigo · ' + data.reflection; article.append(reflection); }
      history.push({role:'user',content:question},{role:'assistant',content:data.answer}); history = history.slice(-6);
      $('dqQuestion').value = ''; notice('Respuesta preparada. Puedes revisar sus fuentes o seguir preguntando.');
      article.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    } catch (error) {
      user.remove(); if (!$('dqThread').children.length) $('dqWelcome').hidden = false;
      notice(error.name === 'AbortError' ? 'Consulta detenida. Tu pregunta sigue en el cuadro para volver a intentarlo.' : error.message);
    } finally { clearTimeout(timeout); controller = null; busyState(false); $('dqQuestion').focus({preventScroll:true}); }
  }
  for (const text of questions) {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.dqSuggestion = ''; button.textContent = text;
    button.addEventListener('click',()=>{ $('dqQuestion').value=text; $('dqQuestion').focus(); }); $('dqSuggestions').append(button);
  }
  $('dqForm').addEventListener('submit',ask);
  $('dqQuestion').addEventListener('keydown',e=>{ if (e.key==='Enter' && (e.ctrlKey||e.metaKey)) $('dqForm').requestSubmit(); });
  $('dqStop').addEventListener('click',()=>controller?.abort());
  $('dqClear').addEventListener('click',()=>{ if (busy) return; history=[]; $('dqThread').replaceChildren(); $('dqWelcome').hidden=false; notice('La conversación se ha borrado de esta pestaña.'); });
  $('dqReturn').addEventListener('click',()=>route(context || 'biblioteca'));
  document.addEventListener('click',event=>{
    const entry=event.target.closest('[data-dq-open]'); if (!entry) return;
    const from=entry.dataset.dqContext || '';
    const current=document.querySelector('.screen[data-screen]:not([hidden])');
    const heading=current?.querySelector('#thStudy:not([hidden]) h2') || current?.querySelector('article h2, article h1') || current?.querySelector('h1, h2');
    const title=from ? heading?.textContent?.trim().slice(0,180) || '' : '';
    open(from,title);
  });
  // These are public study screens. Personal notes are never read or transmitted.
  for (const name of ['autoestima','meditacion','voces','genealogias','arbol','nombres','camino','pozo']) {
    const root=document.querySelector('[data-screen="'+name+'"]'); if (!root) continue;
    const button=document.createElement('button'); button.type='button'; button.className='dqStudyEntry';
    button.dataset.dqOpen=''; button.dataset.dqContext=name; button.textContent='✧ Preguntar sobre este estudio'; root.prepend(button);
  }
  const pozoEntry=document.querySelector('[data-screen="pozo"] .dqStudyEntry');
  if (pozoEntry) pozoEntry.textContent='✧ Pregúntale a Dérej';
  const tehilim=document.getElementById('tehilimExplorer');
  if (tehilim) {
    const button=document.createElement('button'); button.type='button'; button.className='dqStudyEntry';
    button.dataset.dqOpen=''; button.dataset.dqContext='biblioteca'; button.textContent='✧ Preguntar sobre Tehilim'; tehilim.prepend(button);
  }
  fetch('/api/preguntas',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{
    if (data && !data.enabled) notice('El espacio está preparado. La conexión de IA está pendiente de activación.');
  }).catch(()=>{});
})();

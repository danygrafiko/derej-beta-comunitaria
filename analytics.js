/* Dérej · métricas agregables, sin contenido personal ni identificador permanente. */
(() => {
  'use strict';
  const ENDPOINT = 'https://ryeztkcyopbmwwaacpxl.supabase.co/rest/v1/rpc/record_analytics';
  const PUBLIC_KEY = 'sb_publishable_NsYJH1ziasj7vfSsmeoe-g_ribPU_PG';
  const PREF = 'derej.metrics.enabled.v1';
  const DAILY = 'derej.metrics.daily.v1';
  const SESSION = 'derej.metrics.session.v1';
  const STUDY = 'derej.metrics.study.v1';
  const IDLE = 30 * 60 * 1000;
  const SECTIONS = new Set(['home', 'camino', 'shabat', 'moed', 'radio', 'personal', 'pozo']);
  const production = location.hostname === 'derej-beta-comunitaria.vercel.app';
  const isTest = new URLSearchParams(location.search).get('metricas') === 'prueba';
  const browserOptOut = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  let enabled = !browserOptOut && read(localStorage, PREF) !== 'false';
  let queue = [], sending = false, started = false, session = null, daily = null;
  let currentSection = '', sectionSince = performance.now(), lastInteraction = Date.now();
  let radio = null;
  let study = null;

  function read(storage, key) { try { return storage.getItem(key); } catch { return null; } }
  function save(storage, key, value) { try { storage.setItem(key, value); } catch {} }
  function remove(storage, key) { try { storage.removeItem(key); } catch {} }
  function json(storage, key) { try { return JSON.parse(read(storage, key)); } catch { return null; } }
  function uuid() { return crypto.randomUUID(); }
  function day() { return new Intl.DateTimeFormat('en-CA', {timeZone: 'America/Santiago', year:'numeric', month:'2-digit', day:'2-digit'}).format(new Date()); }
  function device() { return matchMedia('(pointer: coarse)').matches ? (innerWidth < 768 ? 'mobile' : 'tablet') : 'desktop'; }
  function allowed() { return production && enabled && !browserOptOut; }
  function identities() {
    const now = Date.now(), date = day();
    if (!daily || daily.day !== date) {
      daily = json(localStorage, DAILY);
      if (!daily || daily.day !== date || !/^[0-9a-f-]{36}$/.test(daily.id)) daily = {day: date, id: uuid()};
      save(localStorage, DAILY, JSON.stringify(daily));
    }
    if (!session) session = json(sessionStorage, SESSION);
    const fresh = !session || now - session.last > IDLE || session.day !== date || session.test !== isTest;
    if (fresh) session = {id: uuid(), day: date, last: now, test: isTest};
    session.last = now;
    save(sessionStorage, SESSION, JSON.stringify(session));
    if (!study || study.session !== session.id) {
      const saved = json(sessionStorage, STUDY);
      const valid = !fresh && saved?.session === session.id;
      const keys = values => Array.isArray(values) ? values.filter(x => typeof x === 'string' && x.length <= 120).slice(0, 140) : [];
      study = {session: session.id, starts: new Set(valid ? keys(saved.starts) : []), completes: new Set(valid ? keys(saved.completes) : [])};
    }
    return fresh;
  }
  function row(type, details = {}) {
    return {id: uuid(), event_type: type, daily_id: daily.id, session_id: session.id,
      section: currentSection || 'home', device_class: device(), is_test: isTest,
      collection_id: null, track_id: null, seconds: null,
      release: 'metrics-v1', ...details};
  }
  function emit(type, details = {}, studyKey = null) {
    if (!allowed()) return;
    const fresh = identities();
    if (fresh) queue.push(row('visit'));
    if (studyKey) {
      const seen = type === 'study_start' ? study.starts : study.completes;
      if (seen.has(studyKey)) { flush(); return; }
      seen.add(studyKey);
      save(sessionStorage, STUDY, JSON.stringify({session: study.session, starts: [...study.starts], completes: [...study.completes]}));
    }
    if (type !== 'visit' || !fresh) queue.push(row(type, details));
    if (queue.length > 40) queue = queue.slice(-40);
    flush();
  }
  async function flush() {
    if (!allowed() || sending || !queue.length || navigator.onLine === false) return;
    sending = true;
    const batch = queue.splice(0, 20);
    let ok = false;
    try {
      const response = await fetch(ENDPOINT, {method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer',
        keepalive: true, headers: {'apikey': PUBLIC_KEY, 'Content-Type': 'application/json',
          'Prefer': 'return=minimal'}, body: JSON.stringify({events: batch})});
      ok = response.ok;
      // Reintentar sólo fallos transitorios. Nunca detener el estudio o el audio.
      if (!ok && (response.status === 429 || response.status >= 500)) queue.unshift(...batch);
    } catch { queue.unshift(...batch); }
    queue = queue.slice(0, 40);
    sending = false;
    if (ok && queue.length) flush();
  }
  function visibleSection() {
    return [...document.querySelectorAll('[data-screen]')].find(el => !el.hidden && el.classList.contains('active'))?.dataset.screen || 'home';
  }
  function closeSection() {
    const seconds = Math.min(1800, Math.floor((performance.now() - sectionSince) / 1000));
    if (currentSection && seconds > 0 && document.visibilityState !== 'hidden' && Date.now() - lastInteraction < IDLE) emit('section_time', {seconds});
    sectionSince = performance.now();
  }
  function syncSection() {
    const next = visibleSection();
    if (!SECTIONS.has(next) || next === currentSection) return;
    closeSection();
    currentSection = next;
    sectionSince = performance.now();
    if (document.visibilityState !== 'hidden') emit('section_view');
  }
  function currentStudy() {
    if (!allowed() || document.visibilityState === 'hidden' || visibleSection() !== 'camino') return null;
    const screen = document.querySelector('[data-screen="camino"]');
    const parasha = screen?.querySelector('[data-ramak-parasha][aria-selected="true"]')?.dataset.ramakParasha;
    const chosen = screen?.querySelector('#ramakDayStrip .ramakDay.on');
    const dayNumber = Number(chosen?.dataset.ramakDay);
    if (!screen?.querySelector('.ramakPanel.on') || !parasha || parasha.length > 80 || !chosen || chosen.disabled || !Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 7) return null;
    // Clave local para evitar duplicados. No se incluye en los eventos enviados.
    return {key: `${parasha}|${dayNumber}`, parasha, day: dayNumber};
  }
  function syncStudy() {
    if (Date.now() - lastInteraction >= IDLE) return;
    const selected = currentStudy();
    if (selected && study?.starts.has(selected.key) && session?.day === day() && Date.now() - session.last <= IDLE) return;
    if (selected) emit('study_start', {section: 'camino'}, selected.key);
  }
  function onStudyComplete(event) {
    const button = event.target.closest?.('[data-ramak-complete]');
    const selected = currentStudy();
    if (!button || !selected || button.classList.contains('done') || button.dataset.parasha !== selected.parasha || Number(button.dataset.day) !== selected.day) return;
    // Esperar la acción de la app: si no se pudo guardar, no contar un final.
    queueMicrotask(() => {
      const active = currentStudy();
      const confirmed = [...document.querySelectorAll('[data-ramak-complete]')].find(el => el.dataset.parasha === selected.parasha && Number(el.dataset.day) === selected.day);
      if (active?.key !== selected.key || !confirmed?.classList.contains('done')) return;
      syncStudy();
      emit('study_complete', {section: 'camino'}, selected.key);
    });
  }
  function mediaDetails(audio) {
    const track = audio.dataset.metricsTrack || '', collection = audio.dataset.metricsCollection || '';
    if (!/^[a-z0-9_-]{1,80}$/.test(track) || !/^[a-z0-9_-]{1,80}$/.test(collection)) return null;
    return {track_id: track, collection_id: collection, section: 'radio'};
  }
  function onMedia(event) {
    const audio = event.target;
    if (audio.id !== 'radioV21Audio' || !allowed()) return;
    const details = mediaDetails(audio);
    if (!details) return;
    const source = audio.getAttribute('src');
    if (!radio || radio.source !== source || radio.finished) radio = {source, heard: 0, mediaHeard: 0, last: audio.currentTime, wall: performance.now(), started: false, qualified: false, finished: false};
    if (event.type === 'playing') {
      if (!radio.started) { radio.started = true; emit('radio_start', details); }
      radio.last = audio.currentTime; radio.wall = performance.now();
      return;
    }
    if (!radio.started) return;
    const now = performance.now(), delta = audio.currentTime - radio.last;
    const elapsed = Math.max(0, (now - radio.wall) / 1000);
    // Sólo tiempo avanzado durante reproducción; saltar la barra no añade escucha.
    if ((!audio.paused || event.type === 'pause' || event.type === 'ended') && !audio.muted && audio.volume > 0 && !audio.seeking && delta > 0 && delta <= elapsed * Math.max(1, audio.playbackRate) + 0.75) {
      radio.heard += Math.min(delta / Math.max(0.25, audio.playbackRate), elapsed);
      radio.mediaHeard += Math.min(delta, elapsed * Math.max(0.25, audio.playbackRate));
    }
    radio.last = audio.currentTime; radio.wall = now;
    if (!radio.qualified && radio.heard >= 30) { radio.qualified = true; emit('radio_30s', {...details, seconds: 30}); }
    if (event.type === 'ended') {
      if (radio.qualified && Number.isFinite(audio.duration) && radio.mediaHeard >= audio.duration * 0.9) emit('radio_complete', {...details, seconds: Math.min(1800, Math.floor(radio.heard))});
      radio.finished = true;
    }
  }
  function begin() {
    if (!allowed()) return;
    if (!started) {
      started = true;
      currentSection = visibleSection();
      sectionSince = performance.now();
      emit('section_view');
    }
    syncStudy();
  }
  function setEnabled(value) {
    enabled = !!value && !browserOptOut;
    save(localStorage, PREF, String(enabled));
    if (!enabled) {
      queue = []; session = null; daily = null; radio = null; study = null; started = false;
      remove(localStorage, DAILY); remove(sessionStorage, SESSION);
      remove(sessionStorage, STUDY);
    } else begin();
  }
  function privacy() {
    const dialog = document.getElementById('metricsPrivacy');
    const toggle = document.getElementById('metricsConsent');
    toggle.checked = enabled; toggle.disabled = browserOptOut;
    document.getElementById('metricsBrowserChoice').hidden = !browserOptOut;
    dialog.showModal();
  }

  document.getElementById('metricsPrivacyOpen')?.addEventListener('click', privacy);
  document.getElementById('metricsPrivacyClose')?.addEventListener('click', () => document.getElementById('metricsPrivacy').close());
  document.getElementById('metricsConsent')?.addEventListener('change', event => setEnabled(event.target.checked));
  document.getElementById('metricsPrivacy')?.addEventListener('click', event => { if (event.target === event.currentTarget) event.currentTarget.close(); });
  new MutationObserver(() => { syncSection(); syncStudy(); }).observe(document.querySelector('.appShell'), {subtree:true, childList:true, attributes:true, attributeFilter:['hidden','class','aria-selected']});
  document.addEventListener('click', onStudyComplete, true);
  for (const type of ['playing', 'timeupdate', 'pause', 'ended', 'seeking', 'seeked']) document.addEventListener(type, onMedia, true);
  for (const type of ['pointerdown', 'keydown']) document.addEventListener(type, () => {
    const inactive = Date.now() - lastInteraction >= IDLE;
    lastInteraction = Date.now();
    if (inactive) { sectionSince = performance.now(); if (allowed()) { emit('section_view'); syncStudy(); } }
  }, {passive:true});
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // visibilityState ya cambió: cerrar el tramo visible explícitamente.
      const seconds = Math.min(1800, Math.floor((performance.now() - sectionSince) / 1000));
      if (seconds > 0 && Date.now() - lastInteraction < IDLE) emit('section_time', {seconds});
      sectionSince = performance.now(); flush();
    } else { sectionSince = performance.now(); lastInteraction = Date.now(); begin(); }
  });
  addEventListener('pagehide', () => { closeSection(); flush(); });
  addEventListener('online', flush);
  addEventListener('storage', event => { if (event.key === PREF) setEnabled(event.newValue !== 'false'); });
  setInterval(flush, 15000);
  // Una pestaña restaurada o inicialmente oculta no cuenta hasta hacerse visible.
  if (document.visibilityState !== 'hidden') begin();
})();

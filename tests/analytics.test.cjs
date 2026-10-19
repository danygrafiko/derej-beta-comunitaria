const {JSDOM} = require('jsdom');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../analytics.js'), 'utf8');
const pause = () => new Promise(r => setTimeout(r, 10));
const fixture = `<main class="appShell"><section data-screen="home" class="active"></section><section data-screen="radio" hidden></section><section data-screen="pozo" hidden></section></main><button id="metricsPrivacyOpen"></button><dialog id="metricsPrivacy"><input type="checkbox" id="metricsConsent"><small id="metricsBrowserChoice"></small><button id="metricsPrivacyClose"></button></dialog><audio id="radioV21Audio" data-metrics-track="med-01" data-metrics-collection="meditacion-i" src="https://example.test/audio.mp3"></audio><textarea>PRIVATE SENTINEL</textarea>`;
function boot({url='https://derej-beta-comunitaria.vercel.app/?metricas=prueba',gpc=false,disabled=false,failure=false}={}) {
  const dom = new JSDOM(fixture, {url,runScripts:'outside-only',pretendToBeVisual:true});
  const w = dom.window, events = [], requests = [];
  let clock=0, paused=true, seeking=false, current=0, visibility='visible', fail=failure;
  let wallOffset=0;const NativeDate=w.Date;
  w.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[NativeDate.now()+wallOffset]));}static now(){return NativeDate.now()+wallOffset;}};
  Object.defineProperty(w.performance,'now',{value:()=>clock});
  Object.defineProperty(w.navigator,'globalPrivacyControl',{value:gpc});
  Object.defineProperty(w.document,'visibilityState',{get:()=>visibility});
  w.matchMedia=()=>({matches:false});
  if(disabled)w.localStorage.setItem('derej.metrics.enabled.v1','false');
  w.fetch=async (url,options)=>{requests.push({url,options}); if(fail){fail=false;throw new Error('offline');} events.push(...JSON.parse(options.body).events);return {ok:true,status:204};};
  const audio=w.document.querySelector('audio');
  Object.defineProperties(audio,{paused:{get:()=>paused},seeking:{get:()=>seeking},currentTime:{get:()=>current},duration:{get:()=>180}});
  const fire=type=>audio.dispatchEvent(new w.Event(type));
  w.eval(source);
  return {dom,w,audio,events,requests,fire,
    jump(ms){wallOffset+=ms;},
    advance(seconds){clock+=seconds*1000;current+=seconds;fire('timeupdate');},
    play(){paused=false;fire('playing');},pause(){paused=true;fire('pause');},
    seek(to){seeking=true;current=to;fire('seeking');seeking=false;fire('seeked');},
    show(section){for(const el of w.document.querySelectorAll('[data-screen]')){const on=el.dataset.screen===section;el.hidden=!on;el.classList.toggle('active',on);}},
    visibility(value){visibility=value;w.document.dispatchEvent(new w.Event('visibilitychange'));},
    count(type){return events.filter(e=>e.event_type===type).length;}};
}
(async()=>{
  let b=boot();await pause();
  assert.equal(b.count('visit'),1);assert.equal(b.count('section_view'),1);
  b.fire('loadedmetadata');b.advance(120);await pause();assert.equal(b.count('radio_start'),0);assert.equal(b.count('radio_30s'),0);
  b.play();b.advance(10);b.pause();b.advance(60);b.play();b.advance(19);await pause();assert.equal(b.count('radio_start'),1);assert.equal(b.count('radio_30s'),0);
  b.advance(2);await pause();assert.equal(b.count('radio_30s'),1);
  b.advance(10);await pause();assert.equal(b.count('radio_30s'),1);
  b.show('pozo');await pause();assert.equal(b.events.filter(e=>e.event_type==='section_view'&&e.section==='pozo').length,1);
  const visible=b.count('section_view');b.w.document.querySelector('[data-screen=pozo]').hidden=false;await pause();assert.equal(b.count('section_view'),visible);
  const serialized=JSON.stringify(b.events);assert(!serialized.includes('PRIVATE SENTINEL'));assert(!serialized.includes('example.test'));assert(b.events.every(e=>e.is_test));
  assert(b.requests.every(r=>r.options.referrerPolicy==='no-referrer'&&r.options.credentials==='omit'));
  b.w.document.querySelector('#metricsConsent').checked=false;b.w.document.querySelector('#metricsConsent').dispatchEvent(new b.w.Event('change'));const n=b.events.length;b.advance(40);b.show('radio');await pause();assert.equal(b.events.length,n);assert.equal(b.w.localStorage.getItem('derej.metrics.daily.v1'),null);b.dom.window.close();
  b=boot();b.play();b.advance(5);b.seek(175);b.advance(5);b.fire('ended');await pause();assert.equal(b.count('radio_30s'),0);assert.equal(b.count('radio_complete'),0);b.dom.window.close();
  b=boot();b.play();b.audio.muted=true;b.advance(40);await pause();assert.equal(b.count('radio_30s'),0);b.audio.muted=false;b.seek(0);for(let i=0;i<18;i++)b.advance(10);b.fire('ended');await pause();assert.equal(b.count('radio_30s'),1);assert.equal(b.count('radio_complete'),1);b.dom.window.close();
  for(const config of [{gpc:true},{disabled:true},{url:'https://preview.vercel.app/'}]){b=boot(config);b.show('radio');b.play();b.advance(40);await pause();assert.equal(b.events.length,0);b.dom.window.close();}
  b=boot({failure:true});await pause();b.w.dispatchEvent(new b.w.Event('online'));await pause();assert.equal(b.count('visit'),1);assert.equal(b.count('section_view'),1);b.dom.window.close();
  b=boot();await pause();const first=b.events.find(e=>e.event_type==='visit');b.jump(31*60*1000);b.w.document.dispatchEvent(new b.w.Event('pointerdown'));await pause();assert.equal(b.count('visit'),2);assert.equal(b.events.filter(e=>e.event_type==='visit')[1].daily_id,first.daily_id);b.jump(24*60*60*1000);b.show('pozo');await pause();assert.equal(b.count('visit'),3);assert.notEqual(b.events.filter(e=>e.event_type==='visit')[2].daily_id,first.daily_id);b.dom.window.close();
  console.log('PASS: visitas/secciones sin duplicados; precargas, pausas, saltos y silencio excluidos; 30 segundos y finalización; privacidad, opt-out, GPC, previews y reintento sin bloquear la app.');
})().catch(e=>{console.error(e);process.exit(1);});

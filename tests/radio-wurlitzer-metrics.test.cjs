const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('analytics.js','utf8');
const tick=()=>new Promise(r=>setImmediate(r));
async function boot({id='rwAudio',internal=false,disabled=false,gpc=false}={}){
 let clock=0;const events=[],listeners={},storage=new Map();if(internal)storage.set('derej.metrics.internal.v1','true');if(disabled)storage.set('derej.metrics.enabled.v1','false');
 const store={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 const screen={hidden:false,classList:{contains:()=>true},dataset:{screen:'radio'}};
 const doc={visibilityState:'visible',getElementById:()=>null,querySelector:()=>({}),querySelectorAll:()=>[screen],addEventListener:(k,f)=>(listeners[k]??=[]).push(f)};
 const ctx={document:doc,location:{hostname:'derej-beta-comunitaria.vercel.app',search:''},navigator:{onLine:true,globalPrivacyControl:gpc},localStorage:store,sessionStorage:{...store},URLSearchParams,Intl,Date,crypto:require('node:crypto').webcrypto,performance:{now:()=>clock},matchMedia:()=>({matches:false}),MutationObserver:class{observe(){}},setInterval:()=>{},setTimeout,addEventListener:()=>{},fetch:async(u,o)=>{events.push(...JSON.parse(o.body).events);return {ok:true}}};
 vm.runInNewContext(source,ctx);await tick();
 const audio={id,dataset:{metricsTrack:'vayera-meditacion-1',metricsCollection:'vayera-meditacion'},currentTime:0,duration:60,paused:false,muted:false,volume:1,seeking:false,playbackRate:1,getAttribute:()=>'/song.mp3'};
 const fire=async(type)=>{for(const f of listeners[type]||[])f({type,target:audio});await tick();};
 const advance=async(s)=>{clock+=s*1000;audio.currentTime+=s;await fire('timeupdate');};
 return {events,audio,fire,advance,storage};
}
(async()=>{
 for(const id of ['rwAudio','radioV21Audio']){
  const b=await boot({id});await b.advance(10);assert.equal(b.events.filter(e=>e.event_type==='radio_start').length,0);
  await b.fire('playing');await b.fire('playing');await b.advance(20);b.audio.paused=true;await b.fire('pause');await b.advance(40);b.audio.paused=false;await b.fire('playing');await b.advance(10);
  assert.equal(b.events.filter(e=>e.event_type==='radio_start').length,1);assert.equal(b.events.filter(e=>e.event_type==='radio_30s').length,1);
 }
 let b=await boot({internal:true});await b.fire('playing');for(let i=0;i<6;i++)await b.advance(10);await b.fire('ended');assert.equal(b.events.filter(e=>e.event_type==='radio_complete').length,1);assert(b.events.every(e=>e.is_test));assert(b.events.filter(e=>e.event_type.startsWith('radio')).every(e=>e.collection_id==='vayera-meditacion'&&e.track_id==='vayera-meditacion-1'));
 b=await boot();await b.fire('playing');b.audio.seeking=true;await b.advance(60);b.audio.seeking=false;await b.fire('ended');assert(!b.events.some(e=>e.event_type==='radio_complete'));
 for(const config of [{gpc:true},{disabled:true}]){b=await boot(config);await b.fire('playing');await b.advance(40);assert.equal(b.events.length,0);}
 console.log('PASS: ambos reproductores, precarga sin inicio, pausa/reanudación sin duplicados, 30s, final real, saltos excluidos, revisión interna, opt-out y GPC');
})();

const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),pause=ms=>new Promise(r=>setTimeout(r,ms||75));
async function boot({url='https://derej.example/',saved={},blocked=false,failStudy=false,failRadio=false,studyDelay=0}={}){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc}),w=dom.window;
 require('./browser-lifecycle.cjs')(w);
 const DateBase=w.Date;w.Date=class extends DateBase{constructor(...args){super(...(args.length?args:['2026-10-29T12:00:00Z']));}static now(){return DateBase.parse('2026-10-29T12:00:00Z');}};
 let y=0,mediaLoads=0;
 Object.defineProperty(w,'scrollY',{get:()=>y});w.scrollTo=arg=>{y=arg?.top||0;};
 w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLElement.prototype.scrollTo=function(){};
 w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.setInterval=()=>0;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
 w.HTMLMediaElement.prototype.load=function(){mediaLoads++;};w.HTMLMediaElement.prototype.pause=function(){};
 for(const [k,v]of Object.entries({'derej-welcome-v1':'{"completed":true}','derej.metrics.enabled.v1':'false',...saved}))w.localStorage.setItem(k,v);
 if(blocked)Object.defineProperty(w,'localStorage',{get(){throw Error('blocked');}});
 w.fetch=async url=>{
  const source=String(url);
  if(source.includes('caminos-ramak')&&studyDelay)await pause(studyDelay);
  if(source.includes('caminos-ramak')&&failStudy)throw Error('offline');
  if(source.includes('radio-wurlitzer.json')&&failRadio)throw Error('offline');
  const file=path.join(root,source.split('?')[0]);
  if(fs.existsSync(file))return{ok:true,json:async()=>JSON.parse(fs.readFileSync(file,'utf8'))};
  return{ok:false,status:503,json:async()=>({}),arrayBuffer:async()=>new ArrayBuffer(0)};
 };
 const run=s=>vm.runInContext(s,dom.getInternalVMContext());
 for(const script of w.document.querySelectorAll('script[src]'))run(fs.readFileSync(path.join(root,script.getAttribute('src').split('?')[0]),'utf8'));
 await pause(180);
 return {w,run,errors,get mediaLoads(){return mediaLoads;},setStudyOffline:v=>failStudy=v,setRadioOffline:v=>failRadio=v,click:selector=>{const el=w.document.querySelector(selector);assert(el,selector);el.click();},screen:()=>w.document.querySelector('.screen.active:not([hidden])')?.dataset.screen,close:()=>w.close()};
}
(async()=>{
 const note='<img src=x onerror="alert(1)"> A & B';
 let b=await boot({saved:{'derej-v21-encuentro-ramak-noaj-2':JSON.stringify({schema:'ramak-v21',parasha:'Noaj',dia:2,note,savedAt:'2026-10-29T12:00:00Z'}),'derej-v225-personal-sprout':JSON.stringify({body:note})}});
 assert.equal(b.screen(),'home');
 for(const name of ['biblioteca','radio','shabat','moed','pozo','arbol','nombres','voces','personal']){
  b.run('route('+JSON.stringify(name)+')');assert.equal(b.screen(),name);assert.equal(new URL(b.w.location.href).searchParams.get('puerta'),name);
 }
 b.run('route("personal")');assert(!b.w.document.querySelector('#personalMemories img'));assert(b.w.document.querySelector('#personalMemories').textContent.includes(note));
 b.run('route("camino");selectedParasha="Noaj";selectedDay=2;selectedRamakStep="practica";renderRamak(false)');await pause(150);
 // Normal entry may request today's Encounter; explicitly selecting a stage happens afterwards.
 b.run('selectedParasha="Noaj";selectedDay=2;selectedRamakStep="practica";renderRamak(false)');await pause();
 const input=b.w.document.getElementById('ramakNote');input.value='Texto pendiente de guardar';input.dispatchEvent(new b.w.Event('input',{bubbles:true}));
 let query=new URLSearchParams(b.w.location.search);assert.equal(query.get('parasha'),'Noaj');assert.equal(query.get('dia'),'2');assert.equal(query.get('etapa'),'practica');
 b.run('route("personal")');b.click('.personalBack');await pause(140);assert.equal(b.run('selectedDay'),2);assert.equal(b.run('selectedParasha'),'Noaj');assert.equal(b.run('selectedRamakStep'),'practica');assert.equal(b.w.document.getElementById('ramakNote'),input);
 b.run('route("biblioteca")');b.click('[data-nombres-open]');b.click('[data-np-back]');await pause();assert.equal(b.screen(),'biblioteca');assert.equal(new URLSearchParams(b.w.location.search).get('puerta'),'biblioteca');
 b.w.history.back();await pause();assert.equal(b.screen(),'biblioteca');
 b.w.history.back();await pause();assert.equal(b.screen(),'camino');assert.equal(b.run('selectedParasha'),'Noaj');assert.equal(b.run('selectedDay'),2);assert.equal(b.run('selectedRamakStep'),'practica');assert.equal(b.w.document.getElementById('ramakNote').value,'Texto pendiente de guardar');
 b.run('route("genealogias");document.getElementById("derej-raices-v2").genealogy.openStudy("hagar")');
 assert(new URLSearchParams(b.w.location.search).has('persona'));b.run('route("home")');assert(!new URLSearchParams(b.w.location.search).has('persona'));assert(!new URLSearchParams(b.w.location.search).has('estudio'));
 b.run('route("no-existe")');assert.equal(b.screen(),'home');assert(!b.w.document.getElementById('portalRouteStatus').hidden);
 const mutations=[];const watch=new b.w.MutationObserver(records=>mutations.push(...records));watch.observe(b.w.document.body,{subtree:true,childList:true,attributes:true});await pause(100);mutations.length=0;await pause(120);assert(mutations.length<12,'Interfaz inactiva en bucle: '+mutations.length+' mutaciones');watch.disconnect();
 assert.deepEqual(b.errors,[]);b.close();
 b=await boot({url:'https://derej.example/?puerta=camino&parasha=Noaj&dia=2&etapa=profundizar'});assert.equal(b.screen(),'camino');assert.equal(b.run('selectedDay'),2);assert.equal(b.run('selectedRamakStep'),'profundizar');b.close();
 b=await boot({studyDelay:500});b.run('route("camino")');await pause(600);assert(b.w.document.querySelector('#ramakDayStrip .today.on'),'La entrada durante una carga lenta debe abrir el estudio de hoy');b.close();
 b=await boot({url:'https://derej.example/?estudio=profundizar&dia=7',saved:{'derej-welcome-v1':'{"completed":false}'}});b.click('[data-welcome="skip"]');await pause(180);assert.equal(b.w.document.getElementById('prTitle').textContent,'Vayerá · 7ª aliyá');b.close();
 b=await boot({blocked:true});assert.deepEqual(b.errors,[]);b.run('route("camino")');b.click('[data-ramak-step="practica"]');const field=b.w.document.getElementById('ramakNote');field.value='No perder esta nota';field.dispatchEvent(new b.w.Event('input',{bubbles:true}));assert(b.w.document.getElementById('ramakDraftStatus').textContent.includes('No pudimos guardar'));b.click('[data-ramak-complete]');assert(b.w.document.querySelector('.ramakCompleteHint').textContent.includes('No pudimos guardar'));b.close();
 b=await boot({failStudy:true,failRadio:true});assert(b.w.document.querySelector('[data-study-retry]'));assert(!b.w.document.querySelector('.rwCatalogNotice').hidden);b.setStudyOffline(false);b.click('[data-study-retry]');b.setRadioOffline(false);b.click('.rwCatalogNotice button');await pause(150);assert(b.w.document.getElementById('ramakWeekIndex'));assert(b.w.document.querySelector('.rwCatalogNotice').hidden);assert(b.w.document.querySelectorAll('#rwAlbums button').length);b.close();
 console.log('PASS portal: todas las pantallas, URLs y enlaces directos, Atrás recupera día/etapa/borrador, retorno desde Nombres, limpieza de enlaces, notas como texto, almacenamiento bloqueado, reintentos de estudio y Radio e interfaz estable en reposo.');
})().catch(e=>{console.error(e);process.exit(1);});

const {JSDOM}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'content/caminos-ramak-v25.json'),'utf8'));
const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://derej-beta-comunitaria.vercel.app/',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,evaluate=s=>vm.runInContext(s,dom.getInternalVMContext());
w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
w.HTMLElement.prototype.scrollIntoView=function(){};w.scrollTo=()=>{};
let pauses=0;
w.HTMLMediaElement.prototype.load=function(){};w.HTMLMediaElement.prototype.pause=function(){pauses++;};w.setInterval=()=>0;
const requests=[];
w.fetch=async url=>{requests.push(String(url));return {ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,String(url).includes('caminos-ramak')?'content/caminos-ramak-v25.json':'radio.json'),'utf8'))};};
const pause=()=>new Promise(r=>setTimeout(r,40));
(async()=>{
 for(const f of ['encuentros-v21.js','prelaunch-local.js','mobile-v234.js','navigation-v235.js','cleanup-v236.js','navigation-v241.js','midrash-diario-es.js','midrash-es.js'])evaluate(fs.readFileSync(path.join(root,f),'utf8'));
 await pause();evaluate('route("camino")');
 const oldProgress=w.localStorage.getItem('derej-v23-camino-progress'),oldRequests=requests.length,oldPauses=pauses;
 const curated=w.DEREJ_MIDRASH_DIARIO_ES;const seen=new Set(),vayeraSeen=new Set();let covered=0;
 for(const p of data.parashot){
  w.document.querySelector(`[data-ramak-parasha="${p.parasha}"]`).click();
  for(const c of p.caminos){
   w.document.querySelector(`#ramakDayStrip [data-ramak-day="${c.dia}"]`).click();await pause();
   const key=`${p.parasha}|${c.dia}`,item=curated[key];
   assert.equal(w.document.querySelectorAll('#derejMidrashReader,#derejMidrashSelect').length,0);
   const article=w.document.getElementById('derejMidrashDaily'),questions=w.document.getElementById('derejMidrashQuestions');
   if(!item){assert(!article,key);assert(!questions,key);continue;}
   covered++;
   assert(article.closest('[data-ramak-panel="raiz"]'));assert(questions.closest('[data-ramak-panel="profundizar"]'));
   assert.equal(article.dataset.dayKey,key);assert.equal(questions.dataset.dayKey,key);
   assert.equal(article.querySelector('h3').textContent,item.title);
   assert.equal(article.querySelector('.midrashDailyEyebrow').textContent,item.eyebrow||'MIDRASH DE HOY');
   assert(article.textContent.includes(item.source));assert(article.textContent.includes('Adaptación al español'));
   assert.equal(article.querySelectorAll('select,a,li').length,0);
   assert.equal(questions.querySelectorAll('li').length,2);assert(!questions.open);
   assert(!/[\u0590-\u05ff]/.test(article.textContent));
   const range=/^(\S+)\s+(\d+):(\d+)-(\d+):(\d+)$/.exec(c.aliyaRange);assert(range,c.aliyaRange);
   assert.equal(item.passage.book,range[1]);
   const point=item.passage.chapter*1000+item.passage.verse;
   assert(point>=Number(range[2])*1000+Number(range[3])&&point<=Number(range[4])*1000+Number(range[5]),key);
   if(p.parasha==='Lej Lejá'){assert(!seen.has(item.text));seen.add(item.text);}
   if(p.parasha==='Vayera'){assert(!vayeraSeen.has(item.text));vayeraSeen.add(item.text);}
  }
 }
 assert.equal(seen.size,7);assert.equal(vayeraSeen.size,7);assert.equal(covered,17);
 assert.equal(requests.length,oldRequests);assert.equal(pauses,oldPauses);
 assert.equal(w.localStorage.getItem('derej-v23-camino-progress'),oldProgress);
 console.log('PASS: 140 jornadas; 17 lecturas con anclaje bíblico dentro de la lectura diaria, siete Midrash distintos en Lej Lejá, preguntas separadas, ninguna sustitución genérica, progreso y audio conservados.');
 dom.window.close();
})().catch(e=>{console.error(e);dom.window.close();process.exit(1);});

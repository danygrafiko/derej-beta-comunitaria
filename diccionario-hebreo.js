/* Dérej · Diccionario de hebreo bíblico. Sin dependencias externas. */
(()=>{
 'use strict';
 const $=s=>document.querySelector(s);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const normalize=s=>String(s).normalize('NFD').replace(/\p{M}/gu,'').replace(/[ךםןףץ]/g,c=>({'ך':'כ','ם':'מ','ן':'נ','ף':'פ','ץ':'צ'}[c])).replace(/[־–—-]/g,' ').toLowerCase().trim();
 const key='derej.hebreo.guardados.v1';
 let data,guide,entries=[],byId=new Map(),saved=new Set(),letter='',onlySaved=false,limit=24,previousId='',listScroll=0,focusCard='';
 const views=['explorer','entry','guide','journeys','tradition','sources'];
 try{const v=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(v))saved=new Set(v.filter(x=>typeof x==='string'));}catch{}
 const pars=paras=>paras.map(p=>'<p>'+esc(p)+'</p>').join('');
 const chips=ids=>'<div class="chips">'+ids.filter(id=>byId.has(id)).map(id=>'<a href="#palabra='+encodeURIComponent(id)+'">'+esc(byId.get(id).transliteration)+'</a>').join('')+'</div>';
 function persist(){try{localStorage.setItem(key,JSON.stringify([...saved]));return true;}catch{return false;}}
 function title(id,t,lead){return '<span class="eyebrow">BIBLIOTECA · HEBREO BÍBLICO</span><h2 id="'+id+'" tabindex="-1">'+esc(t)+'</h2>'+(lead?'<p class="lead">'+esc(lead)+'</p>':'');}
 function reset(){letter='';onlySaved=false;$('#query').value='';$('#category').value='';limit=24;renderList();}
 function renderList(){
  const query=normalize($('#query').value),words=query.split(/\s+/).filter(Boolean),cat=$('#category').value;
  const matches=entries.filter(e=>(!letter||normalize(e.hebrew).startsWith(letter))&&(!cat||e.category===cat)&&(!onlySaved||saved.has(e.id))&&words.every(w=>e.searchText.includes(w)));
  const field=$('#sort').value==='spanish'?'transliteration':'hebrew';
  matches.sort((a,b)=>normalize(a[field]).localeCompare(normalize(b[field]),field==='hebrew'?'he':'es'));
  $('#count').textContent=matches.length+' de '+entries.length+' palabras'+(matches.length>limit?' · mostrando '+limit:'');
  $('#empty').hidden=matches.length!==0;
  $('#wordGrid').innerHTML=matches.slice(0,limit).map(e=>'<button type="button" class="wordCard" data-open="'+e.id+'"><span class="wordHe" lang="he" dir="rtl">'+esc(e.hebrew)+'</span>'+(saved.has(e.id)?'<em>Guardada</em>':'')+'<strong>'+esc(e.transliteration)+'</strong><span class="gloss">'+esc(e.meanings.slice(0,3).join(' · '))+'</span><span class="cardBottom"><span>'+esc(e.category)+'</span><span aria-hidden="true">↗</span></span></button>').join('');
  $('#loadMore').hidden=matches.length<=limit;
  $('#onlySaved').setAttribute('aria-pressed',String(onlySaved));
  $('#savedCount').textContent=String([...saved].filter(id=>byId.has(id)).length);
  document.querySelectorAll('[data-letter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.letter===letter)));
 }
 function passage(r){
  const he=r.tokens.map(t=>(t.match?'<mark>':'')+esc(t.text)+(t.match?'</mark>':'')).join(' ');
  const url='https://www.stepbible.org/?q='+encodeURIComponent('version=OHB|reference='+r.osis);
  return '<details class="passage"><summary>'+esc(r.label.replace(' (numeración hebrea)',''))+'<small>Numeración hebrea · abrir texto y forma destacada</small></summary><p class="verse" lang="he" dir="rtl">'+he+'</p><p class="forms">Forma'+(r.forms.length>1?'s':'')+' en el pasaje: '+r.forms.map(f=>'<bdi lang="he" dir="rtl">'+esc(f.text)+'</bdi>').join(' · ')+'</p><a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">Consultar el pasaje en STEP Bible ↗</a></details>';
 }
 function related(e){
  const root=normalize(e.root).match(/[א-ת]{2,4}/g)||[];
  const family=entries.filter(x=>x.id!==e.id&&root.length&&root.some(r=>normalize(x.root).includes(r))).map(x=>x.id);
  const route=guide.journeys.find(j=>j.ids.includes(e.id));
  return [...new Set([...family,...(route?.ids||[]),...entries.filter(x=>x.category===e.category).map(x=>x.id)])].filter(id=>id!==e.id).slice(0,7);
 }
 function renderEntry(e){
  const notes=e.study;
  $('#entry').innerHTML='<div class="entryBar"><button type="button" id="backResults">← Volver a las palabras</button><button type="button" id="saveWord" aria-pressed="'+saved.has(e.id)+'">'+(saved.has(e.id)?'Guardada ✓':'Guardar palabra')+'</button></div><header class="entryHeader"><span class="eyebrow">'+esc(e.category)+'</span><span class="entryHe" lang="he" dir="rtl">'+esc(e.hebrew)+'</span><h2 id="entryTitle" tabindex="-1">'+esc(e.transliteration)+'</h2><p class="meaning">'+esc(e.meanings.join(' · '))+'</p><p class="pronunciation">'+(e.id==='yhwh'?'Forma reverente para referirse al Nombre; no es una pronunciación de las cuatro consonantes.':'Pronunciación orientativa contemporánea para hispanohablantes.')+'</p></header><dl class="facts"><div><dt>Forma de diccionario</dt><dd>'+esc(e.grammar)+'</dd></div><div><dt>Raíz o familia</dt><dd dir="auto">'+esc(e.root)+'</dd></div><div><dt>Localizar en el léxico</dt><dd>'+esc(e.strong)+' · índice de referencia</dd></div></dl><div class="entryContent"><h3>Leer en contexto</h3><p>'+esc(e.context)+'</p><aside class="contextNote"><h3>Un matiz que conviene cuidar</h3><p>'+esc(e.caution)+'</p></aside>'+(e.lexical_note?'<p class="sourceCaption">'+esc(e.lexical_note)+'</p>':'')+'<h3>Volver a los pasajes</h3><p class="sourceCaption">La forma de la ficha puede cambiar dentro del versículo. Abre cada ejemplo para reconocerla. El texto conserva vocales y omite cantilación.</p>'+e.references.map(passage).join('')+(notes?'<section class="study"><span class="eyebrow">PROFUNDIZAR · NOTA EDITORIAL</span><h3>'+esc(notes.title)+'</h3>'+pars(notes.paragraphs)+'<div class="question"><small>PREGUNTA DE ESTUDIO</small>'+esc(notes.question)+'</div></section>':'')+'<section class="related"><h3>Palabras para comparar</h3>'+chips(related(e))+'</section><div class="entryEnd"><button type="button" id="copyWord">Copiar ficha</button><a href="#fuentes">Fuentes y criterio editorial</a></div><span id="copyStatus" class="copyStatus" role="status" aria-live="polite"></span></div>';
  $('#backResults').onclick=()=>{location.hash='diccionario';};
  $('#saveWord').onclick=()=>{saved.has(e.id)?saved.delete(e.id):saved.add(e.id);const ok=persist();$('#saveWord').setAttribute('aria-pressed',String(saved.has(e.id)));$('#saveWord').textContent=saved.has(e.id)?'Guardada ✓':'Guardar palabra';if(!ok)$('#copyStatus').textContent='Guardada durante esta visita. Este navegador no permitió conservar el guardado al cerrarlo.';};
  $('#copyWord').onclick=async()=>{
   const value=[e.hebrew+' · '+e.transliteration,e.meanings.join('; '),'Gramática: '+e.grammar,'Raíz o familia: '+e.root,'En contexto: '+e.context,'Matiz: '+e.caution,'Pasajes: '+e.references.map(r=>r.label).join('; '),...(notes?[notes.title,...notes.paragraphs,'Pregunta: '+notes.question]:[]),'Dérej · Diccionario de hebreo bíblico · '+location.href].join('\n\n');
   try{if(!navigator.clipboard?.writeText)throw Error('unavailable');await navigator.clipboard.writeText(value);$('#copyStatus').textContent='Ficha copiada.';}catch{$('#copyStatus').textContent='No se pudo copiar automáticamente. Puedes seleccionar y copiar el texto de la ficha.';}
  };
 }
 function renderGuide(){
  const table=t=>'<div class="tableWrap"><table><thead><tr>'+t.headers.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+t.rows.map(r=>'<tr>'+r.map((c,i)=>'<td'+(i===0&&/[א-ת]/.test(c)?' lang="he" dir="rtl"':'')+'>'+esc(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  $('#guide').innerHTML=title('guideTitle','Aprender a leer una palabra','Letras, vocales y pequeñas decisiones que abren el sentido de un pasaje.')+guide.chapters.map((c,i)=>'<details'+(i===0?' open':'')+'><summary>'+esc(c.title)+'</summary><div>'+pars(c.paragraphs)+(c.table?table(c.table):'')+'</div></details>').join('');
  $('#journeys').innerHTML=title('journeysTitle','Una palabra lleva a otra','Recorridos breves para comparar sentidos. No son niveles de valor espiritual.')+guide.journeys.map((j,i)=>'<section class="journey"><span class="eyebrow">RECORRIDO '+String(i+1).padStart(2,'0')+'</span><h3>'+esc(j.title)+'</h3><p>'+esc(j.description)+'</p>'+chips(j.ids)+'</section>').join('');
  $('#tradition').innerHTML=title('traditionTitle','Biblia y tradición','Una misma historia de estudio, con épocas y contextos que conviene distinguir.')+'<p>Estas seis fichas acompañan al diccionario. No se cuentan entre las 128 entradas bíblicas: explican términos de uso rabínico, cabalístico o espiritual posterior y sus posibles antecedentes lingüísticos.</p>'+guide.laterTerms.map(t=>'<section class="laterTerm"><span class="termHe" lang="he" dir="rtl">'+esc(t.hebrew)+'</span><h3>'+esc(t.name)+'</h3><span class="period">'+esc(t.period)+'</span><p><b>'+esc(t.meaning)+'</b></p><p>'+esc(t.note)+'</p><p class="tradSource">'+esc(t.source)+'</p>'+chips(t.related)+'</section>').join('');
  $('#sources').innerHTML=title('sourcesTitle','Fuentes y criterio editorial','Leer con profundidad también significa mostrar de dónde viene cada afirmación.')+'<h3>Alcance de esta edición</h3><p>'+esc(data.scope)+'</p><p>Las glosas, comparaciones y preguntas en español son elaboración editorial de Dérej. Hay 24 notas ampliadas de estudio. No se presentan como traducciones completas de los pasajes ni como una revisión académica independiente.</p><h3>Cómo se cotejaron los ejemplos</h3><p>Se contrastaron las 256 referencias con el texto etiquetado de Open Scriptures Hebrew Bible. En cada pasaje se comprobó la presencia del identificador de la entrada, su variante documentada o el prefijo señalado. Este cotejo comprueba presencia y forma: no sustituye una evaluación semántica completa de todas las traducciones posibles.</p><p>'+esc(data.numbering)+'</p><p>En las fichas se conserva una forma de consulta útil para el lector. Panim y mayim se presentan en su forma habitual de uso; tiféret es una variante de la entrada que algunos léxicos encabezan como tifará. Estas decisiones no cambian la forma destacada en los ejemplos.</p><h3>Pronunciación y traducción</h3><p>'+esc(data.transliteration)+'</p><p>El Nombre de cuatro consonantes se conserva sin vocalización propuesta. HaShem es una forma tradicional de referirse a él. Creador de todo es la preferencia de la voz editorial; no se borran los distintos nombres o títulos que efectivamente contiene un pasaje.</p><h3>La fuente y su función</h3>'+data.sources.map(s=>'<section class="sourceItem"><h3><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.name)+' ↗</a></h3><p>'+esc(s.use)+'</p></section>').join('')+'<h3>Atribución</h3><p>Original work of the Open Scriptures Hebrew Bible available at <a href="https://github.com/openscriptures/morphhb">github.com/openscriptures/morphhb</a>. Anotación bajo <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>; texto Westminster Leningrad Codex de dominio público. En la vista se han retirado signos de cantilación y marcas auxiliares. Corpus cotejado: 3d15126fb1ef74867fc1434be1942e837932691f.</p><p>Referencia lexicográfica: Brown, Driver y Briggs, <i>A Hebrew and English Lexicon of the Old Testament</i> (1906), y Open Scriptures Hebrew Lexicon. Cotejo complementario de lemas: STEP Bible, basado en el trabajo de Tyndale House, Cambridge. No se copian las definiciones inglesas de TBESH.</p><h3>Una edición que reconoce sus límites</h3><p>Se han seleccionado términos centrales para las lecturas de Dérej. Quedan fuera miles de vocablos, la descripción completa de variantes textuales y una historia exhaustiva de todas las interpretaciones. Los sentidos discutidos se identifican como tales. Las aplicaciones contemplativas se distinguen de las definiciones lingüísticas.</p>';
 }
 function route(focus=true){
  const raw=location.hash.slice(1),id=raw.startsWith('palabra=')?decodeURIComponent(raw.slice(8)):null;
  const mode=id?'entry':({'guia':'guide','recorridos':'journeys','tradicion':'tradition','fuentes':'sources'}[raw]||'explorer');
  views.forEach(v=>$('#'+v).hidden=v!==mode);
  document.body.classList.toggle('noHero',mode==='entry');
  const nav={explorer:'diccionario',entry:'diccionario',guide:'guia',journeys:'recorridos',tradition:'tradicion',sources:'fuentes'}[mode];
  document.querySelectorAll('[data-nav]').forEach(a=>a.dataset.nav===nav?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
  if(mode==='entry'){
   const e=byId.get(id);
   if(!e){$('#entry').innerHTML='<h2 id="entryTitle" tabindex="-1">No encontramos esa palabra.</h2><p>El enlace puede corresponder a una grafía diferente.</p><a href="#diccionario">Explorar el diccionario</a>';}
   else{renderEntry(e);document.title=e.transliteration+' · Hebreo bíblico · Dérej';}
  }else{
   document.title='Hebreo bíblico · Biblioteca Dérej';
   if(mode==='explorer')renderList();
  }
  if(focus){
   if(mode==='explorer'&&previousId==='entry'){
    const card=document.querySelector('[data-open="'+CSS.escape(focusCard)+'"]');
    (card||$('#explorerTitle')).focus({preventScroll:true});window.scrollTo({top:listScroll,behavior:'instant'});
   }else{
    const heading=$('#'+mode+' h2');heading?.focus({preventScroll:true});$('#'+mode).scrollIntoView({block:'start',behavior:'instant'});
   }
  }
  previousId=mode;
 }
 async function init(){
  try{
   if(window.DEREJ_HEBREO){data=window.DEREJ_HEBREO;guide=window.DEREJ_HEBREO_GUIDE;}
   else{
    const results=await Promise.all(['content/hebreo/diccionario.json?v=1','content/hebreo/guia.json?v=1'].map(async url=>{const r=await fetch(url);if(!r.ok)throw Error('HTTP '+r.status);return r.json();}));[data,guide]=results;
   }
   entries=data.entries;byId=new Map(entries.map(e=>[e.id,e]));
   entries.forEach(e=>{e.searchText=normalize([e.id,e.hebrew,e.transliteration,e.root,e.strong,e.category,...e.meanings,...e.aliases,...e.references.flatMap(r=>r.forms.map(f=>f.text))].join(' '));});
   [...new Set(entries.map(e=>e.category))].sort((a,b)=>a.localeCompare(b,'es')).forEach(c=>{const opt=document.createElement('option');opt.value=c;opt.textContent=c;$('#category').append(opt);});
   $('#alphabet').innerHTML=['',...'אבגדהוזחטיכלמנסעפצקרשת'].map(l=>'<button type="button" data-letter="'+l+'" aria-pressed="'+(!l)+'"'+(l?' lang="he" aria-label="Letra '+l+'"':'')+'>'+ (l||'Todas')+'</button>').join('');
   $('#alphabet').onclick=e=>{const b=e.target.closest('[data-letter]');if(!b)return;letter=b.dataset.letter;limit=24;renderList();};
   $('#query').addEventListener('input',()=>{limit=24;renderList();});
   $('#clearSearch').onclick=()=>{$('#query').value='';limit=24;renderList();$('#query').focus();};
   $('#category').onchange=()=>{limit=24;renderList();};$('#sort').onchange=renderList;
   $('#onlySaved').onclick=()=>{onlySaved=!onlySaved;limit=24;renderList();};
   $('#reset').onclick=reset;$('#emptyReset').onclick=reset;
   $('#loadMore').onclick=()=>{const prev=limit;limit+=24;renderList();document.querySelectorAll('[data-open]')[prev]?.focus();};
   $('#wordGrid').onclick=e=>{const b=e.target.closest('[data-open]');if(!b)return;focusCard=b.dataset.open;listScroll=window.scrollY;location.hash='palabra='+encodeURIComponent(b.dataset.open);};
   renderGuide();$('#loading').hidden=true;route(Boolean(location.hash));
   window.addEventListener('hashchange',()=>route());
  }catch(error){$('#loading').className='error';$('#loading').innerHTML='No pudimos cargar el diccionario. Revisa tu conexión y <button type="button" id="retryLoad">volver a intentar</button>.';$('#retryLoad').onclick=()=>location.reload();}
 }
 init();
})();

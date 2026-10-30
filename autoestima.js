/* Biblioteca Dérej: lectura por capítulos. No recoge notas ni datos de salud. */
(()=>{
 'use strict';
 const data=window.DEREJ_AUTOESTIMA,screen=document.querySelector('[data-screen="autoestima"]');
 if(!data?.chapters?.length||!screen)return;
 const chapters=data.chapters,article=document.getElementById('aeArticle'),index=document.getElementById('aeChapters');
 document.addEventListener('click',event=>{if(event.target.closest('a[data-route="autoestima"]'))event.preventDefault();},true);
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let current='inicio';
 const fromHash=()=>location.hash.match(/^#autoestima-(inicio|fuentes|\d+)$/)?.[1];
 const valid=id=>chapters.some(c=>c.id===id);
 const text=s=>esc(s).replace(/\[(\d+)\]/g,'<button type="button" class="aeCitation" data-ae-source="$1" aria-label="Consultar fuente $1">[$1]</button>');
 index.innerHTML=chapters.map(c=>`<button type="button" data-ae-chapter="${esc(c.id)}">${esc(c.title)}</button>`).join('');
 document.getElementById('aeIndexCount').textContent='19 lecturas';
 function draw(id,{focus=false,url=false,source=null}={}){
  if(!valid(id))id='inicio';current=id;
  const n=chapters.findIndex(c=>c.id===id),chapter=chapters[n];
  let reference='';
  article.innerHTML=`<h2 id="aeChapterTitle" tabindex="-1">${esc(chapter.title)}</h2>`+chapter.blocks.map(b=>{
   if(b.type==='heading')return `<h3>${esc(b.text)}</h3>`;
   if(b.type==='link'){
    let href;try{href=new URL(b.text);if(href.protocol!=='https:')return '';}catch{return '';}
    return `<a class="aeSourceLink" href="${esc(href.href)}" target="_blank" rel="noopener noreferrer">Consultar fuente${reference?' '+reference:''} ↗ <span>${esc(href.hostname)}</span></a>`;
   }
   const ref=id==='fuentes'&&b.text.match(/^\[(\d+)\]/)?.[1];
   if(ref)reference=ref;
   return `<p${ref?` id="aeSource${ref}" tabindex="-1"`:''}>${id==='fuentes'?esc(b.text):text(b.text)}</p>`;
  }).join('');
  document.getElementById('aePosition').textContent=`Lectura ${n+1} de ${chapters.length} · Editorial Dérej`;
  document.getElementById('aePrevious').disabled=n===0;
  document.getElementById('aeNext').disabled=n===chapters.length-1;
  screen.querySelectorAll('[data-ae-chapter]').forEach(b=>{
   if(b.dataset.aeChapter===id)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
  });
  if(url){const target=new URL(location.href);target.hash='autoestima-'+id;history.replaceState(history.state,'',target);}
  if(focus){
   const target=source?document.getElementById('aeSource'+source):document.getElementById('aeChapterTitle');
   target?.focus({preventScroll:true});target?.scrollIntoView({block:'start',behavior:'instant'});
  }
 }
 screen.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.aeChapter){draw(button.dataset.aeChapter,{focus:true,url:true});document.getElementById('aeIndexDetails').open=false;}
  if(button.dataset.aeSource)draw('fuentes',{focus:true,url:true,source:button.dataset.aeSource});
  const n=chapters.findIndex(c=>c.id===current);
  if(button.id==='aePrevious'&&n>0)draw(chapters[n-1].id,{focus:true,url:true});
  if(button.id==='aeNext'&&n<chapters.length-1)draw(chapters[n+1].id,{focus:true,url:true});
 });
 window.addEventListener('popstate',()=>{if(!screen.hidden)draw(fromHash()||current);});
 window.addEventListener('hashchange',()=>{if(!screen.hidden&&valid(fromHash()))draw(fromHash());});
 document.addEventListener('derej-route-change',event=>{
  if(event.detail?.name==='autoestima'&&valid(fromHash()))draw(fromHash());
 });
 draw(fromHash()||'inicio');
})();

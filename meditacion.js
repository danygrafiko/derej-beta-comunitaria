/* Biblioteca Dérej · lector de meditación. No registra reflexiones personales. */
(()=>{
 'use strict';
 const data=window.DEREJ_MEDITACION,screen=document.querySelector('[data-screen="meditacion"]');
 if(!screen||!data?.chapters?.length)return;
 const $=id=>document.getElementById(id);
 const chapters=[...data.chapters,{id:'fuentes',title:'Fuentes y notas de lectura',blocks:[]}];
 const article=$('mdArticle'),index=$('mdChapters');
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const valid=id=>chapters.some(c=>c.id===id);
 const fromHash=()=>location.hash.match(/^#meditacion-(inicio|recorrido|glosario|fuentes|10|[1-9])$/)?.[1];
 const cites=s=>esc(s).replace(/\[(\d+(?:,\s*\d+)*)\]/g,(_,refs)=>refs.split(',').map(n=>n.trim()).map(n=>`<button type="button" class="mdCitation" data-md-source="${n}" aria-label="Consultar fuente ${n}">[${n}]</button>`).join(' '));
 let current='inicio',returnChapter=null;
 const sourceLink=source=>{
  try{
   const url=new URL(source.url);if(url.protocol!=='https:')return '';
   return `<a class="mdSourceLink" href="${esc(url.href)}" target="_blank" rel="noopener noreferrer">Consultar la fuente ↗ <span>${esc(url.hostname)}</span></a>`;
  }catch{return '';}
 };
 index.innerHTML=chapters.map(c=>`<button type="button" data-md-chapter="${esc(c.id)}">${/^\d+$/.test(c.id)?esc(c.id)+'. ':''}${esc(c.short||c.title)}</button>`).join('');
 $('mdIndexCount').textContent=chapters.length+' lecturas';
 function draw(id,{focus=false,url=false,source=null}={}){
  if(!valid(id))id='inicio';current=id;
  const n=chapters.findIndex(c=>c.id===id),chapter=chapters[n];
  let body=`<h2 id="mdChapterTitle" tabindex="-1">${esc(chapter.title)}</h2>`;
  if(chapter.subtitle)body+=`<p class="mdLead">${esc(chapter.subtitle)}</p>`;
  if(chapter.level)body+=`<p class="mdMeta">${esc(chapter.level)} · ${esc(chapter.duration)}</p>`;
  if(id==='inicio'){
   body+='<div class="mdMap" aria-label="Los diez enfoques">'+chapters.filter(c=>/^\d+$/.test(c.id)).map(c=>`<button type="button" data-md-chapter="${c.id}"><span>${c.id.padStart(2,'0')}</span><strong>${esc(c.short)}</strong><small>${esc(c.theme)}</small></button>`).join('')+'</div>';
  }
  if(id==='fuentes'){
   body+='<p>Los textos clásicos se distinguen de las exposiciones contemporáneas. Los ejercicios, sus duraciones y las oraciones originales son adaptaciones pedagógicas de Dérej. Las referencias bíblicas siguen la numeración hebrea.</p>';
   body+=data.sources.map(s=>`<section class="mdSource" id="mdSource${s.id}" tabindex="-1"><h3>[${s.id}] ${esc(s.title)}</h3><p class="mdAuthor">${esc(s.author)}</p><p>${esc(s.note)}</p>${sourceLink(s)}</section>`).join('');
  }else body+=chapter.blocks.map(b=>`<section class="mdBlock"><h3>${esc(b.title)}</h3>${b.items?'<ul>'+b.items.map(t=>'<li>'+cites(t)+'</li>').join('')+'</ul>':'<p>'+cites(b.text)+'</p>'}</section>`).join('');
  article.innerHTML=body;
  $('mdPosition').textContent=`Lectura ${n+1} de ${chapters.length} · Editorial Dérej`;
  $('mdPrevious').disabled=n===0;$('mdNext').disabled=n===chapters.length-1;
  $('mdReturn').hidden=id!=='fuentes'||!returnChapter;
  screen.querySelectorAll('[data-md-chapter]').forEach(b=>{
   if(b.dataset.mdChapter===id)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
  });
  if(url){const target=new URL(location.href);target.hash='meditacion-'+id;history.replaceState(history.state,'',target);}
  if(focus){
   const target=source?$('mdSource'+source):$('mdChapterTitle');
   target?.focus({preventScroll:true});target?.scrollIntoView({block:'start',behavior:'instant'});
   $('mdStatus').textContent=source?'Fuente '+source:chapter.title;
  }
 }
 screen.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.mdChapter){draw(button.dataset.mdChapter,{focus:true,url:true});$('mdIndexDetails').open=false;}
  else if(button.dataset.mdSource){if(current!=='fuentes')returnChapter=current;draw('fuentes',{focus:true,url:true,source:button.dataset.mdSource});}
  else if(button.id==='mdReturn'&&returnChapter)draw(returnChapter,{focus:true,url:true});
  else{
   const n=chapters.findIndex(c=>c.id===current);
   if(button.id==='mdPrevious'&&n>0)draw(chapters[n-1].id,{focus:true,url:true});
   if(button.id==='mdNext'&&n<chapters.length-1)draw(chapters[n+1].id,{focus:true,url:true});
  }
 });
 document.addEventListener('click',e=>{if(e.target.closest('a[data-route="meditacion"]'))e.preventDefault();},true);
 window.addEventListener('hashchange',()=>{if(!screen.hidden&&valid(fromHash()))draw(fromHash());});
 window.addEventListener('popstate',()=>{if(!screen.hidden)draw(fromHash()||current);});
 document.addEventListener('derej-route-change',e=>{if(e.detail?.name==='meditacion'&&valid(fromHash()))draw(fromHash());});
 draw(fromHash()||'inicio');
})();

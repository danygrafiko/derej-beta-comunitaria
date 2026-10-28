(()=>{'use strict';
const root=document.getElementById('radioWurlitzer');if(!root)return;
const $=id=>document.getElementById(id);
const storageBase=(window.DEREJ_CONFIG?.audioBase||'https://ryeztkcyopbmwwaacpxl.supabase.co/storage/v1/object/public/radio-derej').replace(/\/$/,'');
const fallback='icon-512.png';
const icons={
 play:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M8 4.5a1 1 0 0 1 1.5-.86l10 7a1.6 1.6 0 0 1 0 2.72l-10 7A1 1 0 0 1 8 19.5z"/></svg>',
 pause:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4.5" height="16" rx="1.3"/><rect x="13.5" y="4" width="4.5" height="16" rx="1.3"/></svg>'
};
const audio=$('rwAudio');
/* Reproductor único: barra compacta fuera de la pantalla Radio, para poder
   continuar escuchando al recorrer el Patio y los estudios. */
const rwDock=root.querySelector('.rwPlayer');
const rwRestore=root.querySelector('#rwDockRestore');
if(rwDock)document.body.appendChild(rwDock);
if(rwRestore)document.body.appendChild(rwRestore);
let rwPlaybackStarted=false;
let rwDockMode='compact'; // compacto por defecto: ocupa una sola línea en móvil
function syncDockVisibility(){
 const active=rwPlaybackStarted;
 const visible=active&&rwDockMode!=='hidden';
 document.body.classList.toggle('rwDockVisible',visible);
 document.body.classList.toggle('rwDockHidden',active&&rwDockMode==='hidden');
 document.body.classList.toggle('rwDockExpanded',visible&&rwDockMode==='expanded');
 document.body.classList.toggle('rwDockPlaying',active);
 const onRadio=!root.hidden;
 if(rwRestore)rwRestore.hidden=!(active&&rwDockMode==='hidden'&&!onRadio);
 const inlineRestore=$('rwShowDockInline');
 if(inlineRestore)inlineRestore.hidden=!(active&&rwDockMode==='hidden'&&onRadio);
 const toggle=$('rwDockToggle');
 if(toggle){
   const expanded=rwDockMode==='expanded';
   toggle.setAttribute('aria-expanded',String(expanded));
   toggle.setAttribute('aria-label',expanded?'Minimizar reproductor':'Ampliar reproductor');
   toggle.title=expanded?'Minimizar reproductor':'Ampliar reproductor';
   toggle.innerHTML=expanded?'<svg viewBox="0 0 24 24" aria-hidden="true" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15 6-6 6 6"/></svg>';
 }
}
$('rwDockToggle')?.addEventListener('click',()=>{rwDockMode=rwDockMode==='expanded'?'compact':'expanded';syncDockVisibility()});
$('rwDockDismiss')?.addEventListener('click',()=>{rwDockMode='hidden';syncDockVisibility()});
rwRestore?.addEventListener('click',()=>{rwDockMode='compact';syncDockVisibility()});
$('rwShowDockInline')?.addEventListener('click',()=>{rwDockMode='compact';syncDockVisibility()});
new MutationObserver(syncDockVisibility).observe(root,{attributes:true,attributeFilter:['hidden','class','style']});
audio.addEventListener('play',()=>{
 rwPlaybackStarted=true;
 renderPreviewArtwork();
 syncDockVisibility();
});
syncDockVisibility();
// current is the album being explored; playingPlaylist owns the actual audio.
// Navigating album art never changes the source or position of rwAudio.
let playlists=[],current=null,playingPlaylist=null,index=0,filter='todas',requestVersion=0;
let rwShowingTrackArt=false;
const embeddedCovers=new Map();
function pathUrl(path){
 if(!path)return '';
 if(/^https?:\/\//i.test(path)||path.startsWith('blob:'))return path;
 if(!path.includes('/'))return path;
 return storageBase+'/'+path.split('/').map(encodeURIComponent).join('/');
}
function art(value){return pathUrl(value?.embeddedArtwork||value?.artwork)||fallback}
// Portadas de álbum: la imagen oficial del catálogo nunca debe reemplazarse por una carátula ID3.
// Sólo recurrimos a la carátula incrustada si falta la portada de la colección.
function albumArt(p){const official=p?.artwork&&p.artwork!==fallback?p.artwork:null;return pathUrl(official||p?.embeddedArtwork)||fallback}
function trackArt(t,owner=playingPlaylist||current){return t?.embeddedArtwork?art(t):(!t?.artwork||t.artwork===fallback)?albumArt(owner):art(t)}
function fmt(s){return Number.isFinite(s)&&s>=0?Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'):'0:00'}
function cover(img,url){if(!img)return;img.onerror=()=>{img.onerror=null;img.src=fallback};img.src=url||fallback}
function description(p){
 if(p.id==='vayera-suite')return 'Siete movimientos sinfónicos para recorrer la hospitalidad, la compasión, la promesa y la escucha.';
 if(p.kind==='Meditación guiada')return 'Una pausa para contemplar cada aliyá y acercarnos al Creador de todo.';
 if(p.kind?.includes('Mediterránea'))return 'La historia de Vayerá en una atmósfera mediterránea de melodías y raíces.';
 if(p.kind==='Parashat')return 'Las siete aliyot llevadas al lenguaje musical, para escuchar, recordar y estudiar.';
 return 'Piezas contemplativas para acompañar el silencio y el camino interior.';
}
function musicMeta(t){
 if(!('mediaSession' in navigator)||!t||!playingPlaylist)return;
 try{
   const src=trackArt(t,playingPlaylist);
   navigator.mediaSession.metadata=new MediaMetadata({
     title:t.title,artist:t.artist||'Danygrafiko',album:playingPlaylist.title,
     artwork:[{src,sizes:'any',type:src.startsWith('blob:')?(t.embeddedMime||'image/jpeg'):'image/png'}]
   });
 }catch{}
}
function renderPreviewArtwork(){
 if(!current)return;
 // El álbum seleccionado es una vista. Sólo muestra una carátula de pista
 // si esa misma colección tiene un audio cargado; el resto se puede explorar sin cortes.
 const song=playingPlaylist?.id===current.id ? playingPlaylist.tracks[index] : null;
 rwShowingTrackArt=Boolean(song);
 const src=song?trackArt(song,playingPlaylist):albumArt(current);
 cover($('rwBigCover'),src);
 $('rwBigCover').alt=song?'Carátula de '+song.title+' · '+current.title:'Carátula del álbum '+current.title;
 $('rwVisualLabel').textContent=song
   ? (song.aliyah?'ALIYÁ '+song.aliyah+' · CARÁTULA DE LA CANCIÓN':'CARÁTULA DE LA CANCIÓN')
   : 'PORTADA DE LA COLECCIÓN';
 $('rwVisualTrack').textContent=song?song.title:current.title;
 root.classList.toggle('rwHeroSong',Boolean(song));
}
function renderPlayingCover(){
 const track=playingPlaylist?.tracks?.[index];
 if(track)cover($('rwMiniCover'),trackArt(track,playingPlaylist));
 renderPreviewArtwork();
}
function renderTrackSelection(){
 $('rwTracks').querySelectorAll('button').forEach((b,i)=>{
   const yes=Boolean(current&&playingPlaylist&&current.id===playingPlaylist.id&&i===index);
   b.classList.toggle('active',yes);
   b.setAttribute('aria-current',yes?'true':'false');
 });
}
function setPlayerButtons(){
 const playing=Boolean(playingPlaylist&&!audio.paused&&!audio.ended);
 $('rwPlay').innerHTML=playing?icons.pause:icons.play;
 $('rwPlay').setAttribute('aria-label',playing?'Pausar':'Reproducir');
 const viewingPlaying=Boolean(current&&playingPlaylist&&current.id===playingPlaylist.id);
 const pauseSelected=playing&&viewingPlaying;
 $('rwMainPlay').innerHTML=(pauseSelected?icons.pause:icons.play)+
   '<span>'+(pauseSelected?'Pausar':'Reproducir')+'</span>';
 $('rwMainPlay').setAttribute('aria-label',pauseSelected?'Pausar '+current.title:'Reproducir '+(current?.title||'la playlist'));
}
function sync(){
 setPlayerButtons();
 $('rwStatus').textContent=audio.paused?'En pausa':'Reproduciendo · '+(playingPlaylist?.title||'Radio Dérej');
 if('mediaSession'in navigator)try{navigator.mediaSession.playbackState=audio.paused?'paused':'playing'}catch{}
}
function selectTrack(i,play=true,owner=current){
 if(!owner?.tracks?.length)return;
 index=(i+owner.tracks.length)%owner.tracks.length;
 playingPlaylist=owner;
 const track=owner.tracks[index];
 document.getElementById('radioV21Audio')?.pause();
 const version=++requestVersion;
 const url=track.url||pathUrl(track.path);
 audio.src=url;audio.load();
 $('rwNowTitle').textContent=track.title;
 $('rwNowAlbum').textContent=owner.title;
 $('rwDuration').textContent=track.duration||'0:00';
 $('rwElapsed').textContent='0:00';$('rwSeek').value='0';
 renderPlayingCover();renderTrackSelection();musicMeta(track);setPlayerButtons();
 try{
   localStorage.setItem('derej:rw:playlist',owner.id);
   localStorage.setItem('derej:rw:track:'+owner.id,String(index));
 }catch{}
 if(play)audio.play().catch(()=>{
   $('rwStatus').textContent='Toca Reproducir para iniciar la canción.';
   setPlayerButtons();
 });
 readEmbeddedCover(track).then(src=>{
   // Una carátula que llega tarde no puede modificar la pista actual ni el álbum explorado.
   if(!src||version!==requestVersion||playingPlaylist?.id!==owner.id||playingPlaylist.tracks[index]!==track)return;
   track.embeddedArtwork=src;
   renderPlayingCover();musicMeta(track);
 }).catch(()=>{});
}
function choose(id){
 const p=playlists.find(p=>p.id===id);if(!p)return;
 // Navegar, tocar una portada o usar las flechas no toca audio.src, pause() ni play().
 current=p;
 $('rwTitle').textContent=p.title;
 $('rwSubtitle').textContent=[p.kind,p.tracks.length+' canciones','Danygrafiko'].filter(Boolean).join(' · ');
 $('rwDescription').textContent=description(p);
 const cards=[...$('rwAlbums').querySelectorAll('button')];
 cards.forEach(b=>{
   const active=b.dataset.id===id;
   b.classList.toggle('active',active);
   b.setAttribute('aria-pressed',String(active));
 });
 const activeCard=cards.find(b=>b.dataset.id===id);
 if(activeCard){
   const albums=$('rwAlbums');
   const x=activeCard.offsetLeft-albums.offsetLeft-(albums.clientWidth-activeCard.offsetWidth)/2;
   albums.scrollTo({left:Math.max(0,x),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 }
 const tracks=$('rwTracks');tracks.replaceChildren();
 p.tracks.forEach((t,i)=>{
   const b=document.createElement('button');b.type='button';b.className='rwTrack';
   const num=document.createElement('span');num.className='rwNumber';
   num.textContent=String(t.aliyah||i+1).padStart(2,'0');
   const txt=document.createElement('span');txt.className='rwTrackName';txt.textContent=t.title;
   const d=document.createElement('span');d.className='rwTrackDuration';d.textContent=t.duration||'';
   const iEl=document.createElement('span');iEl.className='rwTrackIcon';iEl.innerHTML=icons.play;
   b.append(num,txt,d,iEl);
   b.addEventListener('click',()=>selectTrack(i,true,p));
   tracks.append(b);
 });
 renderTrackSelection();renderPreviewArtwork();setPlayerButtons();
 try{localStorage.setItem('derej:rw:playlist',id)}catch{}
}
function available(){
 return playlists.filter(p=>filter==='todas'||(filter==='archivo'?!p.parasha:p.parasha===filter));
}
function renderAlbums(){
 const list=available(),albums=$('rwAlbums');
 albums.replaceChildren();
 list.forEach(p=>{
   const b=document.createElement('button');b.type='button';b.className='rwAlbum';
   b.dataset.id=p.id;b.setAttribute('aria-label','Explorar '+p.title);
   b.setAttribute('aria-pressed','false');
   const image=document.createElement('img');image.loading='lazy';image.alt='';
   cover(image,albumArt(p));
   const small=document.createElement('small');small.textContent=p.parasha||'Colección permanente';
   const title=document.createElement('span');title.textContent=p.title;
   b.append(image,small,title);
   b.addEventListener('click',()=>choose(p.id));
   albums.append(b);
 });
 // Los filtros cambian sólo la vista, jamás el contexto que está sonando.
 if(list.length)choose(list.some(p=>p.id===current?.id)?current.id:list[0].id);
}
function setFilter(value){
 filter=value;
 document.querySelectorAll('[data-rw-filter]').forEach(b=>{
   const yes=b.dataset.rwFilter===value;
   b.classList.toggle('active',yes);b.setAttribute('aria-pressed',String(yes));
 });
 renderAlbums();
}
document.querySelectorAll('[data-rw-filter]').forEach(b=>b.addEventListener('click',()=>setFilter(b.dataset.rwFilter)));
function albumStep(dir){
 const buttons=[...$('rwAlbums').querySelectorAll('button')];if(!buttons.length)return;
 const selected=buttons.findIndex(b=>b.dataset.id===current?.id);
 const next=(selected+dir+buttons.length)%buttons.length;
 choose(buttons[next].dataset.id);
}
$('rwAlbumPrev')?.addEventListener('click',()=>albumStep(-1));
$('rwAlbumNext')?.addEventListener('click',()=>albumStep(1));
function toggleDock(){
 if(!playingPlaylist){
   if(current)selectTrack(0,true,current);
   return;
 }
 if(audio.paused)audio.play().catch(()=>{$('rwStatus').textContent='No se pudo iniciar la reproducción.'});
 else audio.pause();
}
function toggleSelected(){
 if(!current)return;
 // Sólo este botón o tocar una pista activa una playlist distinta.
 if(playingPlaylist?.id!==current.id){
   let saved=0;try{saved=Number(localStorage.getItem('derej:rw:track:'+current.id))||0}catch{}
   selectTrack(Math.min(Math.max(0,saved),current.tracks.length-1),true,current);
 }else toggleDock();
}
$('rwPlay').addEventListener('click',toggleDock);
$('rwMainPlay').addEventListener('click',toggleSelected);
$('rwPrev').addEventListener('click',()=>{
 if(!playingPlaylist)return;
 if(audio.currentTime>4)audio.currentTime=0;
 else selectTrack(index-1,true,playingPlaylist);
});
$('rwNext').addEventListener('click',()=>{
 if(playingPlaylist)selectTrack(index+1,true,playingPlaylist);
});
audio.addEventListener('play',sync);audio.addEventListener('pause',sync);
audio.addEventListener('loadedmetadata',()=>{$('rwDuration').textContent=fmt(audio.duration)});
audio.addEventListener('timeupdate',()=>{
 const d=audio.duration;$('rwElapsed').textContent=fmt(audio.currentTime);
 if(Number.isFinite(d)&&d>0)$('rwSeek').value=String(Math.round(audio.currentTime/d*1000));
});
$('rwSeek').addEventListener('input',()=>{
 if(playingPlaylist&&Number.isFinite(audio.duration))audio.currentTime=audio.duration*Number($('rwSeek').value)/1000;
});
audio.addEventListener('ended',()=>{
 if(!playingPlaylist)return;
 if(index<playingPlaylist.tracks.length-1)selectTrack(index+1,true,playingPlaylist);
 else{$('rwStatus').textContent='Playlist completa';setPlayerButtons();}
});
audio.addEventListener('error',()=>{$('rwStatus').textContent='No se pudo cargar esta pista. Prueba la siguiente.'});
if('mediaSession' in navigator)try{
 navigator.mediaSession.setActionHandler('play',()=>{if(audio.paused)toggleDock()});
 navigator.mediaSession.setActionHandler('pause',()=>audio.pause());
 navigator.mediaSession.setActionHandler('previoustrack',()=>{if(playingPlaylist)selectTrack(index-1,true,playingPlaylist)});
 navigator.mediaSession.setActionHandler('nexttrack',()=>{if(playingPlaylist)selectTrack(index+1,true,playingPlaylist)});
 navigator.mediaSession.setActionHandler('seekto',e=>{if(Number.isFinite(e.seekTime)&&playingPlaylist)audio.currentTime=e.seekTime});
}catch{}
// APIC: sólo lectura de etiquetas ID3v2 (sin alterar el MP3). Si CORS o la etiqueta fallan,
// se conserva la portada oficial ya almacenada en Supabase.
async function readEmbeddedCover(track){
 const key=track.path||track.url;
 if(embeddedCovers.has(key))return embeddedCovers.get(key);
 const promise=(async()=>{
   try{
     const url=track.url||pathUrl(track.path);
     // Dos etapas: primero sólo la cabecera ID3; después únicamente su tamaño real.
     let res=await fetch(url,{headers:{Range:'bytes=0-65535'},cache:'force-cache'});
     if(!res.ok)return '';
     let bytes=new Uint8Array(await res.arrayBuffer());
     if(bytes.length<20||bytes[0]!==73||bytes[1]!==68||bytes[2]!==51)return '';
     const version=bytes[3];if(version!==3&&version!==4)return '';
     const syn=(n)=>(bytes[n]<<21)|(bytes[n+1]<<14)|(bytes[n+2]<<7)|bytes[n+3];
     const tagEnd=10+syn(6);
     if(tagEnd>bytes.length){
       if(tagEnd>3000000)return ''; // límite de descarga para cuidar el tráfico comunitario
       res=await fetch(url,{headers:{Range:'bytes=0-'+String(tagEnd-1)},cache:'force-cache'});
       if(!res.ok)return '';
       bytes=new Uint8Array(await res.arrayBuffer());
       if(bytes.length<tagEnd)return '';
     }
     const max=Math.min(bytes.length,tagEnd);let pos=10;
     if(bytes[5]&0x40){const n=version===4?syn(pos):((bytes[pos]<<24)|(bytes[pos+1]<<16)|(bytes[pos+2]<<8)|bytes[pos+3]);pos+=version===4?n+4:n}
     while(pos+10<max){
       const id=String.fromCharCode(...bytes.subarray(pos,pos+4));
       if(!/^[A-Z0-9]{4}$/.test(id))break;
       const size=version===4?syn(pos+4):((bytes[pos+4]*16777216)+(bytes[pos+5]<<16)+(bytes[pos+6]<<8)+bytes[pos+7]);
       if(size<1||pos+10+size>max)break;
       if(id==='APIC'){
         let i=pos+10;const encoding=bytes[i++];
         let mime='';while(i<pos+10+size&&bytes[i]!==0)mime+=String.fromCharCode(bytes[i++]);i+=2;
         if(encoding===1||encoding===2){while(i+1<pos+10+size&&(bytes[i]!==0||bytes[i+1]!==0))i+=2;i+=2}
         else{while(i<pos+10+size&&bytes[i]!==0)i++;i++}
         if(i>=pos+10+size)return '';
         const type=mime==='image/jpg'?'image/jpeg':mime;
         if(!/^image\/(jpeg|png|webp)$/i.test(type))return '';
         const bytesImage=bytes.slice(i,pos+10+size);
         if(bytesImage.length<250)return '';
         track.embeddedMime=type;
         return URL.createObjectURL(new Blob([bytesImage],{type}));
       }
       pos+=10+size;
     }
     return '';
   }catch{return ''}
 })();
 embeddedCovers.set(key,promise);return promise;
}
window.addEventListener('pagehide',()=>{embeddedCovers.forEach(async p=>{try{const u=await p;if(u.startsWith('blob:'))URL.revokeObjectURL(u)}catch{}})},{once:true});
fetch('radio-wurlitzer.json',{cache:'no-store'})
 .then(r=>{if(!r.ok)throw Error('Catálogo '+r.status);return r.json()})
 .then(data=>{
   playlists=(data.playlists||[]).filter(p=>p.tracks?.length);
   if(!playlists.length)throw Error('Colecciones vacías');
   $('rwCount').textContent=playlists.length+' colecciones · '+playlists.reduce((n,p)=>n+p.tracks.length,0)+' canciones';
   let saved='';try{saved=localStorage.getItem('derej:rw:playlist')||''}catch{}
   const favorite=playlists.find(p=>p.id===saved);
   // Todas las colecciones, incluidas las de Noaj, deben ser visibles al entrar.
   setFilter('todas');
   if(favorite)choose(favorite.id);
   // Si una colección no tiene portada de álbum subida, recuperar la ilustración
   // incrustada en el primer MP3, sin crear ni sustituir arte editorial.
   playlists.filter(p=>albumArt(p)===fallback).forEach(p=>{
     readEmbeddedCover(p.tracks[0]).then(src=>{
       if(!src)return;
       p.embeddedArtwork=src;
       const card=[...$('rwAlbums').querySelectorAll('button')].find(b=>b.dataset.id===p.id);
       if(card)cover(card.querySelector('img'),src);
     }).catch(()=>{});
   });
   $('rwStatus').textContent='Lista para escuchar';
 })
 .catch(()=>{$('rwStatus').textContent='No se pudo cargar el catálogo. Vuelve a abrir Radio Dérej.'});
})();
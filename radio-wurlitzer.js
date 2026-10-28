(()=>{'use strict';
const root=document.getElementById('radioWurlitzer');if(!root)return;
const $=id=>document.getElementById(id);
const base=(window.DEREJ_CONFIG?.audioBase||'https://ryeztkcyopbmwwaacpxl.supabase.co/storage/v1/object/public/radio-derej').replace(/\/$/,'');
const localArt='icon-512.png';
let playlists=[],current=null,index=0,playStarted=false;
const audio=$('rwAudio');
function pathUrl(path){if(!path)return '';if(/^https?:\/\//i.test(path))return path;if(!path.includes('/'))return path;return base+'/'+path.split('/').map(encodeURIComponent).join('/')}
function art(t){return pathUrl(t?.artwork)||localArt}
function label(t){return t?.title||'Radio Dérej'}
function fmt(sec){if(!Number.isFinite(sec))return '0:00';return Math.floor(sec/60)+':'+String(Math.floor(sec%60)).padStart(2,'0')}
function cover(img,url){img.src=url;img.onerror=()=>{img.onerror=null;img.src=localArt}}
function choose(id,autoplay=false){
 const p=playlists.find(x=>x.id===id);if(!p)return;audio.pause();current=p;index=0;playStarted=false;
 $('rwTitle').textContent=p.title;$('rwSubtitle').textContent=[p.kind,p.tracks.length+' canciones', 'Danygrafiko'].filter(Boolean).join(' · ');
 $('rwDescription').textContent=p.kind==='Suite sinfónica'?'Siete movimientos que recorren la hospitalidad, la compasión, la promesa y la escucha.':p.kind==='Meditación guiada'?'Un espacio para contemplar cada aliyá y llevar su enseñanza al interior.':'Una escucha musical que acompaña el camino de cada día.';
 cover($('rwBigCover'),art(p));$('rwBigCover').alt='Carátula de '+p.title;
 $('rwAlbums').querySelectorAll('button').forEach(b=>{let on=b.dataset.id===id;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
 $('rwTracks').replaceChildren();p.tracks.forEach((t,i)=>{const b=document.createElement('button');b.type='button';b.className='rwTrack';b.dataset.idx=String(i);
 const n=document.createElement('span');n.className='rwNumber';n.textContent=String(t.aliyah||i+1).padStart(2,'0');
 const title=document.createElement('span');title.textContent=t.title;
 const duration=document.createElement('span');duration.className='rwDuration';duration.textContent=t.duration||'♫';
 b.append(n,title,duration);b.addEventListener('click',()=>load(i,true));$('rwTracks').append(b)});
 load(0,autoplay);try{localStorage.setItem('derej:rw:playlist',id)}catch{}
}
function load(i,autoplay=false){
 if(!current?.tracks?.length)return;index=(i+current.tracks.length)%current.tracks.length;
 const t=current.tracks[index],url=t.url||pathUrl(t.path);audio.src=url;
 $('rwNowTitle').textContent=label(t);$('rwNowAlbum').textContent=current.title;
 cover($('rwMiniCover'),art(t));cover($('rwBigCover'),art(t.artwork?t:current));
 $('rwElapsed').textContent='0:00';$('rwDuration').textContent=t.duration||'0:00';$('rwSeek').value=0;
 $('rwTracks').querySelectorAll('button').forEach((b,j)=>b.classList.toggle('active',j===index));
 if('mediaSession' in navigator)try{navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:t.artist||'Danygrafiko',album:current.title,artwork:[{src:art(t),sizes:'any',type:'image/png'}]})}catch{}
 try{localStorage.setItem('derej:rw:track:'+current.id,String(index))}catch{}
 if(autoplay)audio.play().catch(()=>{$('rwStatus').textContent='Toca Reproducir para escuchar.'});
}
function switchPlay(){if(!audio.src)return;if(audio.paused)audio.play().catch(()=>{$('rwStatus').textContent='Toca Reproducir nuevamente.'});else audio.pause()}
function sync(){const playing=!audio.paused;$('rwPlay').textContent=playing?'Ⅱ':'▶';$('rwMainPlay').textContent=playing?'⏸ Pausar':'▶ Reproducir';$('rwStatus').textContent=playing?'Escuchando Radio Dérej':'Pausado';}
$('rwPlay').addEventListener('click',switchPlay);$('rwMainPlay').addEventListener('click',switchPlay);
$('rwPrev').addEventListener('click',()=>load(index-1,true));$('rwNext').addEventListener('click',()=>load(index+1,true));
audio.addEventListener('play',sync);audio.addEventListener('pause',sync);
audio.addEventListener('loadedmetadata',()=>{$('rwDuration').textContent=fmt(audio.duration)});
audio.addEventListener('timeupdate',()=>{const d=audio.duration;$('rwElapsed').textContent=fmt(audio.currentTime);if(Number.isFinite(d)&&d>0)$('rwSeek').value=String(Math.round(audio.currentTime/d*1000))});
audio.addEventListener('ended',()=>load(index+1,true));
audio.addEventListener('error',()=>{$('rwStatus').textContent='No se pudo cargar esta canción; prueba la siguiente.'});
$('rwSeek').addEventListener('input',()=>{if(Number.isFinite(audio.duration))audio.currentTime=audio.duration*Number($('rwSeek').value)/1000});
if('mediaSession' in navigator)try{
 navigator.mediaSession.setActionHandler('play',()=>audio.play());navigator.mediaSession.setActionHandler('pause',()=>audio.pause());
 navigator.mediaSession.setActionHandler('previoustrack',()=>load(index-1,true));navigator.mediaSession.setActionHandler('nexttrack',()=>load(index+1,true));
}catch{}
fetch('radio-wurlitzer.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Catálogo '+r.status);return r.json()}).then(data=>{
 playlists=(data.playlists||[]).filter(p=>p.tracks?.length);if(!playlists.length)throw Error('Sin colecciones');
 const albums=$('rwAlbums');albums.replaceChildren();
 playlists.forEach(p=>{const b=document.createElement('button');b.type='button';b.className='rwAlbum';b.dataset.id=p.id;b.setAttribute('aria-label','Seleccionar '+p.title);
 const im=document.createElement('img');im.loading='lazy';im.alt='';cover(im,art(p));
 const caption=document.createElement('span');caption.textContent=p.title;b.append(im,caption);b.addEventListener('click',()=>choose(p.id));albums.append(b)});
 $('rwCount').textContent=playlists.length+' colecciones · '+playlists.reduce((n,p)=>n+p.tracks.length,0)+' canciones';
 let saved='';try{saved=localStorage.getItem('derej:rw:playlist')||''}catch{}
 choose(playlists.some(p=>p.id===saved)?saved:playlists[0].id);
 $('rwStatus').textContent='Lista para escuchar';
}).catch(()=>{$('rwStatus').textContent='No fue posible cargar el catálogo.'});
})();
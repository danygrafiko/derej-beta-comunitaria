const CACHE='derej-public-rc2-radio-live-20260925';
const SHELL=['./','./index.html','./config.js','./radio.json','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png','./assets/radio-meditacion.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const u=new URL(e.request.url);
  if(/\.(mp3|m4a|wav|ogg)$/i.test(u.pathname)) return;
  e.respondWith(
    fetch(e.request).then(r=>{
      const cp=r.clone();
      caches.open(CACHE).then(c=>c.put(e.request,cp)).catch(()=>{});
      return r;
    }).catch(()=>caches.match(e.request))
  );
});

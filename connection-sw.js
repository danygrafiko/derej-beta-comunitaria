// Push-only worker: no caching or interception of study, audio, or navigation.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
  let data={};try{data=event.data?.json()||{};}catch{}
  const destination=data.destination==='radio'?'radio':'camino';
  event.waitUntil(self.registration.showNotification('Un momento para ti · Dérej',{
    body:'Puedes hacer una pausa, agradecer y dar un paso en tu Camino.',
    icon:'/icon-192.png',badge:'/icon-192.png',tag:'derej-daily',renotify:false,
    data:{destination}
  }));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const destination=event.notification.data?.destination==='radio'?'radio':'camino';
  event.waitUntil((async()=>{
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    const existing=windows.find(client=>new URL(client.url).origin===self.location.origin && ['/', '/index.html'].includes(new URL(client.url).pathname));
    if(existing){await existing.focus();existing.postMessage({type:'DEREJ_CONNECTION',destination});}
    else await self.clients.openWindow('/?conexion='+destination);
  })());
});

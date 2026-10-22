export function validSubscription(s){
  try{
    const u=new URL(s.endpoint);
    const host=u.hostname;
    return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&!u.hash&&s.endpoint.length<2048&&
      (host==='fcm.googleapis.com'||host==='updates.push.services.mozilla.com'||host==='web.push.apple.com'||host.endsWith('.push.apple.com'))&&
      /^[A-Za-z0-9_-]{87}={0,1}$/.test(s.keys?.p256dh||'')&&/^[A-Za-z0-9_-]{22}={0,2}$/.test(s.keys?.auth||'');
  }catch{return false;}
}
export function validSettings(s){
  if(!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(s.time||'')||!['camino','radio'].includes(s.destination)||typeof s.timezone!=='string'||s.timezone.length>80)return false;
  try{new Intl.DateTimeFormat('es',{timeZone:s.timezone}).format();return true;}catch{return false;}
}
export function message(destination){
  return {title:'Un momento para ti · Dérej',body:'Puedes hacer una pausa, agradecer y dar un paso en tu Camino.',destination:destination==='radio'?'radio':'camino'};
}

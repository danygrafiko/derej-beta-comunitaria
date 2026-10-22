import postgres from 'npm:postgres@3.4.7';
// @deno-types="./web-push.d.ts"
import webpush from 'npm:web-push@3.6.7';
import { validSubscription, validSettings, message } from './logic.js';

const ORIGIN = 'https://derej-beta-comunitaria.vercel.app';
const sql = postgres(Deno.env.get('SUPABASE_DB_URL')!, {prepare:false,max:1,idle_timeout:5,connect_timeout:10});
const cors = {'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Vary':'Origin','Cache-Control':'no-store'};
const reply = (body:unknown,status=200)=>Response.json(body,{status,headers:cors});
const hash = async (s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),b=>b.toString(16).padStart(2,'0')).join('');

Deno.serve(async req=>{
  try {
    const origin=req.headers.get('origin');
    if(origin && origin!==ORIGIN)return reply({error:'Origen no permitido.'},403);
    if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
    if(!['GET','POST'].includes(req.method))return reply({error:'Método no permitido.'},405);
    // Dispatch authentication is independent of any browser or Supabase publishable key.
    const jobSecret=req.headers.get('x-derej-job');
    if(jobSecret){
      const [config]=await sql`select * from derej_reminders.config where singleton`;
      if(req.method!=='POST'||!config||jobSecret!==config.dispatch_secret)return reply({error:'No autorizado.'},401);
      if(!config.enabled)return reply({sent:0,paused:true});
      await sql`update derej_reminders.subscriptions set next_due=derej_reminders.next_due(timezone,local_time,now()) where next_due < now()-interval '15 minutes'`;
      const jobs=await sql`with due as (
        select endpoint from derej_reminders.subscriptions where next_due<=now()
        and last_local_date is distinct from (now() at time zone timezone)::date
        order by next_due for update skip locked limit 100
      ) update derej_reminders.subscriptions s set last_local_date=(now() at time zone s.timezone)::date,
        next_due=derej_reminders.next_due(s.timezone,s.local_time,now())
        from due where s.endpoint=due.endpoint returning s.endpoint,s.subscription,s.destination`;
      let sent=0,failed=0;
      for(let offset=0;offset<jobs.length;offset+=5)await Promise.all(jobs.slice(offset,offset+5).map(async job=>{
        try {
          const [current]=await sql`select destination from derej_reminders.subscriptions where endpoint=${job.endpoint}`;
          if(!current)return;
          await webpush.sendNotification(job.subscription,JSON.stringify(message(current.destination)),{
            vapidDetails:{subject:ORIGIN,publicKey:config.public_key,privateKey:config.private_key},
            TTL:900,urgency:'normal',topic:'derej-daily',timeout:8000
          });
          sent++;
          await sql`update derej_reminders.subscriptions set last_status=201 where endpoint=${job.endpoint}`;
        }catch(err){
          failed++;const status=Number((err as {statusCode?:number}).statusCode)||0;
          if(status===404||status===410)await sql`delete from derej_reminders.subscriptions where endpoint=${job.endpoint}`;
          else await sql`update derej_reminders.subscriptions set last_status=${status} where endpoint=${job.endpoint}`;
        }
      }));
      return reply({sent,failed});
    }
    if(req.method==='GET'){
      const [config]=await sql`select public_key,enabled from derej_reminders.config where singleton`;
      return config?.enabled?reply({publicKey:config.public_key}):reply({error:'Los recordatorios aún se están preparando.'},503);
    }
    if(origin!==ORIGIN)return reply({error:'Origen no permitido.'},403);
    if(!req.headers.get('content-type')?.startsWith('application/json'))return reply({error:'Formato no permitido.'},415);
    const text=await req.text();if(text.length>8192)return reply({error:'Solicitud demasiado grande.'},413);
    let body;try{body=JSON.parse(text);}catch{return reply({error:'Solicitud no válida.'},400);}
    if(!body||typeof body!=='object'||Array.isArray(body))return reply({error:'Solicitud no válida.'},400);
    if(!/^[a-f0-9]{64}$/.test(body.token||'')||!validSubscription(body.subscription))return reply({error:'Suscripción no válida.'},400);
    const endpoint=body.subscription.endpoint,token=await hash(body.token);
    body.subscription={endpoint,keys:{p256dh:body.subscription.keys.p256dh,auth:body.subscription.keys.auth}};
    if(body.action==='unsubscribe'){
      await sql`delete from derej_reminders.subscriptions where endpoint=${endpoint} and token_hash=${token}`;
      return reply({ok:true});
    }
    if(body.action==='test'){
      const [config]=await sql`select * from derej_reminders.config where singleton and enabled`;
      if(!config)return reply({error:'Servicio no disponible.'},503);
      const [s]=await sql`update derej_reminders.subscriptions set last_test=now()
        where endpoint=${endpoint} and token_hash=${token} and (last_test is null or last_test<now()-interval '1 minute')
        returning subscription,destination`;
      if(!s)return reply({error:'Activa el recordatorio o espera un minuto antes de otra prueba.'},429);
      try{
        await webpush.sendNotification(s.subscription,JSON.stringify(message(s.destination)),{
          vapidDetails:{subject:ORIGIN,publicKey:config.public_key,privateKey:config.private_key},TTL:60,timeout:8000,topic:'derej-test'
        });
        return reply({ok:true});
      }catch{return reply({error:'El dispositivo no aceptó la prueba. Revisa sus permisos e intenta desactivar y activar el recordatorio.'},503);}
    }
    if(body.action!=='subscribe'||!validSettings(body))return reply({error:'Horario no válido.'},400);
    const [tz]=await sql`select exists(select 1 from pg_timezone_names where name=${body.timezone}) as valid`;
    if(!tz.valid)return reply({error:'Zona horaria no válida.'},400);
    const [config]=await sql`select enabled from derej_reminders.config where singleton`;
    if(!config?.enabled)return reply({error:'Recordatorios temporalmente no disponibles.'},503);
    const result=await sql.begin(async tx=>{
      // Bounded registration writes without storing IPs or linking to analytics.
      await tx`delete from derej_reminders.rate_limit where bucket<now()-interval '2 hours'`;
      const [rate]=await tx`insert into derej_reminders.rate_limit(bucket,attempts) values(date_trunc('hour',now()),1)
        on conflict(bucket) do update set attempts=derej_reminders.rate_limit.attempts+1 returning attempts`;
      if(rate.attempts>300)return 'rate';
      const [count]=await tx`select count(*)::int as total from derej_reminders.subscriptions`;
      const rows=await tx`insert into derej_reminders.subscriptions(endpoint,token_hash,subscription,timezone,local_time,destination,next_due)
        select ${endpoint},${token},${tx.json(body.subscription)},${body.timezone},${body.time},${body.destination},
          derej_reminders.next_due(${body.timezone},${body.time},now()) where ${count.total}<10000
        on conflict(endpoint) do update set subscription=excluded.subscription,timezone=excluded.timezone,
          local_time=excluded.local_time,destination=excluded.destination,next_due=excluded.next_due,updated_at=now()
        where derej_reminders.subscriptions.token_hash=excluded.token_hash returning endpoint`;
      return rows.length?'ok':'conflict';
    });
    if(result==='rate')return reply({error:'Hay muchas solicitudes. Intenta más tarde.'},429);
    if(result!=='ok')return reply({error:'No pudimos actualizar este dispositivo. Desactiva el recordatorio y vuelve a intentarlo.'},409);
    return reply({ok:true});
  }catch{
    // Never log endpoints, private keys, tokens, or database connection details.
    console.error('connection-reminders: request failed');
    return reply({error:'No pudimos guardar el recordatorio. Intenta nuevamente.'},503);
  }
});

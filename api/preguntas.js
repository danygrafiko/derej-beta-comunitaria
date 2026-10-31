'use strict';
const { createHash } = require('node:crypto');
const { retrieve, routes, system } = require('./_lib/derej.cjs');
// Burst protection is per warm instance, not a distributed billing budget.
const buckets = new Map();
function permit(key) {
  const now = Date.now();
  for (const [k,v] of buckets) if (v.until <= now) buckets.delete(k);
  const b = buckets.get(key) || { count: 0, until: now + 60000 };
  if (b.count >= 5 || buckets.size >= 2000) return false;
  b.count++; buckets.set(key, b); return true;
}
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const send = (status, data) => res.status(status).json(data);
  const credential = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
  const enabled = process.env.DEREJ_AI_ENABLED !== '0' && !!credential;
  if (req.method === 'GET') return send(200, { enabled, version: 1 });
  if (req.method !== 'POST') { res.setHeader('Allow','GET, POST'); return send(405,{ error:'Método no permitido.' }); }
  if (req.headers.origin && req.headers.origin !== 'https://' + req.headers.host && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.origin)) return send(403,{ error:'Solicitud no permitida.' });
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return send(415,{error:'Envía una pregunta en formato JSON.'});
  let body = req.body;
  if (typeof body === 'string') { if (body.length > 18000) return send(413,{error:'La consulta es demasiado larga.'}); try { body = JSON.parse(body); } catch { return send(400,{error:'La consulta no se pudo leer.'}); } }
  if (!body || typeof body.question !== 'string' || !body.question.trim() || body.question.length > 1200) return send(400,{ error:'Escribe una pregunta de hasta 1.200 caracteres.' });
  if (body.consent !== true) return send(400,{ error:'Confirma el envío de tu pregunta al servicio de IA.' });
  if (!enabled) return send(503,{ code:'not_configured', error:'La conversación con IA aún no está activada. Puedes seguir explorando la biblioteca.' });
  const address = req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!permit(createHash('sha256').update(String(address)).digest('hex'))) { res.setHeader('Retry-After','60'); return send(429,{error:'Hagamos una pausa. Puedes volver a preguntar en un minuto.'}); }
  const question = body.question.trim();
  const history = Array.isArray(body.history) ? body.history.slice(-6).filter(m => m && ['user','assistant'].includes(m.role) && typeof m.content === 'string').map(m => ({role:m.role,content:m.content.slice(0,1800)})) : [];
  const context = routes.has(body.context) ? body.context : '';
  const studyTitle = typeof body.studyTitle === 'string' ? body.studyTitle.slice(0,180) : '';
  const evidence = retrieve(question + ' ' + studyTitle,context,history.filter(m=>m.role==='user').slice(-1).map(m=>m.content).join(' '));
  if (!evidence.length) return send(200,{ answer:'No encontré un pasaje suficientemente relacionado en la colección de Dérej preparada para estas consultas. ¿Puedes precisar el tema, el nombre del sabio o el Salmo que quieres estudiar?', reflection:'', sources:[], grounded:false });
  try {
    const response = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
      method:'POST', headers:{Authorization:'Bearer ' + credential,'Content-Type':'application/json'}, signal:AbortSignal.timeout(25000),
      body:JSON.stringify({ model:process.env.AI_GATEWAY_MODEL || 'openai/gpt-6-luna', max_tokens:1100, response_format:{type:'json_object'},
        messages:[{role:'system',content:system + '\nPASAJES:\n' + JSON.stringify(evidence.map(({id,title,text})=>({id,title,text})))},...history,{role:'user',content:question}] })
    });
    if (!response.ok) {
      // Do not log prompts, response bodies, credentials or IP addresses.
      console.warn('derej_ai_gateway_status', response.status);
      return send(503,{code:'provider_unavailable',error:'La conexión de IA no está disponible ahora. Tu pregunta no se ha guardado en Dérej. Puedes intentarlo más tarde o consultar los estudios.'});
    }
    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;
    const result = JSON.parse(String(raw || '').replace(/^```(?:json)?\s*|\s*```$/g,''));
    if (typeof result.answer !== 'string' || !Array.isArray(result.sourceIds)) throw new Error('invalid_response');
    const sources = evidence.filter(e => result.sourceIds.includes(e.id)).map(({id,title,route,collection})=>({id,title,route,collection}));
    if (!sources.length) return send(200,{answer:'Los pasajes disponibles no bastan para responder con respaldo. Podemos precisar la pregunta o volver al estudio para revisar su contexto.',reflection:'',sources:[],grounded:false});
    return send(200,{answer:result.answer.slice(0,7000),reflection:typeof result.reflection==='string'?result.reflection.slice(0,400):'',sources,grounded:true});
  } catch (error) {
    return send(503,{error:error.name==='TimeoutError'?'La respuesta está tardando más de lo esperado. Inténtalo nuevamente.':'No pudimos preparar una respuesta verificable. Inténtalo de nuevo o consulta el estudio.'});
  }
};

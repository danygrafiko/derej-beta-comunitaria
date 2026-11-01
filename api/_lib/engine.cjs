'use strict';
// An explicit provider choice never falls back to a paid service.
const schema = {type:'object',properties:{sourceIds:{type:'array',items:{type:'string'}},answer:{type:'string'},reflection:{type:'string'}},required:['sourceIds','answer','reflection'],additionalProperties:false};
function configuration(req = {headers:{}}) {
  const provider=process.env.DEREJ_AI_PROVIDER || 'gateway';
  const activated=process.env.DEREJ_AI_ENABLED==='1';
  if (provider==='selfhosted') {
    try {
      const base=new URL(process.env.DEREJ_AI_BASE_URL || '');
      base.pathname=base.pathname.replace(/\/+$/,'');
      const local=['127.0.0.1','localhost','[::1]'].includes(base.hostname);
      if (base.username || base.password || base.search || base.hash || !base.pathname.endsWith('/v1')) return {enabled:false,provider};
      // A remote inference service must use HTTPS and server-side authentication.
      if (!(base.protocol==='https:' || (base.protocol==='http:' && local && !process.env.VERCEL))) return {enabled:false,provider};
      const credential=process.env.DEREJ_AI_API_KEY;
      if ((!local && !credential) || !process.env.DEREJ_AI_MODEL) return {enabled:false,provider};
      return {enabled:activated,provider,url:base.href.replace(/\/$/,'')+'/chat/completions',credential,model:process.env.DEREJ_AI_MODEL,timeout:90000};
    } catch { return {enabled:false,provider}; }
  }
  if (provider!=='gateway') return {enabled:false,provider:'unsupported'};
  const credential=process.env.AI_GATEWAY_API_KEY || req.headers['x-vercel-oidc-token'] || process.env.VERCEL_OIDC_TOKEN;
  return {enabled:activated && !!credential,provider,url:'https://ai-gateway.vercel.sh/v1/chat/completions',credential,model:process.env.AI_GATEWAY_MODEL || 'openai/gpt-6-luna',timeout:25000};
}
async function generate(config,messages,sourceIds=[]) {
  const own=config.provider==='selfhosted';
  const groundedSchema={...schema,properties:{...schema.properties,sourceIds:{type:'array',items:{type:'string',enum:sourceIds}}}};
  const body={model:config.model,max_tokens:own?650:1100,messages,response_format:own?{type:'json_object',schema:groundedSchema}:{type:'json_object'}};
  if (own) { body.temperature=0.15;body.reasoning_effort='none'; }
  const headers={'Content-Type':'application/json'};
  if(config.credential)headers.Authorization='Bearer '+config.credential;
  return fetch(config.url,{method:'POST',headers,redirect:'error',signal:AbortSignal.timeout(config.timeout),body:JSON.stringify(body)});
}
module.exports={configuration,generate,schema};

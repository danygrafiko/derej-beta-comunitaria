'use strict';
const assert=require('node:assert/strict');
const {configuration,generate}=require('../api/_lib/engine.cjs');
const variables=['DEREJ_AI_ENABLED','DEREJ_AI_PROVIDER','DEREJ_AI_BASE_URL','DEREJ_AI_MODEL','DEREJ_AI_API_KEY','AI_GATEWAY_API_KEY','VERCEL'];
const original=Object.fromEntries(variables.map(k=>[k,process.env[k]]));
const set=values=>{for(const k of variables)delete process.env[k];Object.assign(process.env,values);};
(async()=>{
 set({DEREJ_AI_PROVIDER:'selfhosted',DEREJ_AI_ENABLED:'1',DEREJ_AI_BASE_URL:'http://127.0.0.1:8081/v1',DEREJ_AI_MODEL:'derej-local'});
 assert(configuration().enabled);assert.equal(configuration().provider,'selfhosted');
 let called;
 global.fetch=async(url,options)=>{called={url,options,body:JSON.parse(options.body)};return {ok:true};};
 await generate(configuration(),[{role:'user',content:'Test'}],['d249','d250']);
 assert.equal(called.url,'http://127.0.0.1:8081/v1/chat/completions');
 assert.equal(called.body.model,'derej-local');assert.equal(called.body.response_format.schema.required.length,3);assert.equal(called.options.redirect,'error');
 assert.deepEqual(called.body.response_format.schema.properties.sourceIds.items.enum,['d249','d250']);
 assert(!called.options.headers.Authorization);
 process.env.VERCEL='1';assert(!configuration().enabled);
 set({DEREJ_AI_PROVIDER:'selfhosted',DEREJ_AI_ENABLED:'1',DEREJ_AI_BASE_URL:'http://remote.example/v1',DEREJ_AI_MODEL:'derej-local'});assert(!configuration().enabled);
 process.env.DEREJ_AI_BASE_URL='https://remote.example/v1';assert(!configuration().enabled);
 process.env.DEREJ_AI_API_KEY='test-only';assert(configuration().enabled);
 await generate(configuration(),[]);assert.equal(called.options.headers.Authorization,'Bearer test-only');
 for(const url of ['https://user:pass@remote.example/v1','https://remote.example/v1?destination=other','https://remote.example/v1#secret','https://remote.example/other']){process.env.DEREJ_AI_BASE_URL=url;assert(!configuration().enabled,url);}
 set({DEREJ_AI_PROVIDER:'unsupported',DEREJ_AI_ENABLED:'1',AI_GATEWAY_API_KEY:'test-only'});assert(!configuration().enabled);
 set({DEREJ_AI_PROVIDER:'selfhosted',DEREJ_AI_ENABLED:'1',AI_GATEWAY_API_KEY:'test-only'});assert(!configuration().enabled,'Never fall back from the local model to Gateway');
 set({DEREJ_AI_ENABLED:'1'});assert(configuration({headers:{'x-vercel-oidc-token':'test-only'}}).enabled);
 console.log('PASS own engine: explicit provider, local/remote configuration, authenticated HTTPS, schema, no redirects, no paid fallback.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{set({});for(const [k,v]of Object.entries(original))if(v!==undefined)process.env[k]=v;});

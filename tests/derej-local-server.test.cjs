'use strict';
const assert=require('node:assert/strict'),server=require('../scripts/serve-derej-local.cjs');
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 assert.equal((await fetch(base+'/')).status,200);
 for(const file of ['/.env','/api/_lib/knowledge.json','/backend/analytics.sql','/scripts/run-derej-local.cjs','/ai-local/runtime-lock.json','/tests/preguntas-api.test.cjs','/.git/config'])assert.equal((await fetch(base+file)).status,404,file);
 assert.equal((await fetch(base+'/api/preguntas')).status,200);
 assert.equal((await fetch(base+'/api/preguntas',{method:'POST',headers:{'Content-Type':'application/json'},body:'x'.repeat(18001)})).status,413);
 console.log('PASS local server: public pages, blocked internal paths, API, request-size bound.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());

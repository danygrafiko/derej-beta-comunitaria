'use strict';
const fs=require('node:fs'),path=require('node:path');
const cases=require('../ai-local/evaluation-cases.json');
const lock=require('../ai-local/runtime-lock.json');
const url=process.env.DEREJ_TEST_URL||'http://127.0.0.1:4173';
const endpoint=new URL(url);if(!['127.0.0.1','localhost'].includes(endpoint.hostname))throw Error('La evaluación automática solo envía preguntas públicas de prueba a localhost.');
const output=process.env.DEREJ_EVAL_OUTPUT||path.resolve(__dirname,'../../derej-local-evaluation.json');
(async()=>{
  const results=[];
  for(const item of cases){
    console.log('Evaluando:',item.id);
    const start=Date.now();
    try{
      const response=await fetch(url+'/api/preguntas',{method:'POST',headers:{'Content-Type':'application/json',Origin:endpoint.origin},body:JSON.stringify({question:item.question,consent:true}),signal:AbortSignal.timeout(105000)});
      const data=await response.json();
      const structurePassed=response.ok&&typeof data.answer==='string'&&(item.expect==='supported'?data.grounded===true&&data.sources?.length>0:data.grounded===false&&data.sources?.length===0);
      results.push({...item,status:response.status,seconds:(Date.now()-start)/1000,...data,structurePassed,needsEditorialReview:true});
      console.log(item.id,response.status,results.at(-1).seconds+' s',data.sources?.length||0,'fuentes');
    }catch(error){results.push({...item,error:error.message,seconds:(Date.now()-start)/1000,needsEditorialReview:true});console.log(item.id,error.message);}
    fs.writeFileSync(output,JSON.stringify({engine:'selfhosted',model:lock.model.file,runtime:'llama.cpp '+lock.runtime.release,evaluatedAt:new Date().toISOString(),results},null,2));
  }
  if(results.some(r=>!r.structurePassed))process.exitCode=1;
  console.log('Resultados guardados:',output);
})().catch(error=>{console.error(error);process.exitCode=1;});

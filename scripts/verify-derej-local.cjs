'use strict';
const {spawn}=require('node:child_process'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const runtime=spawn(process.execPath,[path.join(__dirname,'run-derej-local.cjs')],{cwd:root,env:process.env,stdio:['ignore','inherit','inherit']});
let stopped=false;
function stop(){if(stopped)return;stopped=true;runtime.kill('SIGTERM');}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
(async()=>{
 try{
  let ready=false;
  for(let i=0;i<60&&!stopped;i++){
   try{const response=await fetch('http://127.0.0.1:4173/api/preguntas',{signal:AbortSignal.timeout(800)});if(response.ok&&(await response.json()).enabled){ready=true;break;}}catch{}
   if(runtime.exitCode!==null)throw Error('El lanzador se detuvo antes de iniciar.');
   await new Promise(resolve=>setTimeout(resolve,1000));
  }
  if(!ready)throw Error('No se inició el prototipo.');
  const evaluator=spawn(process.execPath,[path.join(__dirname,'evaluate-derej-local.cjs')],{cwd:root,env:process.env,stdio:'inherit'});
  process.exitCode=await new Promise(resolve=>evaluator.once('exit',resolve));
 }catch(error){console.error(error.message);process.exitCode=1;}finally{stop();}
})();

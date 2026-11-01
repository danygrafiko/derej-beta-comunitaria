'use strict';
const {spawn}=require('node:child_process'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {randomBytes}=require('node:crypto');
const lock=require('../ai-local/runtime-lock.json');
const runtime=process.env.DEREJ_RUNTIME_DIR||path.join(os.homedir(),'.cache','derej-ia');
const binary=process.env.DEREJ_LLAMA_SERVER||path.join(runtime,'llama-'+lock.runtime.release,'llama-server');
const model=process.env.DEREJ_MODEL_PATH||path.join(runtime,lock.model.file);
if(!fs.existsSync(binary)||!fs.existsSync(model)){console.error('Falta el motor o el modelo. Ejecuta primero: node scripts/setup-derej-local.cjs');process.exit(1);}
const internalKey=randomBytes(32).toString('hex');
const engine=spawn(binary,['--model',model,'--alias','derej-local','--host','127.0.0.1','--port','8081','--ctx-size','8192','--parallel','1','--threads',String(Math.min(os.availableParallelism(),8)),'--reasoning-budget','0','--no-webui'],{stdio:['ignore','ignore','inherit'],env:{...process.env,LLAMA_API_KEY:internalKey}});
let app,stopped=false;
function stop(){if(stopped)return;stopped=true;app?.kill('SIGTERM');engine.kill('SIGTERM');}
process.on('SIGINT',stop);process.on('SIGTERM',stop);engine.on('error',error=>{console.error(error.message);stop();process.exitCode=1;});
engine.on('exit',()=>{stop();});
(async()=>{
  for(let attempt=0;attempt<60&&!stopped;attempt++){
    try{const response=await fetch('http://127.0.0.1:8081/health',{headers:{Authorization:'Bearer '+internalKey},signal:AbortSignal.timeout(1000)});if(response.ok){
      app=spawn(process.execPath,[path.join(__dirname,'serve-derej-local.cjs')],{stdio:'inherit',env:{...process.env,DEREJ_AI_PROVIDER:'selfhosted',DEREJ_AI_ENABLED:'1',DEREJ_AI_BASE_URL:'http://127.0.0.1:8081/v1',DEREJ_AI_MODEL:'derej-local',DEREJ_AI_API_KEY:internalKey}});
      app.on('exit',stop);app.on('error',stop);return;
    }}catch{}
    await new Promise(resolve=>setTimeout(resolve,1000));
  }
  console.error('El modelo no estuvo disponible dentro del plazo de inicio.');stop();process.exitCode=1;
})();

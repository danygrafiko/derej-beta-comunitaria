'use strict';
const {spawnSync}=require('node:child_process'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{createHash}=require('node:crypto');
const lock=require('../ai-local/runtime-lock.json');
if(process.platform!=='linux'||process.arch!=='x64'){console.error('Este instalador reproducible es para Linux x64. Consulta ai-local/README.md para otros equipos.');process.exit(1);}
const directory=process.env.DEREJ_RUNTIME_DIR||path.join(os.homedir(),'.cache','derej-ia');fs.mkdirSync(directory,{recursive:true});
async function hash(file){const digest=createHash('sha256');for await(const data of fs.createReadStream(file))digest.update(data);return digest.digest('hex');}
async function download(url,file,expected){
  if(fs.existsSync(file)&&await hash(file)===expected){console.log('Verificado:',path.basename(file));return;}
  const partial=file+'.part';
  const child=spawnSync('curl',['--fail','--location','--retry','2','--max-time','600','--output',partial,url],{stdio:'inherit'});
  if(child.status!==0)throw Error('No se pudo descargar '+path.basename(file));
  if(await hash(partial)!==expected){fs.rmSync(partial);throw Error('SHA-256 incorrecto: '+path.basename(file));}
  fs.renameSync(partial,file);console.log('Descargado y verificado:',path.basename(file));
}
(async()=>{
  console.log('Descarga del motor oficial y de aproximadamente 1,28 GB de pesos abiertos. No contrata servicios.');
  const archive=path.join(directory,'llama-'+lock.runtime.release+'.tar.gz');
  await download(lock.runtime.archiveUrl,archive,lock.runtime.sha256);
  const result=spawnSync('tar',['--no-same-owner','-xzf',archive,'-C',directory],{stdio:'inherit'});if(result.status!==0)throw Error('No se pudo extraer el motor.');
  await download(lock.model.url,path.join(directory,lock.model.file),lock.model.sha256);
  console.log('Preparado. Ejecuta: node scripts/run-derej-local.cjs');
})().catch(error=>{console.error(error.message);process.exitCode=1;});

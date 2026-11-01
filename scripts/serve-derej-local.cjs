// Local prototype only. This does not create a public server or tunnel.
'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const handler=require('../api/preguntas.js');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon'};
const denied=new Set(['api','backend','scripts','tests','ai-local','.git','node_modules']);
const server=http.createServer(async(req,res)=>{
  res.status=code=>{res.statusCode=code;return res;};
  res.json=data=>{res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(data));};
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.statusCode=400;return res.end();}
  if(pathname==='/api/preguntas'){
    let bytes=0,parts=[];
    for await(const part of req){bytes+=part.length;if(bytes>18000){res.statusCode=413;res.end('Solicitud demasiado larga');return;}parts.push(part);}
    const raw=Buffer.concat(parts).toString('utf8');req.body=raw||undefined;
    try{await handler(req,res);}catch{if(!res.headersSent)res.status(500).json({error:'No se pudo preparar la respuesta.'});}return;
  }
  if(!['GET','HEAD'].includes(req.method)){res.statusCode=405;return res.end();}
  const relative=pathname==='/'?'index.html':pathname.slice(1),parts=relative.split('/');
  if(parts.some(p=>p.startsWith('.')||denied.has(p))){res.statusCode=404;return res.end();}
  const file=path.resolve(root,relative),type=types[path.extname(file)];
  if(!type||!file.startsWith(root+path.sep)){res.statusCode=404;return res.end();}
  try{
    const real=fs.realpathSync(file);if(!real.startsWith(root+path.sep)||!fs.statSync(real).isFile())throw Error();
    res.setHeader('Content-Type',type);res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
    if(req.method==='HEAD')res.end();else fs.createReadStream(real).pipe(res);
  }catch{res.statusCode=404;res.end();}
});
if(require.main===module)server.listen(Number(process.env.DEREJ_LOCAL_PORT||4173),'127.0.0.1',()=>console.log('Dérej local: http://127.0.0.1:'+(process.env.DEREJ_LOCAL_PORT||4173)+'/?puerta=preguntas'));
module.exports=server;

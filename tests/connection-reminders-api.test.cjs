// Explicit opt-in: creates and removes one synthetic future subscription; sends no push.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
if(process.env.DEREJ_LIVE_REMINDER_TEST!=='1')throw Error('Set DEREJ_LIVE_REMINDER_TEST=1 for this live test.');
const API='https://ryeztkcyopbmwwaacpxl.supabase.co/functions/v1/connection-reminders';
const endpoint='https://fcm.googleapis.com/derej-qa-'+crypto.randomUUID(),token=crypto.randomBytes(32).toString('hex');
const key=crypto.createECDH('prime256v1');key.generateKeys();
const subscription={endpoint,keys:{p256dh:key.getPublicKey().toString('base64url'),auth:crypto.randomBytes(16).toString('base64url')}};
const settings={time:'07:30',timezone:'America/Santiago',destination:'camino'};
function call(body,origin='https://derej-beta-comunitaria.vercel.app'){
 const args=['-sS','--max-time','25','-w','\n%{http_code}','-H','Origin: '+origin];
 if(body)args.push('-H','Content-Type: application/json','--data-binary','@-');args.push(API);
 const r=spawnSync('curl',args,{input:body?JSON.stringify(body):undefined,encoding:'utf8'});if(r.status!==0)throw Error('HTTP transport failed');
 const lines=r.stdout.trim().split('\n'),status=Number(lines.pop());return{status,data:JSON.parse(lines.join('\n'))};
}
try{
 assert.equal(call().status,200);assert.equal(call(undefined,'https://invalid.example').status,403);
 assert.equal(call({}).status,400);
 assert.equal(call({action:'subscribe',token,subscription,...settings}).status,200);
 assert.equal(call({action:'subscribe',token,subscription,...settings,time:'08:00'}).status,200);
 assert.equal(call({action:'subscribe',token:'f'.repeat(64),subscription,...settings}).status,409);
 assert.equal(call({action:'test',token:'f'.repeat(64),subscription}).status,429);
 assert.equal(call({action:'subscribe',token,subscription:{...subscription,endpoint:'https://localhost/test'},...settings}).status,400);
 const details=require('web-push').generateRequestDetails(subscription,JSON.stringify({destination:'camino'}),{vapidDetails:{subject:'https://derej-beta-comunitaria.vercel.app',...(()=>{const k=require('web-push').generateVAPIDKeys();return{publicKey:k.publicKey,privateKey:k.privateKey};})()},TTL:60});
 assert(details.body.length>0);assert.equal(details.headers['Content-Encoding'],'aes128gcm');
 console.log('PASS: live config/CORS/validation, subscribe/update, ownership protection; encrypted payload generated without sending a push.');
}finally{
 assert.equal(call({action:'unsubscribe',token,subscription}).status,200);
 console.log('Synthetic future subscription removed.');
}

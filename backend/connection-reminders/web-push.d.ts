declare const webpush: {
  sendNotification(subscription:unknown,payload:string,options:{vapidDetails:{subject:string;publicKey:string;privateKey:string};TTL:number;timeout:number;topic:string;urgency?:string}):Promise<unknown>;
};
export default webpush;

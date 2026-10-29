/* JSDOM does not cancel MutationObserver work queued during window.close().
   Dispose observers and scheduled frames before removing the test document. */
module.exports=function trackBrowserLifecycle(window){
 const observers=[],frames=new Set(),Observer=window.MutationObserver;
 const request=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window),close=window.close.bind(window);
 let closed=false;
 window.MutationObserver=class extends Observer{constructor(fn){super((...args)=>{if(!closed)fn(...args);});observers.push(this);}};
 window.requestAnimationFrame=fn=>{if(closed)return 0;let id;id=request(time=>{frames.delete(id);if(!closed)fn(time);});frames.add(id);return id;};
 window.close=()=>{closed=true;observers.forEach(o=>o.disconnect());frames.forEach(cancel);frames.clear();close();};
};

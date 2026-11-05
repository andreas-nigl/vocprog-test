const CACHE="vocprog-staging-20261106-v2";
const ASSETS=["./","./index.html","./manifest.json","./vocprog-enhancements.js","./vocprog-enhancements.css","./favicon.svg"];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("vocprog-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=="GET"||url.origin!==self.location.origin)return;
 // Never cache API responses, personal data, or dynamically created images.
 event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request)));
});

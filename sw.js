const CACHE="vocprog-staging-20261114-v16";
const ASSETS=["./","./index.html","./manifest.json","./vocprog-enhancements.js?v=0.5.3","./vocprog-fr-reference.js?v=0.5.3","./vocprog-enhancements.css?v=0.5.3","./favicon.svg","./vocprog-wasm-adapter.js?v=0.5.3","./vocprog-morphology.js?v=0.5.3","./vocprog-independent-reference.js?v=0.5.3","./vocprog-german-forms.js?v=0.5.3","./reference/manifest.json?v=reference-20261114-1","./vocprog-verb-database.js?v=0.5.3","./vendor/ablaut/ablaut.js","./vendor/ablaut/ablaut_bg.wasm"];
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
 event.respondWith(
   fetch(event.request).then(response=>{
     if(response.ok&&(ASSETS.some(asset=>new URL(asset,self.registration.scope).href===url.href)||
       (url.pathname.startsWith(new URL("./reference/",self.registration.scope).pathname)&&url.pathname.endsWith(".json")))){
       const copy=response.clone();
       caches.open(CACHE).then(cache=>cache.put(event.request,copy));
     }
     return response;
   }).catch(()=>caches.match(event.request))
 );
});

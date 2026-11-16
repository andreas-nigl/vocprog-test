const SCOPE=new URL(self.registration.scope);
const PREFIX="vocprog-cache:"+SCOPE.pathname+":";
const CACHE=PREFIX+"0.5.15-1";
const ASSETS=["./vocprog-page-selection.js?v=0.5.15-1","./vocprog-practice.js?v=0.5.15-1","./vocprog-verb-presentation.js?v=0.5.15-1","./vocprog-sentences.js?v=0.5.15-1","./","./index.html","./manifest.json","./vocprog-enhancements.js?v=0.5.15-1","./vocprog-fr-reference.js?v=0.5.15-1","./vocprog-enhancements.css?v=0.5.15-1","./favicon.svg","./vocprog-wasm-adapter.js?v=0.5.15-1","./vocprog-morphology.js?v=0.5.15-1","./vocprog-independent-reference.js?v=0.5.15-1","./vocprog-german-forms.js?v=0.5.15-1","./reference/manifest.json?v=reference-20261114-1","./vocprog-verb-database.js?v=0.5.15-1","./vendor/ablaut/ablaut.js","./vendor/ablaut/ablaut_bg.wasm"];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=="GET"||url.origin!==SCOPE.origin||!url.pathname.startsWith(SCOPE.pathname))return;
 // Never cache API responses, personal data, or dynamically created images.
 event.respondWith(
   fetch(event.request).then(response=>{
     if(response.ok&&(ASSETS.some(asset=>new URL(asset,self.registration.scope).href===url.href)||
       (url.pathname.startsWith(new URL("./reference/",self.registration.scope).pathname)&&url.pathname.endsWith(".json")))){
       const copy=response.clone();
       caches.open(CACHE).then(cache=>cache.put(event.request,copy));
     }
     return response;
   }).catch(()=>caches.open(CACHE).then(cache=>cache.match(event.request)))
 );
});

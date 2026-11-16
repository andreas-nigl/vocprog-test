"use strict";
// Retirement worker: retire this scope only. Never touch vocabulary, keys or production caches.
const scope=new URL(self.registration.scope);
const prefix="vocprog-cache:"+scope.pathname+":";
self.addEventListener("install",event=>event.waitUntil(self.skipWaiting()));
self.addEventListener("activate",event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith(prefix)).map(key=>caches.delete(key)));
  await self.clients.claim();
  const clients=await self.clients.matchAll({type:"window"});
  for(const client of clients){
    const url=new URL(client.url);
    if(url.origin===scope.origin&&url.pathname.startsWith(scope.pathname))await client.navigate(scope.href);
  }
  await self.registration.unregister();
})()));

'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../sw.js'),'utf8');
function worker(scope,deleted=[]){
 const handlers={},cache={match:async request=>'own:'+request.url};
 const caches={keys:async()=>['vocprog-cache:/vocprog/:old','vocprog-cache:/vocprog-test/:old','vocprog-staging-legacy'],delete:async key=>deleted.push(key),open:async()=>cache};
 const self={registration:{scope},addEventListener:(name,handler)=>handlers[name]=handler,clients:{claim:async()=>{}},skipWaiting:async()=>{}};
 vm.runInNewContext(source,{self,caches,URL,fetch:async()=>{throw Error('offline');}});return handlers;
}
test('Parallel apps delete only caches belonging to their own scope',async()=>{
 for(const scope of ['vocprog','vocprog-test']){
 const deleted=[],handlers=worker('https://example.test/'+scope+'/',deleted);let pending;
 handlers.activate({waitUntil:promise=>pending=promise});await pending;
 assert.deepEqual(deleted,['vocprog-cache:/'+scope+'/:old']);
 }
});
test('Offline fallback uses own cache and leaves requests outside app scope alone',async()=>{
 const handlers=worker('https://example.test/vocprog/');let pending;
 handlers.fetch({request:{url:'https://example.test/vocprog-test/index.html',method:'GET'},respondWith:()=>assert.fail('Foreign scope intercepted')});
 handlers.fetch({request:{url:'https://example.test/vocprog/index.html',method:'GET'},respondWith:promise=>pending=promise});
 assert.equal(await pending,'own:https://example.test/vocprog/index.html');
});

"use strict";
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const api=require('../vocprog-sentences.js');
const words=[{id:'a',foreign:'chat',german:'Katze',page:'1'},{id:'b',foreign:'noir',german:'schwarz',page:'1'}];
const sentence={id:'s',kind:'ai-sentence',bookId:'book',german:'Die Katze ist schwarz.',foreign:'Le chat est noir.',lang:'fr-FR',vocabIds:['a','b']};
test('Sentence overlap excludes a sentence if any required vocabulary is outside the selection',()=>{
 assert.equal(api.eligible([sentence],'book',words).length,1);
 assert.equal(api.eligible([sentence],'book',words.slice(0,1)).length,0);
 assert.equal(api.eligible([sentence],'other',words).length,0);
 assert.equal(api.eligible([sentence],'book',[...words,{id:'c'}]).length,1);
});
test('Legacy batch retains both language directions and conservatively requires all original IDs',()=>{
 const cache={id:'old',bookId:'book',key:'["a","b"]',items:[{prompt:sentence.foreign,target:sentence.german,pLang:'fr-FR',tLang:'de-DE'}]};
 const [stored]=api.eligible([cache],'book',words);
 assert.equal(stored.german,sentence.german);assert.equal(stored.foreign,sentence.foreign);
 assert.equal(api.eligible([cache],'book',words.slice(0,1)).length,0);
 assert.deepEqual(api.stored([{...cache,key:'broken'}],'book'),[]);
});
test('Generation refuses unknown or missing vocabulary associations',()=>{
 assert.throws(()=>api.validate([{...sentence,vocabIds:['x']}],words));
 assert.throws(()=>api.validate([{...sentence,vocabIds:[]}],words));
 assert.deepEqual(api.validate([{...sentence,vocabIds:['a']}],words)[0].vocabIds,['a']);
 assert.deepEqual(api.validate([sentence],words)[0].vocabIds,['a','b']);
});
const source=fs.readFileSync(path.join(__dirname,'../vocprog-enhancements.js'),'utf8');
const fragment=source.slice(source.indexOf('  let sentenceJob=null;'),source.indexOf('  function enterTraining(){'));
function harness({cached=[],online=true,fetcher}={}){
 const state={specials:[...cached],calls:0,saved:0,entered:0,alerts:[],online,reverse:false};
 const buttons=new Map();
 const get=key=>{if(!buttons.has(key))buttons.set(key,{id:key,value:key==='apiKey'?'test-key':key==='direction'?'de_to_foreign':'',checked:false,textContent:'',classList:{add(){},remove(){}},setAttribute(){},removeAttribute(){}});return buttons.get(key);};
 const setup=new Function('state','get','api','fetcher',`
 let syncing=false;
 const syncNow=async()=>state.synchronize?state.synchronize():state.syncFailure?false:true;
 let specials=state.specials,chosenBook='book',trainingItems=[];
 const window={VOCSentences:api},navigator={get onLine(){return state.online;}},initialSyncReady=Promise.resolve();
 const activeBook=()=>({lang:'fr-FR'}),filteredVocabList=[];
 const alert=x=>state.alerts.push(x),id=()=>String(++state.calls);
 const persistMetadata=()=>state.saved++,updateVerbReadiness=()=>{},enterTraining=()=>{state.entered++;state.cards=trainingItems;};
 const fetch=(...args)=>{state.requests=(state.requests||0)+1;return fetcher(...args);};
 ${fragment}
 return {run:runSentenceTraining,cancel:cancelSentenceGeneration};`);
 return {state,get,...setup(state,get,api,fetcher||(()=>{throw Error('Unexpected generation');}))};
}
test('Online and offline cached training never call the generator',async()=>{
 for(const online of [true,false]){
 const h=harness({cached:[sentence],online});
 await h.run(words,h.get('startTrainingBtn'),false);
 assert.equal(h.state.requests,undefined);assert.equal(h.state.entered,1);assert.equal(h.state.saved,0);
 }
});
test('Offline without matching sentences shows the requested message and leaves training closed',async()=>{
 const h=harness({online:false});await h.run(words,h.get('startTrainingBtn'),false);
 assert.deepEqual(h.state.alerts,['Keine Sätze vorhanden.']);assert.equal(h.state.entered,0);
});
test('Second click aborts request; a late response cannot save or reopen training',async()=>{
 let resolveResponse,signal;
 const h=harness({fetcher:(_url,options)=>{signal=options.signal;return new Promise(resolve=>{resolveResponse=resolve;});}});
 const pending=h.run(words,h.get('startTrainingBtn'),false);
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(h.get('startTrainingBtn').disabled,false);
 await h.run(words,h.get('startTrainingBtn'),false);assert.equal(signal.aborted,true);
 resolveResponse({ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify([sentence])}]}}]})});
 await pending;assert.equal(h.state.saved,0);assert.equal(h.state.entered,0);
});
test('Explicit new sentences append unique records without replacing saved sentences',async()=>{
 const next={...sentence,german:'Eine schwarze Katze.',foreign:'Un chat noir.'};
 const h=harness({cached:[sentence],fetcher:async()=>({ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify([sentence,next])}]}}]})})});
 await h.run(words,h.get('newSentencesBtn'),false,true);
 assert.equal(h.state.specials.length,2);assert.equal(h.state.specials[0],sentence);
 assert.equal(h.state.saved,1);assert.equal(h.state.entered,1);
 const reopened=harness({cached:JSON.parse(JSON.stringify(h.state.specials))});
 reopened.get('direction').value='foreign_to_de';await reopened.run(words,reopened.get('startTrainingBtn'),false);
 assert.equal(reopened.state.cards[0].prompt,sentence.foreign);
});

function syncClient(remote,initial=[]){
 const state={specials:initial,timers:[],saved:{},posts:0};
 const fragment=source.slice(source.indexOf('  function records(){'),source.indexOf('  function renderStatus(){'));
 const setup=new Function('state','remote',`
 let specials=state.specials,books=[{id:'book',name:'Test',lang:'fr-FR',updatedAt:'2026-01-01T00:00:00Z'}],history=[],tombstones=[],chosenBook='book';
 let syncing=false,syncTimer=null,lastSync='',vocabList=[],filteredVocabList=[];
 const STORE='test',DB_URL='https://test.invalid',PUB_KEY='public',window={},navigator={onLine:true};
 const localStorage={setItem:(k,v)=>{state.saved[k]=v;}},allVocab=()=>[],save=(k,v)=>{state.saved[k]=JSON.stringify(v);},read=()=>[];
 const renderStatus=()=>{},chooseBook=()=>{},refreshBookChoices=()=>{},get=()=>({classList:{add(){}}}),consolidateVerbBooks=()=>{};
 const setTimeout=fn=>{state.timers.push(fn);return state.timers.length;},clearTimeout=()=>{};
 const fetch=async(_url,options)=>{
 if(options.method==='POST'){
 state.posts++;
 for(const row of JSON.parse(options.body))remote.set(row.record_id,JSON.parse(JSON.stringify(row)));
 if(state.duringPost){const action=state.duringPost;state.duringPost=null;action();}
 return {ok:true};
 }
 const url=new URL(_url),offset=Number(url.searchParams.get('offset')||0),limit=Math.min(1000,Number(url.searchParams.get('limit')||1000));
 if(state.failOffset!==undefined&&offset>=state.failOffset)return {ok:false,status:503};
 return {ok:true,json:async()=>state.dropConfirmation&&_url.includes('record_id=in.')?[]:JSON.parse(JSON.stringify([...remote.values()].sort((a,b)=>a.record_id.localeCompare(b.record_id)).slice(offset,offset+limit)))};
 };
 ${fragment}
 return {sync:syncNow,queue:scheduleSync,entries:()=>specials,add:item=>specials.push(item),error:()=>lastError,replace:values=>{specials=values;}};`);
 return {state,...setup(state,remote)};
}
test('Actual synchronization serializes sentence IDs and vocabulary IDs and restores them on a second client',async()=>{
 const remote=new Map(),first=syncClient(remote,[{...sentence,updatedAt:'2026-11-15T10:00:00Z'}]);
 await first.sync();assert.deepEqual(remote.get('special:s').payload.vocabIds,['a','b']);
 const second=syncClient(remote);await second.sync();
 assert.equal(api.eligible(second.entries(),'book',words).length,1);
 assert.equal(api.eligible(second.entries(),'book',words.slice(0,1)).length,0);
});
test('A sentence saved during an active server POST queues a following synchronization',async()=>{
 const remote=new Map(),client=syncClient(remote,[{...sentence,updatedAt:'2026-11-15T10:00:00Z'}]);
 client.state.duringPost=()=>{client.add({...sentence,id:'later',updatedAt:'2026-11-15T10:01:00Z'});client.queue();};
 await client.sync();assert.equal(client.state.timers.length,1);
 await client.state.timers.shift()();assert.ok(remote.has('special:later'));
});

test('Two explicit generations for the same vocabulary append, count, and survive serialized reopening',async()=>{
 let iteration=0;
 const h=harness({cached:[sentence],fetcher:async()=>({ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify([{...sentence,german:'Zusatz '+(++iteration),foreign:'Phrase '+iteration}])}]}}]})})});
 await h.run(words,h.get('newSentencesBtn'),false,true);
 await h.run(words,h.get('newSentencesBtn'),false,true);
 assert.equal(h.state.specials.length,3);
 assert.equal(h.state.saved,2);
 assert.equal(api.eligible(JSON.parse(JSON.stringify(h.state.specials)),'book',words).length,3);
 const fragment=source.slice(source.indexOf('  function vocabularyBookSummary('),source.indexOf('  function updateVerbReadiness('));
 const summarize=new Function(fragment+'return vocabularyBookSummary;')();
 assert.match(summarize(words,h.state.specials),/3 gespeicherte KI-Sätze/);
 assert.equal(h.state.cards.length,1,'New sentences shows only the newly added batch');
});
test('Duplicate-only generation reports zero additions without replacing or shuffling the existing exercise',async()=>{
 const h=harness({cached:[sentence],fetcher:async()=>({ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify([sentence])}]}}]})})});
 await h.run(words,h.get('newSentencesBtn'),false,true);
 assert.equal(h.state.saved,0);assert.equal(h.state.specials.length,1);assert.equal(h.state.entered,0);
 assert.match(h.state.alerts[0],/Keine zusätzlichen Sätze gespeichert/);
});

test('Server confirmation failure remains visible instead of declaring synchronization successful',async()=>{
 const remote=new Map(),client=syncClient(remote,[{...sentence,updatedAt:'2026-11-15T10:00:00Z'}]);
 client.state.dropConfirmation=true;await client.sync();
 assert.match(client.error(),/Nicht alle neuen KI-Sätze/);
});

test('Fresh client loads a sentence beyond the first 1000 server records without generation',async()=>{
 const remote=new Map();
 for(let i=0;i<1200;i++)remote.set('special:'+String(i).padStart(5,'0'),{record_id:'special:'+String(i).padStart(5,'0'),record_type:'special',payload:{id:String(i),kind:'fixture',bookId:'book'},updated_at:'2026-01-01T00:00:00Z'});
 remote.set('special:zz-sentence',{record_id:'special:zz-sentence',record_type:'special',payload:{...sentence,id:'zz-sentence',updatedAt:'2026-11-16T00:00:00Z'},updated_at:'2026-11-16T00:00:00Z'});
 const fresh=syncClient(remote);assert.equal(await fresh.sync(),true);
 assert.equal(fresh.entries().length,1201);
 assert.equal(api.eligible(fresh.entries(),'book',words).length,1);
});
test('A failed later page neither merges a partial server snapshot nor writes local data',async()=>{
 const remote=new Map();for(let i=0;i<700;i++)remote.set(String(i),{record_id:String(i),record_type:'special',payload:{id:String(i)},updated_at:'2026-01-01T00:00:00Z'});
 const fresh=syncClient(remote);fresh.state.failOffset=500;
 assert.equal(await fresh.sync(),false);assert.equal(fresh.entries().length,0);assert.equal(fresh.state.posts,0);
});
test('Failed server inventory never starts a paid AI generation',async()=>{
 const h=harness();h.state.syncFailure=true;
 await h.run(words,h.get('startTrainingBtn'),false);
 assert.equal(h.state.requests,undefined);assert.match(h.state.alerts[0],/Keine neue Generierung gestartet/);
});

test('Full generation-to-server flow appends 25 partially covering sentences to 25 legacy sentences',async()=>{
 const legacy={id:'legacy',bookId:'book',key:'["a","b"]',updatedAt:'2026-01-01T00:00:00Z',items:Array.from({length:25},(_,i)=>({prompt:'Alt '+i,target:'Ancien '+i,pLang:'de-DE',tLang:'fr-FR'}))};
 const remote=new Map(),client=syncClient(remote,[legacy]);await client.sync();
 const generated=Array.from({length:25},(_,i)=>({german:'Neu '+i,foreign:'Nouveau '+i,vocabIds:['a']}));
 const h=harness({cached:[legacy],fetcher:async()=>({ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify(generated)}]}}]})})});
 h.state.synchronize=()=>{client.replace(h.state.specials);return client.sync();};
 await h.run([...words,{id:'c'}],h.get('newSentencesBtn'),false,true);
 assert.equal(h.state.saved,1);assert.equal(h.state.entered,1);
 const other=syncClient(remote);assert.equal(await other.sync(),true);
 assert.equal(api.stored(other.entries(),'book').length,50);
 assert.equal(api.eligible(other.entries(),'book',words).length,50);
 assert.equal(api.eligible(other.entries(),'book',words.slice(0,1)).length,25);
 assert.equal(api.eligible(other.entries(),'book',words.slice(1)).length,0);
});
test('Failed upload retains newly generated sentences locally and reports missing confirmation',async()=>{
 const h=harness({cached:[sentence],fetcher:async()=>({ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify([{...sentence,german:'Neu',foreign:'Nouveau',vocabIds:['a']}])}]}}]})})});
 let calls=0;h.state.synchronize=async()=>++calls===1;
 await h.run(words,h.get('newSentencesBtn'),false,true);
 assert.equal(h.state.specials.length,2);assert.equal(h.state.saved,1);
 assert.match(h.state.alerts[0],/lokal gespeichert/);
});

test('No sentence matches a narrowed selection: automatically generate and append a suitable new sentence',async()=>{
 const h=harness({cached:[sentence],fetcher:async()=>({ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify([{german:'Eine Katze.',foreign:'Un chat.',vocabIds:['a']}])}]}}]})})});
 await h.run(words.slice(0,1),h.get('startTrainingBtn'),false);
 assert.equal(h.state.requests,1);assert.equal(h.state.specials.length,2);
 assert.equal(h.state.cards.length,1);assert.equal(h.state.cards[0].target,'Un chat.');
});

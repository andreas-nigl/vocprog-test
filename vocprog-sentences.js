(function(root){
  "use strict";
  const text=value=>String(value||"").normalize("NFC").replace(/\s+/g," ").trim();
  const pairKey=item=>JSON.stringify([text(item.german),text(item.foreign)]);
  function stored(caches,bookId){
    const result=new Map();
    for(const cache of caches.filter(c=>c.bookId===bookId)){
      if(cache.kind==="ai-sentence"&&cache.german&&cache.foreign){result.set(pairKey(cache),cache);continue;}
      let selection=[];
      try{selection=JSON.parse(cache.key||"[]");}catch(_error){continue;}
      if(!Array.isArray(selection)||!selection.length)continue;
      for(const item of cache.items||[]){
        const reverse=item.pLang!=="de-DE";
        const entry={id:cache.id+":"+result.size,bookId,kind:"ai-sentence",
          german:reverse?item.target:item.prompt,foreign:reverse?item.prompt:item.target,
          lang:reverse?item.pLang:item.tLang,vocabIds:selection.map(String),
          legacySelection:true,ref:item.ref,page:item.page,pages:item.pages};
        if(text(entry.german)&&text(entry.foreign)&&!result.has(pairKey(entry)))result.set(pairKey(entry),entry);
      }
    }
    return [...result.values()];
  }
  function eligible(caches,bookId,entries){
    const selected=new Set(entries.map(v=>String(v.id||v.refVocab)));
    return stored(caches,bookId).filter(s=>Array.isArray(s.vocabIds)&&s.vocabIds.length&&s.vocabIds.every(id=>selected.has(String(id))));
  }
  function validate(items,entries){
    if(!Array.isArray(items)||!items.length)throw Error("Keine gültigen KI-Sätze erhalten.");
    const allowed=new Set(entries.map(v=>String(v.id||v.refVocab)));
    const validated=items.map(item=>{
      const vocabIds=[...new Set((item.vocabIds||[]).map(String))];
      if(!text(item.german)||!text(item.foreign)||!vocabIds.length||vocabIds.some(id=>!allowed.has(id)))
        throw Error("KI-Satz enthält fehlende oder ungültige Vokabelzuordnungen.");
      return {...item,german:text(item.german),foreign:text(item.foreign),vocabIds};
    });
    return validated;
  }
  const api={stored,eligible,validate,pairKey};
  root.VOCSentences=api;
  if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);

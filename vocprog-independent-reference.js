/* Separately published reference lexicons, lazy local shards; no AI calls. */
(function(root){
  'use strict';
  const requests=new Map();
  const VERSION='reference-20261114-1';
  const codes={'fr-FR':'fra','de-DE':'deu','en-US':'eng','es-ES':'spa','pt-PT':'por','nl-NL':'nld'};
  const normal=value=>String(value||'').normalize('NFC').trim().toLocaleLowerCase();
  async function json(path){
    if(!requests.has(path))requests.set(path,fetch(path,{cache:'force-cache'}).then(response=>{
      if(!response.ok)throw Error('Referenzdaten nicht verfügbar (HTTP '+response.status+')');
      return response.json();
    }).catch(error=>{requests.delete(path);throw error;}));
    return requests.get(path);
  }
  async function lookup(language,word){
    const code=codes[language],lemma=normal(word);
    if(!code||!lemma||lemma.length>100)return null;
    const manifest=await json('./reference/manifest.json?v='+VERSION);
    const shard=lemma.codePointAt(0).toString(16);
    if(!manifest.languages[language]?.shards.includes(shard))return null;
    const entries=await json('./reference/'+code+'/'+shard+'.json?v='+VERSION);
    const entry=Object.prototype.hasOwnProperty.call(entries,lemma)?entries[lemma]:null;
    if(!entry||!entry.forms)return null;
    return {...entry,sources:entry.sources||[manifest.sources[entry.sourceKey]]};
  }
  root.VOCIndependentReference=Object.freeze({lookup,version:VERSION});
})(typeof window==='undefined'?globalThis:window);

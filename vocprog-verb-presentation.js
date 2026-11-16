(function(root){
  "use strict";
  const clean=value=>String(value||"").trim().replace(/\s+/g," ");
  function germanImperative(value){
    return String(value||"").split(/\s+\/\s+/).map(part=>part.replace(/^\((du|wir|ihr|Sie)\)\s*(.*)$/,(all,person,form)=>{
      const hasPronoun=new RegExp("(?:^|\\s)"+person+"(?:\\s|[!?.]|$)").test(form);
      return hasPronoun?form:all;
    })).join(" / ");
  }
  function imperativeCards(verb){
    if(!verb)return [];
    const persons=["tu","nous","vous"];
    const raw=Array.isArray(verb.imperative)?verb.imperative:String(verb.imperative||"").split(/\s+\/\s+/);
    const german=new Map();
    const parts=String(verb.imperativeGerman||"").split(/\s+\/\s+/);
    for(const [index,part] of parts.entries()){
      const label=part.match(/^\((du|wir|ihr|Sie)\)/)?.[1];
      const spoken=part.match(/(?:^|\s)(wir|Sie)(?:\s|[!?.]|$)/)?.[1];
      const person=label||spoken||(parts.length===3||parts.length===4?["du","wir","ihr","Sie"][index]:null);
      if(person)german.set(person,[...(german.get(person)||[]),germanImperative(label?part:"("+person+") "+part)]);
    }
    return persons.map((person,index)=>{
      const bare=clean(raw[index]).replace(/^\((?:tu|nous|vous)\)\s*/,"");
      const translations=(index===0?german.get("du"):index===1?german.get("wir"):[...(german.get("ihr")||[]),...(german.get("Sie")||[])])||[];
      const translated=translations.join(" / ");
      return {person,tense:"impératif",foreign:"("+person+") "+bare,german:translated,
        acceptedForeign:[bare,"("+person+") "+bare],
        acceptedGerman:translations.map(value=>value.replace(/^\((?:du|wir|ihr|Sie)\)\s*/,"")),valid:!!bare&&!!translated};
    }).filter(card=>card.valid);
  }
  function compareVocabulary(a,b){
    const page=String(a.page||"?"),other=String(b.page||"?");
    const pageOrder=page==="?"?(other==="?"?0:1):other==="?"?-1:page.localeCompare(other,"de",{numeric:true});
    const number=entry=>Number(String(entry.refVocab||"").match(/\bV\s*(\d+)/i)?.[1]||Infinity);
    return pageOrder||number(a)-number(b)||0;
  }
  const api={germanImperative,imperativeCards,compareVocabulary};root.VOCVerbPresentation=api;
  if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);

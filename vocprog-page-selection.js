(function(root){
  "use strict";
  function parse(value){
    const text=String(value||"").trim().replace(/[–—−]/g,"-");
    const fail=message=>({valid:false,pages:[],error:message});
    if(!text)return fail("Bitte mindestens eine Seite eingeben.");
    const pages=new Set();
    for(const part of text.split(",")){
      const match=part.trim().match(/^(\d{1,5})(?:\s*-\s*(\d{1,5}))?$/);
      if(!match)return fail("Format: einzelne Seiten oder Bereiche, getrennt durch Komma, z. B. 154-156, 178.");
      const first=Number(match[1]),last=Number(match[2]||match[1]);
      if(first<1||last<first)return fail("Seiten müssen positiv und Bereiche aufsteigend sein, z. B. 154-156.");
      if(last-first>10000||pages.size+last-first+1>10000)return fail("Bitte einen kleineren Seitenbereich eingeben.");
      for(let page=first;page<=last;page++)pages.add(page);
    }
    return {valid:true,pages:[...pages].sort((a,b)=>a-b),error:""};
  }
  root.VOCPageSelection={parse};
  if(typeof module!=="undefined")module.exports={parse};
})(typeof globalThis!=="undefined"?globalThis:this);

"use strict";
const assert=require("node:assert/strict");
const test=require("node:test");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const code=fs.readFileSync(path.join(root,"vocprog-enhancements.js"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const css=fs.readFileSync(path.join(root,"vocprog-enhancements.css"),"utf8");

function fragment(from,to){
  const a=code.indexOf(from),b=code.indexOf(to,a);
  assert.ok(a>=0&&b>a,"function boundaries: "+from);
  return code.slice(a,b);
}
test("Trainer table is a separate second card below the trainer",()=>{
  assert.match(html,/<\/div>\s*<section id="verbTablePanel"/);
  assert.match(css,/\.verb-table-panel\{[^}]*border-radius:16px/);
  assert.match(css,/\.trainer-top-row\{display:grid/);
  assert.match(css,/#verbTableToggle\.icon-btn\{[^}]*border:0/);
});
test("Verb table renders infinitive, participle, imperative and tense headings",()=>{
  assert.match(code,/row\("Infinitif : "/);
  assert.match(code,/row\("Participe passé : "/);
  assert.match(code,/row\("Impératif : "/);
  assert.match(code,/row\(match\?\.\[1\]\|\|title,match\?\.\[2\]\|\|"Zeitform",true\)/);
});
test("Per-page verb references start at V1 and do not inherit OCR gaps",()=>{
  const source=fragment("  function selectedVerbEntries(){","  const oldStartTraining=");
  const get=id=>id==="tenseSelect"?{value:"présent"}:null;
  const data=[
    {bookId:"fr",page:"156",kind:"verb-infinitive",verbId:"venir",refVocab:"S156 V62"},
    {bookId:"fr",page:"156",kind:"verb-form",verbId:"venir",tense:"présent",verification:"reference-verified",refVocab:"S156 V63"},
    {bookId:"fr",page:"156",kind:"verb-infinitive",verbId:"manger",refVocab:"S156 V104"},
    {bookId:"fr",page:"157",kind:"verb-infinitive",verbId:"aller",refVocab:"S157 V26"}
  ];
  const f=new Function("allVocab","get","activeBook","bookKind","baseVerbKinds","normalizeTense",
    source+"return selectedVerbEntries;")(
    ()=>data,get,()=>({id:"fr",kind:"verbs"}),()=> "verbs",
    new Set(["verb-infinitive"]),x=>String(x||"").toLowerCase()
  );
  assert.deepEqual(f().map(x=>x.refVocab),[
    "S156 V1","S156 V1","S156 V2","S157 V1"
  ]);
  assert.equal(data[0].refVocab,"S156 V62","stored references must remain unchanged");
});
test("Duplicate French verb books merge without losing events or distinct forms",()=>{
  const source=fragment("  function consolidateVerbBooks(){","  function persistMetadata(){");
  const storage={"vocab_trainer_data_fr-FR":JSON.stringify([
    {id:"v1",bookId:"a",kind:"verb-infinitive",foreign:"venir",german:"kommen",verbId:"venir",page:"156"},
    {id:"v2",bookId:"b",kind:"verb-infinitive",foreign:"venir",german:"kommen",verbId:"venir",page:"156"},
    {id:"v3",bookId:"b",kind:"verb-form",foreign:"je viens",german:"ich komme",verbId:"venir",tense:"présent",person:"je",page:"156"},
    {id:"v4",bookId:"b",kind:"verb-infinitive",foreign:"venir",german:"kommen",verbId:"venir",page:"157"}
  ])};
  Object.defineProperty(storage,"getItem",{value:k=>storage[k]||null});
  Object.defineProperty(storage,"setItem",{value:(k,v)=>{storage[k]=v;}});
  const state={books:[
    {id:"a",name:"FR 1",kind:"verbs",lang:"fr-FR"},
    {id:"b",name:"FR 2",kind:"verbs",lang:"fr-FR"}],
    specials:[{id:"s",bookId:"b",kind:"verb-paradigm",lemma:"venir"}],
    history:[{id:"e",bookId:"b",sourceId:"v2",at:"2026-11-10T10:00:00Z",action:"shown"}],
    chosenBook:"b",tombstones:[],persisted:0};
  const setup=String.raw`let books=state.books,specials=state.specials,
    history=state.history,chosenBook=state.chosenBook;
    const LANGS={"fr-FR":"Französisch"},STORE="vocprog_v2",localStorage=storage;
    const bookKind=b=>b.kind==="verbs"?"verbs":"vocab";
    const read=(k,f)=>JSON.parse(storage.getItem(k)||JSON.stringify(f));
    const save=(k,v)=>storage.setItem(k,JSON.stringify(v));
    const allVocab=()=>Object.keys(storage).filter(k=>k.startsWith("vocab_trainer_data_")).flatMap(k=>read(k,[]));
    const markDeleted=(kind,e,at)=>state.tombstones.push({record_id:kind+":"+e.id,updated_at:at});
    const persistMetadata=()=>state.persisted++;
    const refreshBookChoices=()=>{};`;
  const execute=new Function("storage","state",
    setup+source+"const first=consolidateVerbBooks();"+
    "const second=consolidateVerbBooks();"+
    "return {first,second,books,specials,history,chosenBook};");
  const result=execute(storage,state);
  const data=JSON.parse(storage["vocab_trainer_data_fr-FR"]);
  assert.equal(result.first,1);
  assert.equal(result.second,0);
  assert.equal(result.books.length,1);
  assert.equal(data.length,3);
  assert.ok(data.some(v=>v.page==="157"&&v.id==="v4"),
    "identical verbs on other lesson pages must survive");
  assert.ok(data.every(v=>v.bookId==="a"));
  assert.equal(result.history[0].sourceId,"v1");
  assert.equal(result.history[0].bookId,"a");
  assert.equal(result.specials[0].bookId,"a");
  assert.equal(result.chosenBook,"a");
  assert.ok(state.tombstones.some(x=>x.record_id==="book:b"));
  assert.ok(Object.keys(storage).some(x=>x.startsWith("vocprog_v2_verbbook_backup_fr-FR_")));
});


test("Ordinary vocabulary books renumber remaining entries per page without altering stored references",()=>{
  const source=fragment("  filterVocabByPages=function(){","  const oldSave=saveToLocalStorage;");
  const originals=[
    {id:"w1",bookId:"book",page:"156",refVocab:"S156 V62",foreign:"bonjour"},
    {id:"w2",bookId:"book",page:"156",refVocab:"S156 V64",foreign:"merci"},
    {id:"w3",bookId:"book",page:"157",refVocab:"S157 V8",foreign:"salut"}
  ];
  const fields={pageRangeInput:{value:"156-157"}};
  let populated=false;
  const parsePageRanges=()=>[156,157];
  const get=id=>fields[id];
  const run=new Function("vocabList","chosenBook","parsePageRanges","get",
    "populateSelectors",
    "let filteredVocabList=[],filterVocabByPages;"+source+
    "return {run:filterVocabByPages,getList:()=>filteredVocabList};")(
    originals,"book",parsePageRanges,get,()=>{populated=true;}
  );
  run.run();
  assert.equal(populated,true);
  assert.deepEqual(run.getList().map(v=>v.refVocab),[
    "S156 V1","S156 V2","S157 V1"
  ]);
  assert.deepEqual(originals.map(v=>v.refVocab),[
    "S156 V62","S156 V64","S157 V8"
  ]);
});

test("Book action buttons are neutral outlined controls with thin red delete icon",()=>{
  assert.match(css,/\.book-manager #deleteBookBtn \{background:#fff;color:#c62828/);
  assert.match(css,/border:1px solid #111827/);
  assert.match(css,/width:40px;min-width:40px;max-width:40px/);
});
test("Trainer close remains in the right grid column when table is hidden",()=>{
  assert.match(css,/\.trainer-top-row > button:last-child \{grid-column:3;justify-self:end\}/);
  assert.match(css,/#verbTableToggle\.icon-btn \{grid-column:2;grid-row:1\}/);
});
test("Verb table uses curated French reference for missing base forms",()=>{
  assert.match(code,/const curated=isFrench\?window\.VOCFrenchReference\?\.conjugate\(lemma\):null/);
  assert.match(code,/reference\?\.agreement\|\|reference\?\.pastParticiple/);
  assert.match(code,/Array\.isArray\(reference\?\.imperative\)/);
});

test("Repeat scan reports existing unique verbs without zero conflict warnings",()=>{
  const source=fragment("  window.describeVOCScan=function", "  window.ingestVerbInfinitives=");
  const window={VOCGeneratedFrenchForms:0,VOCScanVerificationWarnings:0};
  new Function("window","books","bookKind","allVocab",source)(window,
    [{id:"fr",lang:"fr-FR",kind:"verbs"}],b=>b.kind,
    ()=>Array.from({length:33},(_,i)=>({bookId:"fr",infinitive:"verb"+i})).concat([
      {bookId:"fr",infinitive:"verb0",foreign:"conjugated"}]));
  const summary=window.describeVOCScan({language:"fr-FR"});
  assert.match(summary,/Keine neuen Einträge/);
  assert.match(summary,/33 verschiedene Verben/);
  assert.doesNotMatch(summary,/widersprüchliche/);
  window.VOCScanVerificationWarnings=2;
  assert.match(window.describeVOCScan({language:"fr-FR",infinitives:1}),/2 widersprüchliche/);
});

test("Sync cannot expose learning setup during an active exercise",()=>{
  assert.match(code,/target.length===0\|\|!get\("trainerCard"\).classList.contains\("hidden"\)/);
  assert.match(css,/body:has\(#trainerCard:not\(\.hidden\)\) #rangeCard\{display:none!important\}/);
});

"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../vocprog-enhancements.js"),"utf8");
const fragment=source.slice(source.indexOf("  function vocabularyBookSummary("),source.indexOf("  function updateVerbReadiness("));
const summarize=new Function(fragment+"return vocabularyBookSummary;")();
test("Book inventory counts vocabulary, complete sentence pairs and unique cached sentences",()=>{
  const entries=[
    {sentence_foreign:"Bonjour",sentence_german:"Guten Tag"},
    {sentence_foreign:"  Bonjour ",sentence_german:"Guten Tag"},
    {sentence_foreign:"Au revoir",sentence_german:""},{}
  ];
  const caches=[{items:[{prompt:"Hallo",target:"Salut"},{prompt:"Salut",target:"Hallo"}]},
    {kind:"prepared-verb",record:{}},{items:[{prompt:"unvollständig"}]}];
  assert.equal(summarize(entries,caches),"4 Vokabeln · 1 Buchsatz · 1 gespeicherter KI-Satz.");
  assert.equal(summarize([],[]),"0 Vokabeln · 0 Buchsätze.");
});

test("Starting in the already selected vocabulary book preserves the chosen card range",async()=>{
  const fragment=source.slice(source.indexOf("  const oldStart=startTraining;"),source.indexOf("  const oldGenerate=generateAllCombinedSentences;"));
  const state={book:"same",chosen:"same",end:0,changes:0};
  const start=new Function("state",`
    let chosenBook=state.chosen;
    const get=()=>({value:state.book});
    const chooseBook=value=>{chosenBook=value;state.end=75;state.changes++;};
    let startTraining=async()=>state.end;
    ${fragment}
    return startTraining;`)(state);
  assert.equal(await start(),undefined);
  assert.equal(state.end,0);assert.equal(state.changes,0);
  state.book="other";await start();assert.equal(state.changes,1);
});

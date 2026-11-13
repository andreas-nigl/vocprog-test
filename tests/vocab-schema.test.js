"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const test=require("node:test");

const root=path.join(__dirname,"..");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const extension=fs.readFileSync(path.join(root,"vocprog-enhancements.js"),"utf8");
const reference=fs.readFileSync(path.join(root,"vocprog-fr-reference.js"),"utf8");
const worker=fs.readFileSync(path.join(root,"sw.js"),"utf8");

test("all inline and extension JavaScript parses",()=>{
  for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){
    if(match[1])assert.doesNotThrow(()=>new Function(match[1]));
  }
  for(const value of [extension,reference,worker])assert.doesNotThrow(()=>new Function(value));
});

test("local French reference loads before extension and is offline cached",()=>{
  assert.ok(html.indexOf('src="vocprog-fr-reference.js"')<
    html.indexOf('src="vocprog-enhancements.js"'));
  assert.match(worker,/vocprog-fr-reference\.js/);
});

function mergerWithMemory() {
  const begin=html.indexOf("  function mergeVocabularies(");
  const end=html.indexOf("  function rebuildReferences()",begin);
  assert.ok(begin>=0&&end>begin,"Legacy merge implementation found");
  const memory=[];
  const doc={getElementById:()=>({value:"fr-FR"})};
  const merger=new Function("vocabList","rebuildReferences","document",
    html.slice(begin,end)+"\nreturn mergeVocabularies;")(memory,()=>{},doc);
  return {memory,merger};
}

const lemma={bookId:"f",page:"10",infinitive:"manger",verbId:"manger",
  lang:"fr-FR",kind:"verb-form",foreign:"je mange",german:"ich esse",
  verification:"reference-verified",translationVerification:"ai-generated-unverified"};
test("identical words in different tenses are distinct learning cards",()=>{
  const {memory,merger}=mergerWithMemory();
  const count=merger([
    {...lemma,id:"a",tense:"présent",person:"je"},
    {...lemma,id:"b",tense:"subjonctif présent",person:"je"},
    {...lemma,id:"c",tense:"présent",person:"je"}
  ]);
  assert.equal(count,2);
  assert.equal(memory.length,2);
  assert.deepEqual(memory.map(v=>v.tense),["présent","subjonctif présent"]);
});

test("verb IDs and verification fields survive legacy storage conversion",()=>{
  const {memory,merger}=mergerWithMemory();
  assert.equal(merger([{...lemma,id:"x",tense:"présent",person:"je"}]),1);
  assert.equal(memory[0].verbId,"manger");
  assert.equal(memory[0].verification,"reference-verified");
  assert.equal(memory[0].translationVerification,"ai-generated-unverified");
});

test("identical word in two different books remains separate",()=>{
  const {memory,merger}=mergerWithMemory();
  assert.equal(merger([
    {...lemma,id:"a",tense:"présent",person:"je",bookId:"book-a"},
    {...lemma,id:"b",tense:"présent",person:"je",bookId:"book-b"}
  ]),2);
  assert.equal(memory.length,2);
});


test("French subjunctive surface includes correct que contractions",()=>{
  const begin=extension.indexOf("  function frenchSurface(");
  const end=extension.indexOf("  function allFrenchTrainingCards(",begin);
  assert.ok(begin>=0&&end>begin);
  const surface=new Function(extension.slice(begin,end)+
    "\nreturn frenchSurface;")();
  assert.equal(surface("subjonctif présent",0,"aille"),"que j'aille");
  assert.equal(surface("subjonctif présent",2,"aille"),"qu'il/elle/on aille");
  assert.equal(surface("imparfait",0,"allais"),"j'allais");
  assert.equal(surface("présent",3,"mangeons"),"nous mangeons");
});

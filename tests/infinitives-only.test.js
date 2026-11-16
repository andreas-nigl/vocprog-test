"use strict";
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../vocprog-enhancements.js'),'utf8');
test('Disabled conjugation mode asks one infinitive per selected verb in either direction without reading generated forms',async()=>{
 const fragment=source.slice(source.indexOf('  const oldStartTraining='),source.indexOf('  const oldFilterVocab='));
 for(const reverse of [false,true]){
 const state={cards:null};
 const elements={startTrainingBtn:{disabled:false},tenseSelect:{value:'infinitiv'},direction:{value:reverse?'foreign_to_de':'de_to_foreign'},randomize:{checked:false}};
 const start=new Function('state','elements',`
 let trainingItems=[],startTraining=()=>{};
 const get=id=>elements[id],isVerbBook=()=>true,updateVerbReadiness=()=>{},normalizeTense=x=>x,activeBook=()=>({lang:'fr-FR'});
 const selectedVerbRange=()=>[{id:'a',foreign:'avoir',german:'haben',verbId:'avoir'},{id:'b',foreign:'être',german:'sein',verbId:'être'}];
 const verbDatabase={get(){throw Error('Infinitive mode must not require prepared conjugations');}};
 const enterTraining=()=>{state.cards=trainingItems;};
 ${fragment}
 return startTraining;`)(state,elements);
 await start();assert.equal(state.cards.length,2);
 assert.deepEqual(state.cards.map(c=>c.target),reverse?['haben','sein']:['avoir','être']);
 assert.equal(state.cards[0].kind,'verbs');
 }
});
test('Infinitives are the first catalog option and the redundant checkbox is removed',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 assert.doesNotMatch(html,/id="practiceConjugations"/);
 assert.match(source,/catalog.unshift\(\["infinitiv","Infinitive \(Grundformen\)"\]\)/);
 assert.match(source,/tense!=="impératif"&&tense!=="infinitiv"/);
});

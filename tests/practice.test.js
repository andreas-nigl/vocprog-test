"use strict";
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const api=require('../vocprog-practice.js');
test('Errors append in occurrence order, repeat errors append again, completion requires the full queue',()=>{
 const s=api.create([{target:'A'},{target:'B'},{target:'C'}]);
 s.grade(0,false,'x');s.grade(1,false,'x');s.grade(2,true,'C');
 assert.deepEqual(s.items.map(x=>x.target),['A','B','C','A','B']);assert.equal(s.complete(),false);
 s.grade(3,true,'A');s.grade(4,false,'x');assert.equal(s.items[5].target,'B');
 s.grade(5,true,'B');assert.equal(s.complete(),true);
 assert.deepEqual(s.statistics(),{initialCount:3,asked:6,correct:3,spoken:0,percent:50});
 assert.equal(s.grade(4,true,'B'),false);assert.equal(s.statistics().asked,6);
});
const source=fs.readFileSync(path.join(__dirname,'../vocprog-enhancements.js'),'utf8');
function harness(kind='words'){
 const state={history:[],exits:0},elements=new Map();
 const get=key=>{if(!elements.has(key))elements.set(key,{textContent:'',value:'',className:'',style:{},classList:{add(){},remove(){}},focus(){},showModal(){this.open=true;}});return elements.get(key);};
 const fragment=source.slice(source.indexOf('  function logEvent('),source.indexOf('  // Original nextCard and prevCard'));
 const run=new Function('state','get','api','kind',`
 const window={VOCPractice:api,matchMedia:()=>({matches:false})},document={body:{classList:{add(){},remove(){}}}};
 const history=state.history,save=()=>{},scheduleSync=()=>{},id=()=>String(history.length),STORE='test',chosenBook='book';
 const cleanSpokenText=x=>String(x),cancelSentenceGeneration=()=>{},updateVerbReadiness=()=>{};
 let analyzedThisCard=false,lastShownEvent=null,currentIndex=0;
 const trainingItems=[{kind,target:'A',bookId:'book'},{kind,target:'B',bookId:'book'}];
 let showCard=()=>{},nextCard=()=>{if(currentIndex<trainingItems.length-1){currentIndex++;showCard();}},exitTrainer=()=>state.exits++;
 ${fragment}
 showCard();
 return {answer:value=>{get('answerInput').value=value;window.gradeCurrentAnswer();},next:()=>nextCard(),
 back:()=>{if(currentIndex){currentIndex--;showCard();}},spoken:()=>logEvent('spoken',trainingItems[currentIndex]),exit:()=>exitTrainer(),index:()=>currentIndex};`);
 return {...run(state,get,api,kind),get,state};
}
test('Actual grading/navigation/result flow counts retries, correct attempts and per-click audio',()=>{
 const h=harness();h.spoken();h.answer('wrong');h.next();h.answer('B');h.next();h.spoken();h.answer('A');
 assert.equal(h.get('practiceResultDialog').open,true);
 assert.equal(h.get('practiceResultTitle').textContent,'Vokabeln');
 assert.equal(h.get('practiceResultPercent').textContent,'66,7 %');
 assert.equal(h.get('practiceResultAskedValue').textContent,'3');
 assert.equal(h.get('practiceResultCorrectValue').textContent,'66,7 %');
 assert.equal(h.get('practiceResultSpokenValue').textContent,'2');
 assert.equal(h.state.exits,1);
});
test('Back navigation cannot regrade or enqueue an already answered attempt; blank next cannot skip',()=>{
 const h=harness();h.next();assert.equal(h.index(),0);
 h.answer('wrong');h.next();h.back();h.answer('A');h.next();
 assert.equal(h.state.history.filter(e=>e.action==='graded').length,1);
 h.answer('B');h.next();h.answer('A');
 assert.equal(h.get('practiceResultAskedValue').textContent,'3');
});
test('Manual exit does not show success and completion titles follow the current practice mode',()=>{
 const stopped=harness();stopped.exit();assert.notEqual(stopped.get('practiceResultDialog').open,true);
 for(const [kind,title] of [['verbs','Verben'],['sentences','Einfache Sätze'],['special','KI-Spezialsätze']]){
 const h=harness(kind);h.answer('A');h.next();h.answer('B');
 assert.equal(h.get('practiceResultTitle').textContent,title);assert.equal(h.get('practiceResultPercent').textContent,'100 %');
 }
 assert.equal(api.create([]).complete(),false);
});

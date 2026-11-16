"use strict";
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const api=require('../vocprog-page-selection.js');
test('Pages accept ascending ranges, commas, typographic dashes, whitespace and deduplicate',()=>{
 assert.deepEqual(api.parse('154–156, 178, 190-193').pages,[154,155,156,178,190,191,192,193]);
 assert.deepEqual(api.parse(' 2 - 4, 2, 10 ').pages,[2,3,4,10]);
});
test('Reject incomplete, reversed, negative, malformed and oversized ranges without partial results',()=>{
 for(const text of ['', '154-', '154,', '154,,156','156-154','0','-3','1.5','S154','154-156x','1-99999']){
 const result=api.parse(text);assert.equal(result.valid,false,text);assert.deepEqual(result.pages,[]);
 }
});
test('Actual field handler preserves last valid selection on errors and never cancels generation for sync initialization',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../vocprog-enhancements.js'),'utf8');
 const fragment=source.slice(source.indexOf('  const learningPageSelections='),source.indexOf('  const oldLoad='));
 const state={filters:0,cancellations:0,ready:0};
 const input={value:'154-156',attributes:{},setCustomValidity(error){this.error=error;},setAttribute(k,v){this.attributes[k]=v;}};
 const error={};const window={VOCPageSelection:api};
 new Function('window','state','input','error',`
 let parsePageRanges,filteredVocabList=[{id:'v'}];const chosenBook='book';
 const get=id=>id==='pageRangeInput'?input:error;
 const cancelSentenceGeneration=()=>state.cancellations++,updateVerbReadiness=()=>state.ready++;
 const filterVocabByPages=()=>state.filters++,formatPageRanges=pages=>pages.join(', ');
 ${fragment}`)(window,state,input,error);
 window.applyLearningPages(false,true);assert.equal(state.cancellations,0);assert.equal(state.filters,1);
 input.value='154-';window.applyLearningPages();assert.equal(state.filters,1);assert.equal(input.attributes['aria-invalid'],'true');assert.equal(error.hidden,false);
 input.value='154-155, 178';window.applyLearningPages(true);assert.equal(state.filters,2);assert.equal(input.attributes['aria-invalid'],'false');assert.equal(error.hidden,true);
});

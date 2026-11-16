"use strict";
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const api=require('../vocprog-verb-presentation.js');
const verb={imperative:['rends','rendons','rendez'],imperativeGerman:'(du) gib zurück / (wir) geben wir zurück / (ihr) gebt zurück / (Sie) geben Sie zurück'};
test('Imperative labels remain only when the German pronoun is not spoken',()=>{
 assert.equal(api.germanImperative(verb.imperativeGerman),'(du) gib zurück / geben wir zurück / (ihr) gebt zurück / geben Sie zurück');
 const cards=api.imperativeCards(verb);assert.equal(cards.length,3);
 assert.deepEqual(cards.map(c=>c.foreign),['(tu) rends','(nous) rendons','(vous) rendez']);
 assert.deepEqual(cards[2].acceptedGerman,['gebt zurück','geben Sie zurück']);
});
test('Existing cached imperative text and unlabeled ordered translations need no regeneration',()=>{
 const cards=api.imperativeCards({...verb,imperative:'(tu) rends / (nous) rendons / (vous) rendez',imperativeGerman:'gib zurück / geben wir zurück / gebt zurück'});
 assert.equal(cards.length,3);assert.equal(cards[0].german,'(du) gib zurück');assert.equal(cards[1].german,'geben wir zurück');
});
test('Vocabulary order is page then numeric printed reference, never import order or lexical V10 before V2',()=>{
 const data=[{page:156,refVocab:'S156 V1'},{page:154,refVocab:'S154 V10'},{page:154,refVocab:'S154 V2'},{page:154,refVocab:'S154 V1'}];
 assert.deepEqual([...data].sort(api.compareVocabulary).map(v=>v.refVocab),['S154 V1','S154 V2','S154 V10','S156 V1']);
 assert.equal(data[0].page,156);
});
test('Speech omits bracketed form hints but retains spoken German pronouns',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../vocprog-enhancements.js'),'utf8');
 const fragment=source.slice(source.indexOf('  window.cleanSpokenText='),source.indexOf('  function speakingVariants('));
 const window={};new Function('window',fragment)(window);
 assert.equal(window.cleanSpokenText('(tu) rends / (nous) rendons / (vous) rendez'),'rends / rendons / rendez');
 assert.equal(window.cleanSpokenText(api.germanImperative(verb.imperativeGerman)),'gib zurück / geben wir zurück / gebt zurück / geben Sie zurück');
});

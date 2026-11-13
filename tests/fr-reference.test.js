"use strict";
const assert=require("node:assert/strict");
const test=require("node:test");
require("../vocprog-fr-reference.js");
const reference=globalThis.VOCFrenchReference;
const examples=[
  ["manger","présent",["mange","manges","mange","mangeons","mangez","mangent"]],
  ["manger","imparfait",["mangeais","mangeais","mangeait","mangions","mangiez","mangeaient"]],
  ["manger","subjonctif présent",["mange","manges","mange","mangions","mangiez","mangent"]],
  ["commencer","présent",["commence","commences","commence","commençons","commencez","commencent"]],
  ["commencer","imparfait",["commençais","commençais","commençait","commencions","commenciez","commençaient"]],
  ["aller","présent",["vais","vas","va","allons","allez","vont"]],
  ["aller","subjonctif présent",["aille","ailles","aille","allions","alliez","aillent"]]
];
for(const [lemma,tense,forms] of examples){
  test(lemma+" "+tense,()=>assert.deepEqual(reference.conjugate(lemma).forms[tense],forms));
}
test("seven school tenses per supported verb",()=>{
  for(const word of reference.supported){
    const verb=reference.conjugate(word);
    assert.equal(verb.availableTenses.length,7);
    for(const tense of verb.availableTenses)assert.equal(verb.forms[tense].length,6);
  }
});
test("manger uses avoir and never être agreement on a standalone participle",()=>{
  const verb=reference.conjugate("manger");
  assert.equal(verb.auxiliary,"avoir");
  assert.equal(verb.pastParticiple,"mangé");
  assert.equal(verb.agreement,null);
  assert.equal(verb.forms["passé composé"][0],"ai mangé");
});
test("aller uses être and compact four-form participle notation",()=>{
  const verb=reference.conjugate("aller");
  assert.equal(verb.auxiliary,"être");
  assert.equal(verb.agreement,"allé(e)(s)");
  assert.equal(verb.forms["plus-que-parfait"][0],"étais allé");
});
test("unverified verbs must not generate paradigms",()=>{
  assert.equal(reference.conjugate("être"),null);
  assert.equal(reference.conjugate("finir"),null);
});
test("correct printed form is independently verified",()=>{
  assert.equal(reference.checkForm("manger","présent",3,"nous mangeons").status,"verified");
});
test("incorrect printed form is detected",()=>{
  const check=reference.checkForm("manger","présent",3,"nous mangons");
  assert.equal(check.status,"mismatch");
  assert.equal(check.expected,"mangeons");
});
test("unknown verb or tense is not treated as verified",()=>{
  assert.equal(reference.checkForm("faire","présent",0,"je fais").status,"not-verified");
  assert.equal(reference.checkForm("manger","passé simple",0,"je mangeai").status,"not-verified");
});

test("venir shows the three imperative forms and compact être agreement",()=>{
  const v=reference.conjugate("venir");
  assert.equal(v.infinitive,"venir");
  assert.equal(v.agreement,"venu(e)(s)");
  assert.deepEqual(v.imperative,["viens","venons","venez"]);
  assert.deepEqual(v.forms["présent"],["viens","viens","vient","venons","venez","viennent"]);
  assert.deepEqual(v.forms["futur simple"],["viendrai","viendras","viendra","viendrons","viendrez","viendront"]);
  assert.equal(v.forms["passé composé"][3],"sommes venu(e)s");
  assert.equal(reference.checkForm("venir","passé composé",3,"nous sommes venues").status,"not-verified");
  assert.equal(reference.checkForm("venir","présent",3,"nous venons").status,"verified");
});

"use strict";
const assert=require("node:assert/strict");
const test=require("node:test");
require("../vocprog-wasm-adapter.js");
const adapter=globalThis.VOCWasmAdapter;
const six=["a","b","c","d","e","f"];

test("French maps the full seven school tenses",()=>{
  const table={infinitive:"aller",pastParticiple:"allé",auxiliary:"être",
    present:six,imperfect:six,passeCompose:six,plusQueParfait:six,
    future:six,conditional:six,subjunctivePresent:six};
  const result=adapter.adapt(table,"fr-FR");
  assert.equal(result.available.length,7);
  assert.deepEqual(result.missing,[]);
  assert.equal(result.auxiliary,"être");
});

test("English adds four analytical school constructions without Gemini",()=>{
  const table={infinitive:"go",past:"went",pastParticiple:"gone",
    presentParticiple:"going",presentRow:six,pastRow:six,
    presentPerfectRow:six,pastPerfectRow:six,futureRow:six};
  const result=adapter.adapt(table,"en-US");
  assert.equal(result.available.length,9);
  assert.deepEqual(result.principalParts,["go","went","gone"]);
  assert.deepEqual(result.missing,[]);
  assert.equal(result.forms["present progressive"][0],"am going");
  assert.equal(result.forms["past progressive"][1],"were going");
  assert.equal(result.forms["going to future"][2],"is going to go");
  assert.equal(result.forms["conditional"][4],"would go");
  assert.equal(result.translationsVerified,false);
});

test("Spanish maps eight school tenses",()=>{
  const table={infinitive:"hablar",pastParticiple:"hablado",gerund:"hablando",
    present:six,imperfect:six,preterite:six,perfectoCompuesto:six,
    pluscuamperfecto:six,future:six,conditional:six,
    subjunctivePresent:six};
  const result=adapter.adapt(table,"es-ES");
  assert.equal(result.available.length,8);
  assert.deepEqual(result.missing,[]);
  assert.equal(result.presentParticiple,"hablando");
});

test("Portuguese maps seven school tenses",()=>{
  const table={infinitive:"falar",pastParticiple:"falado",gerund:"falando",
    present:six,imperfect:six,preterite:six,
    maisQuePerfeitoComposto:six,future:six,conditional:six,
    subjunctivePresent:six};
  const result=adapter.adapt(table,"pt-PT");
  assert.equal(result.available.length,7);
  assert.deepEqual(result.missing,[]);
});

test("Dutch keeps past singular/plural and reports all missing tenses",()=>{
  const table={infinitive:"lopen",past:["liep","liepen"],
    pastParticiple:"gelopen",present:six,imperative:"loop"};
  const result=adapter.adapt(table,"nl-NL");
  assert.equal(result.available.length,3);
  assert.equal(result.missing.length,2);
  assert.deepEqual(result.forms["onvoltooid toekomende tijd"],
    ["zal lopen","zult lopen","zal lopen","zullen lopen","zullen lopen","zullen lopen"]);
  assert.deepEqual(result.forms["onvoltooid verleden tijd"],
    ["liep","liep","liep","liepen","liepen","liepen"]);
  assert.deepEqual(result.principalParts,["lopen","liep","gelopen"]);
});

test("Unsupported Latin cannot be mistaken for a supported language",()=>{
  assert.throws(()=>adapter.adapt({infinitive:"amare"},"la-LA"),
    /Unsupported conjugation language/);
});

test("Missing or incomplete 6-slot forms remain explicitly unavailable",()=>{
  const result=adapter.adapt({infinitive:"manger",present:["mange"]},"fr-FR");
  assert.deepEqual(result.available,[]);
  assert.equal(result.missing.length,7);
});

test("The wrapper passes immutable locale codes to the WASM boundary",()=>{
  let args=null;
  const wrapper=adapter.create((lemma,lang)=>{
    args=[lemma,lang];
    return {infinitive:lemma,present:six};
  });
  const result=wrapper.conjugate(" manger ","fr-FR");
  assert.deepEqual(args,["manger","fra"]);
  assert.equal(result.infinitive,"manger");
});


test("Dutch perfects remain blocked without reviewed sense-specific auxiliary",()=>{
  const table={infinitive:"lopen",present:six,past:["liep","liepen"],
    pastParticiple:"gelopen"};
  const noEvidence=adapter.adapt(table,"nl-NL");
  const unsupported=adapter.adapt(table,"nl-NL",{
    dutchAuxiliaryEvidence:{auxiliary:"zijn",context:"destination",reviewed:false,source:"manual"}
  });
  assert.equal(noEvidence.missing.length,2);
  assert.equal(unsupported.missing.length,2);
  assert.equal(noEvidence.auxiliary,null);
});

test("Dutch perfects use verified hebben for a specified sense",()=>{
  const table={infinitive:"werken",present:six,past:["werkte","werkten"],
    pastParticiple:"gewerkt"};
  const evidence={auxiliary:"hebben",reviewed:true,
    source:"reviewed dictionary",context:"ordinary activity"};
  const result=adapter.adapt(table,"nl-NL",{dutchAuxiliaryEvidence:evidence});
  assert.deepEqual(result.missing,[]);
  assert.equal(result.forms["voltooid tegenwoordige tijd"][0],"heb gewerkt");
  assert.equal(result.forms["voltooid tegenwoordige tijd"][2],"heeft gewerkt");
  assert.equal(result.forms["voltooid verleden tijd"][3],"hadden gewerkt");
  assert.equal(result.auxiliary,"hebben");
});

test("Dutch perfects use verified zijn for a movement-to-destination sense",()=>{
  const table={infinitive:"lopen",present:six,past:["liep","liepen"],
    pastParticiple:"gelopen"};
  const result=adapter.adapt(table,"nl-NL",{dutchAuxiliaryEvidence:{
    auxiliary:"zijn",reviewed:true,source:"reviewed lexicon",context:"movement to destination"
  }});
  assert.equal(result.forms["voltooid tegenwoordige tijd"][0],"ben gelopen");
  assert.equal(result.forms["voltooid verleden tijd"][3],"waren gelopen");
  assert.deepEqual(result.missing,[]);
});

test("Dutch perfects reject empty sources and arbitrary auxiliary values",()=>{
  const table={infinitive:"lopen",present:six,past:["liep","liepen"],
    pastParticiple:"gelopen"};
  for(const auxiliary of ["beide","heeft",""]){
    const result=adapter.adapt(table,"nl-NL",{dutchAuxiliaryEvidence:{
      auxiliary,reviewed:true,source:"review",context:"movement"
    }});
    assert.equal(result.missing.length,2);
  }
  assert.equal(adapter.adapt(table,"nl-NL",{dutchAuxiliaryEvidence:{
    auxiliary:"zijn",reviewed:true,source:"",context:"movement"
  }}).missing.length,2);
});

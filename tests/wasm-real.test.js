"use strict";
const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
require("../vocprog-wasm-adapter.js");
require("../vocprog-verb-database.js");
const root = path.join(__dirname, "..");
const loaded = (async () => {
  const source = fs.readFileSync(path.join(root, "vendor/ablaut/ablaut.js"), "utf8");
  const module = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
  await module.default({module_or_path: fs.readFileSync(path.join(root, "vendor/ablaut/ablaut_bg.wasm"))});
  return globalThis.VOCWasmAdapter.create(module.conjugate);
})();
for (const [word, language, count, tense, expected] of [
  ["venir", "fr-FR", 7, "subjonctif présent", "venions"],
  ["go", "en-US", 9, "simple past", "went"],
  ["hablar", "es-ES", 8, "pretérito perfecto compuesto", "hemos hablado"],
  ["falar", "pt-PT", 7, "mais-que-perfeito composto", "tínhamos falado"],
  ["lopen", "nl-NL", 3, "onvoltooid verleden tijd", "liepen"]
]) {
  test("Real browser WASM package: " + word, async () => {
    const engine = await loaded;
    const result = engine.conjugate(word, language);
    assert.equal(result.available.length, count);
    assert.ok(result.forms[tense].includes(expected));
    assert.ok(result.participle);
  });
}
test("Real table UI fills missing persons and keeps stored German", async () => {
  const engine = await loaded;
  const source = fs.readFileSync(path.join(root, "vocprog-enhancements.js"), "utf8");
  const fragment = source.slice(source.indexOf("  window.toggleVerbTable="), source.indexOf("  function validMerge"));
  class Element {
    constructor() { this.children = []; this.textContent = ""; this.hidden = true; }
    append(...nodes) { this.children.push(...nodes); }
    replaceChildren(...nodes) { this.children = nodes; }
    setAttribute() {}
  }
  const panel = new Element();
  const document = {createElement: () => new Element(), createTextNode: text => ({textContent: text})};
  const entries = [
    {bookId:"fr",kind:"verb-infinitive",verbId:"finir",foreign:"finir",german:"beenden"},
    {bookId:"fr",kind:"verb-form",verbId:"finir",tense:"présent",person:"je",foreign:"je finis",german:"ich beende"}
  ];
  const window = {VOCMorphology:{ready:Promise.resolve(),conjugate:(w,l)=>engine.conjugate(w,l),state:{status:"ready"}}};
  const verbDatabase=globalThis.VOCVerbDatabase.create({getItem:()=>null,setItem:()=>{}},(w,l)=>engine.conjugate(w,l));
  verbDatabase.prepare({id:"fr",lang:"fr-FR"},entries,[],["présent"]);
  const run = new Function("verbDatabase","window","document","get","trainingItems","currentIndex","allVocab","specials","activeBook","LANGS","TENSES","normalizeTense","frenchSurface",fragment);
  run(verbDatabase,window,document,id=>id==="verbTablePanel"?panel:new Element(),
    [{kind:"verbs",verbId:"finir",verbLemma:"finir",bookId:"fr",verbTense:"présent"}],0,
    ()=>entries,[],()=>({lang:"fr-FR"}),{"fr-FR":"Französisch"},{"fr-FR":[["présent","Présent"]]},x=>x,(t,i,f)=>["je","tu","il/elle/on","nous","vous","ils/elles"][i]+" "+f);
  await window.toggleVerbTable();
  const text = node => [node.textContent,...(node.children||[]).map(text)].join(" ");
  assert.equal(panel.hidden,false);
  assert.match(text(panel),/nous finissons/);
  assert.match(text(panel),/ich beende/);
  assert.match(text(panel),/finissant|fini/);
  assert.equal(entries.length,2,"display must not persist generated cards");
  await window.toggleVerbTable();
  assert.equal(panel.hidden,true);
});

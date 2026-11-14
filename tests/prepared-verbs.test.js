"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
require("../vocprog-wasm-adapter.js");
require("../vocprog-fr-reference.js");
require("../vocprog-verb-database.js");
const root = path.join(__dirname, "..");
const tenses = [...VOCFrenchReference.tenses];
const book = {id: "fr", lang: "fr-FR", kind: "verbs"};
const entries = [
  {id: "r", bookId: "fr", kind: "verb-infinitive", infinitive: "rendre", foreign: "rendre", german: "zurückgeben", page: "155"},
  {id: "e", bookId: "fr", kind: "verb-infinitive", infinitive: "être", foreign: "être", german: "sein", page: "154"},
  {id: "c", bookId: "fr", kind: "verb-infinitive", infinitive: "commencer", foreign: "commencer", german: "beginnen", page: "154"},
  {id: "scan", bookId: "fr", kind: "conjugation", infinitive: "rendre", person: "je", tense: "présent", foreign: "je rends", german: "ich gebe zurück", page: "190"}
];
const loaded = (async () => {
  const source = fs.readFileSync(path.join(root, "vendor/ablaut/ablaut.js"), "utf8");
  const module = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
  await module.default({module_or_path: fs.readFileSync(path.join(root, "vendor/ablaut/ablaut_bg.wasm"))});
  return VOCWasmAdapter.create(module.conjugate);
})();
function storage() {
  let text = null;
  return {getItem: () => text, setItem: (_, value) => {text = value;}};
}
test("All seven tenses and six persons are persisted before exercise/table reads", async () => {
  const engine = await loaded, disk = storage();
  const db = VOCVerbDatabase.create(disk, (w, l) => engine.conjugate(w, l));
  const original = JSON.stringify(entries);
  const snapshot = await db.prepare(book, entries, [], tenses);
  assert.equal(Object.keys(snapshot.verbs).length, 3);
  for (const verb of Object.values(snapshot.verbs)) {
    assert.deepEqual(verb.missing, []);
    for (const tense of tenses) assert.equal(verb.cards[tense].length, 6);
  }
  assert.ok(disk.getItem().includes("nous rendons"));
  assert.equal(db.get("fr"), snapshot);
  assert.equal(JSON.stringify(entries), original);
  assert.equal(snapshot.verbs.rendre.cards.présent[0].german, "ich gebe zurück");
  assert.equal(snapshot.verbs.rendre.cards.présent[1].grammaticalPrompt, "zurückgeben · présent · tu");
});
test("Reload reads the database without any motor call; source changes invalidate it", async () => {
  const engine = await loaded, disk = storage();
  const first = VOCVerbDatabase.create(disk, (w, l) => engine.conjugate(w, l));
  const snapshot = await first.prepare(book, entries, [], tenses);
  let calls = 0;
  const next = VOCVerbDatabase.create(disk, (w, l) => {calls++; return engine.conjugate(w, l);});
  assert.equal(JSON.stringify(await next.prepare(book, entries, [], tenses)), JSON.stringify(snapshot));
  assert.equal(calls, 0);
  const changed = entries.map(entry => entry.id === "r" ? {...entry, german: "wiedergeben"} : entry);
  assert.match((await next.prepare(book, changed, [], tenses)).verbs.rendre.cards.imparfait[0].grammaticalPrompt, /^wiedergeben/);
  assert.equal(calls, 1);
});
test("A storage error cannot publish a ready in-memory database", async () => {
  const engine = await loaded;
  const db = VOCVerbDatabase.create({getItem: () => null, setItem: () => {throw Error("quota");}},
    (w, l) => engine.conjugate(w, l));
  await assert.rejects(() => db.prepare(book, entries, [], tenses), /quota/);
  assert.equal(db.get("fr"), null);
});
test("Unavailable forms remain missing and can recover after the motor becomes available", async () => {
  const engine = await loaded;
  let available = false;
  const db = VOCVerbDatabase.create(storage(), (w, l) => available ? engine.conjugate(w, l) : null);
  assert.equal((await db.prepare(book, entries, [], tenses)).verbs.rendre.missing.length, 7);
  available = true;
  db.retryPending(book.id);
  assert.deepEqual((await db.prepare(book, entries, [], tenses)).verbs.rendre.missing, []);
});
test("French accepted answers resolve grouped subjects and agreement without accepting wrong gender", async () => {
  const engine = await loaded;
  const db = VOCVerbDatabase.create(storage(), (w, l) => engine.conjugate(w, l));
  const snapshot = await db.prepare(book, [{...entries[0], infinitive: "aller", foreign: "aller"}], [], tenses);
  const cards = snapshot.verbs.aller.cards["passé composé"];
  assert.ok(cards[0].acceptedForeign.includes("je suis allée"));
  assert.ok(cards[2].acceptedForeign.includes("elle est allée"));
  assert.ok(!cards[2].acceptedForeign.includes("il est allée"));
  assert.ok(cards[3].acceptedForeign.includes("nous sommes allés"));
  assert.ok(cards[3].acceptedForeign.includes("nous sommes allées"));
  assert.ok(cards[4].acceptedForeign.includes("vous êtes allé"));
  assert.ok(cards[4].acceptedForeign.includes("vous êtes allées"));
  assert.ok(snapshot.verbs.aller.cards["subjonctif présent"][2].acceptedForeign.includes("qu'elle aille"));
});
test("Infinitive selection is separate from six-card expansion and blocks incomplete ranges", () => {
  const source = fs.readFileSync(path.join(root, "vocprog-enhancements.js"), "utf8");
  const ready = source.slice(source.indexOf("  function updateVerbReadiness"), source.indexOf("  function scheduleVerbPreparation"));
  const elements = {startTrainingBtn: {}, verbPreparationStatus: {}, tenseSelect: {value: "présent"},
    rangeCard: {classList: {toggle() {}}}, trainerCard: {classList: {contains: () => true}}};
  const state = {pending: true, error: "", cards: null};
  const run = new Function("state", "elements", ready + `
    const get=id=>elements[id], isVerbBook=()=>true, chosenBook="fr";
    const normalizeTense=x=>x, selectedVerbRange=()=>[{verbId:"rendre",foreign:"rendre"}];
    const filteredVocabList=selectedVerbRange();
    const verbDatabase={get:()=>({verbs:{rendre:{cards:{présent:state.cards}}}})};
    const preparingVerbData=state.pending, analyzingVerbInput=false, preparationError=state.error;
    updateVerbReadiness();`);
  run(state, elements); assert.equal(elements.startTrainingBtn.disabled, true);
  state.pending = false; run(state, elements); assert.equal(elements.startTrainingBtn.disabled, true);
  state.cards = Array(6).fill({foreign: "test"}); run(state, elements);
  assert.equal(elements.startTrainingBtn.disabled, false);
  state.error = "quota"; run(state, elements); assert.equal(elements.startTrainingBtn.disabled, true);
  const start = source.slice(source.indexOf("  const oldStartTraining="), source.indexOf("  const oldFilterVocab="));
  assert.match(start, /snapshot\.verbs\[base.verbId\]\.cards\[tense\]\.map/);
  assert.doesNotMatch(start, /\.conjugate\(/);
});

/* Local morphology service. No record writes, translations or network APIs. */
(function (root) {
  "use strict";
  let engine = null;
  const cache = new Map();
  const state = {status: "loading", error: ""};
  let timer;
  const load = import("./vendor/ablaut/ablaut.js").then(async module => {
    await module.default();
    engine = root.VOCWasmAdapter.create(module.conjugate);
    state.status = "ready";
  });
  const ready = Promise.race([
    load,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(Error("Konjugationsmotor: Ladezeit überschritten")), 8000);
    })
  ]).catch(error => {
    state.status = "fallback";
    state.error = String(error.message || error);
  }).finally(() => clearTimeout(timer));
  function conjugate(lemma, language) {
    const word = String(lemma || "").trim().normalize("NFC").toLocaleLowerCase();
    if (!engine || !word || word.length > 100) return null;
    const key = language + ":" + word;
    if (cache.has(key)) return cache.get(key);
    let result = null;
    try { result = engine.conjugate(word, language); } catch (_) { /* Unknown lemma. */ }
    if (cache.size >= 512) cache.delete(cache.keys().next().value);
    cache.set(key, result);
    return result;
  }
  root.VOCMorphology = Object.freeze({ready, state, conjugate});
})(window);

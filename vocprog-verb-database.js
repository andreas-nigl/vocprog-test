/* Derived, local-only conjugation database. Original vocabulary is never changed. */
(function (root) {
  "use strict";
  const VERSION = "ablaut-0.11.0-bilingual-v2";
  const KEY = "vocprog_v2_verb_records_v2";
  const normal = value => String(value || "").trim().normalize("NFC").toLocaleLowerCase();
  const lemmaOf = entry => normal(entry.infinitive || entry.lemma || entry.verbId ||
    (entry.kind === "verb-infinitive" ? entry.foreign : ""));
  const six = row => Array.isArray(row) && row.length === 6 &&
    row.every(value => typeof value === "string" && value.trim());

  function signature(book, entries, paradigms, tenses) {
    return JSON.stringify([VERSION, book.id, book.lang, tenses,
      entries.map(entry => [entry.id, entry.kind, lemmaOf(entry), entry.page,
        entry.foreign, entry.german, entry.person, entry.tense, entry.verification]),
      paradigms.map(entry => [entry.lemma, entry.forms, entry.persons,
        entry.pastParticiple, entry.agreement, entry.imperative])]);
  }

  function frenchSurface(tense, person, form) {
    const subjunctive = tense === "subjonctif présent";
    const vowel = /^[aeiouéèêëàâîïôûùüœh]/i.test(form);
    const subject = person === "je" && vowel ? "j'" : person + " ";
    return (subjunctive ? (/^(il|elle|on)(\/|$)/.test(person) ? "qu'" : "que ") : "") +
      subject + form;
  }

  function agreementVariants(form, personIndex, auxiliary, tense) {
    if (auxiliary !== "être" || !["passé composé", "plus-que-parfait"].includes(tense))
      return [form];
    // The infinitive alone does not determine gender or polite/plural vous.
    const words = form.replace(/\(e\)|\(s\)/g, "").split(" ");
    const participle = words.pop().replace(/s$/, "");
    const auxiliaryForm = words.join(" ") + " ";
    const endings = personIndex === 3 || personIndex === 5 ? ["s", "es"] :
      personIndex === 4 ? ["", "e", "s", "es"] : ["", "e"];
    return endings.map(ending => auxiliaryForm + participle + ending);
  }

  function acceptedFrench(tense, index, form, auxiliary) {
    const persons = [["je"], ["tu"], ["il", "elle", "on"], ["nous"], ["vous"], ["ils", "elles"]][index];
    const variants = agreementVariants(form, index, auxiliary, tense);
    return [...new Set(persons.flatMap(person => {
      const choices = variants.length > 1 && ["il", "ils"].includes(person) ? [variants[0]] :
        variants.length > 1 && ["elle", "elles"].includes(person) ? [variants[1]] : variants;
      return choices.map(variant => frenchSurface(tense, person, variant));
    }))];
  }

  function build(book, entries, paradigms, tenses, morphology, reference) {
    const verbs = Object.create(null);
    const lemmas = [...new Set(entries.map(lemmaOf).filter(Boolean))];
    for (const lemma of lemmas) {
      const source = entries.filter(entry => lemmaOf(entry) === lemma);
      const base = source.find(entry => entry.kind === "verb-infinitive");
      const stored = paradigms.find(entry => normal(entry.lemma) === lemma);
      const motor = morphology(lemma, book.lang);
      const curated = book.lang === "fr-FR" ? reference?.(lemma) : null;
      const persons = motor?.persons || curated?.persons || stored?.persons || [];
      const auxiliary = curated?.auxiliary || motor?.auxiliary;
      const forms = {}, cards = {};
      for (const tense of tenses) {
        const generated = curated?.forms?.[tense] || motor?.forms?.[tense] || stored?.forms?.[tense];
        if (!six(generated) || persons.length !== 6) continue;
        forms[tense] = [...generated];
        cards[tense] = generated.map((form, index) => {
          const foreign = book.lang === "fr-FR" ? frenchSurface(tense, persons[index], form) :
            persons[index] + " " + form;
          const acceptedForeign = book.lang === "fr-FR" ?
            [...new Set([foreign, ...acceptedFrench(tense, index, form, auxiliary)])] : [foreign];
          const saved = source.find(entry => ["conjugation", "verb-form"].includes(entry.kind) &&
            normal(entry.tense) === tense && normal(entry.person) === normal(persons[index]) &&
            entry.verification !== "scan-unverified" &&
            acceptedForeign.some(value => normal(value) === normal(entry.foreign)));
          const translation = String(saved?.german || "").trim();
          const germanBase = String(base?.german || "").trim();
          return {foreign, acceptedForeign, german: translation, person: persons[index], tense,
            grammaticalPrompt: (germanBase || lemma) + " · " + tense + " · " + persons[index],
            germanBase, sourceId: saved?.id || base?.id || source[0]?.id,
            verification: curated ? "curated-morphology" : "local-morphology-not-language-reviewed"};
        });
      }
      const value = kind => source.find(entry => entry.kind === kind);
      verbs[lemma] = {
        infinitive: lemma, german: String(base?.german || ""), persons, forms, cards, auxiliary,
        participle: value("verb-participle")?.foreign || curated?.agreement ||
          curated?.pastParticiple || motor?.participle || stored?.pastParticiple || "",
        participleGerman: value("verb-participle")?.german || "",
        imperative: value("verb-imperative")?.foreign || curated?.imperative ||
          motor?.imperative || stored?.imperative || "",
        imperativeGerman: value("verb-imperative")?.german || "",
        principalParts: motor?.principalParts || null,
        presentParticiple: motor?.presentParticiple || "",
        regularity: base?.regularity || curated?.regularity || stored?.regularity || "",
        missing: tenses.filter(tense => !cards[tense])
      };
    }
    return {version: VERSION, bookId: book.id, language: book.lang, verbs};
  }

  function create(storage, morphology, reference, enrich) {
    let records = Object.create(null);
    const snapshots = new Map();
    let queue = Promise.resolve();
    const normalKey = (language, lemma, german) => [language, lemma, normal(german)].join("|");
    function hydrate() {
      let incoming;
      try { incoming = JSON.parse(storage.getItem(KEY) || "{}"); } catch { return; }
      if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) return;
      for (const [key, value] of Object.entries(incoming)) {
        if (value?.version !== VERSION || typeof value.lemma !== "string" ||
            !value.verb || typeof value.verb.cards !== "object" ||
            key !== normalKey(value.language, value.lemma, value.german)) continue;
        if (!records[key] || (!records[key].ready && value.ready)) records[key] = value;
      }
    }
    hydrate();
    return Object.freeze({
      prepare(book, entries, paradigms, tenses) {
        const run = async () => {
        hydrate();
        const verbs = Object.create(null), next = {...records};
        let changed = false;
        for (const lemma of [...new Set(entries.map(lemmaOf).filter(Boolean))]) {
          const source = entries.filter(entry => lemmaOf(entry) === lemma);
          const base = source.find(entry => entry.kind === "verb-infinitive");
          const german = String(base?.german || "").trim();
          const key = normalKey(book.lang, lemma, german);
          let record = records[key];
          if (!record) {
            const result = build(book, source, paradigms, tenses, morphology, reference);
            let verb = result.verbs[lemma];
            if (enrich) verb = await enrich(verb, book.lang, morphology);
            verb.missing = tenses.filter(tense => (!Array.isArray(verb.cards[tense]) || verb.cards[tense].length !== 6) ||
              (enrich && verb.cards[tense].some(card => !card.german ||
                card.foreignVerification?.status !== "reference-matched" ||
                card.germanVerification?.status !== "reference-matched")));
            record = {version: VERSION, key, bookId: book.id, language: book.lang, lemma, german,
              verb, ready: verb.missing.length === 0, checkedAt: new Date().toISOString()};
            next[key] = record; changed = true;
          }
          verbs[lemma] = record.verb;
        }
        if (changed) {
          // Publish neither a ready snapshot nor new records before durable storage succeeds.
          storage.setItem(KEY, JSON.stringify(next));
          records = next;
        }
        const snapshot = {version: VERSION, bookId: book.id, language: book.lang, verbs};
        snapshots.set(book.id, snapshot);
        return snapshot;
        };
        const pending = queue.then(run, run);
        queue = pending.catch(() => {});
        return pending;
      },
      retryPending(bookId) {
        const next = Object.fromEntries(Object.entries(records).filter(([, value]) =>
          value.bookId !== bookId || value.ready));
        storage.setItem(KEY, JSON.stringify(next));
        records = next;
      },
      get(bookId) { return snapshots.get(bookId) || null; }
    });
  }
  root.VOCVerbDatabase = Object.freeze({create, lemmaOf, frenchSurface, acceptedFrench});
})(typeof window === "undefined" ? globalThis : window);

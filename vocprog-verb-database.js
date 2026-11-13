/* Derived, local-only conjugation database. Original vocabulary is never changed. */
(function (root) {
  "use strict";
  const VERSION = "ablaut-0.11.0-prepared-v1";
  const KEY = "vocprog_v2_prepared_verbs_v1";
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

  function create(storage, morphology, reference) {
    let persisted;
    try { persisted = JSON.parse(storage.getItem(KEY) || "{}"); } catch { persisted = {}; }
    if (!persisted || typeof persisted !== "object" || Array.isArray(persisted)) persisted = {};
    const snapshots = new Map();
    return Object.freeze({
      prepare(book, entries, paradigms, tenses) {
        const input = signature(book, entries, paradigms, tenses);
        const complete = snapshot => snapshot?.verbs &&
          Object.values(snapshot.verbs).every(verb => verb.missing?.length === 0);
        if (snapshots.get(book.id)?.signature === input && complete(snapshots.get(book.id)))
          return snapshots.get(book.id);
        const cached = persisted[book.id];
        let snapshot = cached?.signature === input && cached?.version === VERSION && complete(cached) ? cached : null;
        if (!snapshot) {
          snapshot = {...build(book, entries, paradigms, tenses, morphology, reference), signature: input};
          const next = {...persisted, [book.id]: snapshot};
          // Do not declare readiness if persistence fails (e.g. quota exceeded).
          storage.setItem(KEY, JSON.stringify(next));
          persisted = next;
        }
        snapshots.set(book.id, snapshot);
        return snapshot;
      },
      get(bookId) { return snapshots.get(bookId) || null; }
    });
  }
  root.VOCVerbDatabase = Object.freeze({create, lemmaOf, frenchSurface});
})(typeof window === "undefined" ? globalThis : window);

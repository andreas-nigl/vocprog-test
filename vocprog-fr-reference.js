/* VOC French school conjugation reference (development-only).
 * Restricted, auditable rules: parler, manger, commencer, aller.
 * Finite forms are generated locally, not by the scan model.
 * Sources: Académie française and Larousse verb tables (2026-11-12).
 * This module does NOT provide German translations or general lexical coverage.
 */
(function (root) {
  "use strict";

  const PERSONS = Object.freeze(["je", "tu", "il/elle/on", "nous", "vous", "ils/elles"]);
  const TENSES = Object.freeze([
    "présent", "imparfait", "passé composé", "plus-que-parfait",
    "futur simple", "conditionnel présent", "subjonctif présent"
  ]);
  const AVOIR_PRESENT = ["ai", "as", "a", "avons", "avez", "ont"];
  const AVOIR_IMPERFECT = ["avais", "avais", "avait", "avions", "aviez", "avaient"];
  const ETRE_PRESENT = ["suis", "es", "est", "sommes", "êtes", "sont"];
  const ETRE_IMPERFECT = ["étais", "étais", "était", "étions", "étiez", "étaient"];

  const IRREGULAR_ALLER = Object.freeze({
    "présent": ["vais", "vas", "va", "allons", "allez", "vont"],
    "imparfait": ["allais", "allais", "allait", "allions", "alliez", "allaient"],
    "futur simple": ["irai", "iras", "ira", "irons", "irez", "iront"],
    "conditionnel présent": ["irais", "irais", "irait", "irions", "iriez", "iraient"],
    "subjonctif présent": ["aille", "ailles", "aille", "allions", "alliez", "aillent"]
  });

  function end(stem, suffixes) {
    return suffixes.map(suffix => stem + suffix);
  }

  function regularEr(infinitive) {
    const stem = infinitive.slice(0, -2);
    const ger = infinitive.endsWith("ger");
    const cer = infinitive.endsWith("cer");
    const nStem = ger ? stem + "e" : cer ? stem.slice(0, -1) + "ç" : stem;
    const imperfect = ["ais", "ais", "ait", "ions", "iez", "aient"]
      .map((ending, i) => (i === 3 || i === 4 ? stem : nStem) + ending);
    const present = [
      stem + "e", stem + "es", stem + "e", nStem + "ons",
      stem + "ez", stem + "ent"
    ];
    const subjunctive = [
      stem + "e", stem + "es", stem + "e", stem + "ions",
      stem + "iez", stem + "ent"
    ];
    const pastParticiple = stem + "é";
    return {
      infinitive,
      regularity: "rég.",
      orthographicException: ger ? "ger" : cer ? "cer" : null,
      auxiliary: "avoir",
      pastParticiple,
      agreement: null,
      imperative: [present[1].slice(0, -1), present[3], present[4]],
      forms: {
        "présent": present,
        "imparfait": imperfect,
        "passé composé": AVOIR_PRESENT.map(aux => aux + " " + pastParticiple),
        "plus-que-parfait": AVOIR_IMPERFECT.map(aux => aux + " " + pastParticiple),
        "futur simple": end(infinitive, ["ai", "as", "a", "ons", "ez", "ont"]),
        "conditionnel présent": end(infinitive, ["ais", "ais", "ait", "ions", "iez", "aient"]),
        "subjonctif présent": subjunctive
      }
    };
  }

  function aller() {
    const pastParticiple = "allé";
    return {
      infinitive: "aller",
      regularity: "irrég.",
      orthographicException: null,
      auxiliary: "être",
      pastParticiple,
      agreement: "allé(e)(s)",
      imperative: ["va", "allons", "allez"],
      forms: {
        ...IRREGULAR_ALLER,
        "passé composé": ETRE_PRESENT.map(aux => aux + " " + pastParticiple),
        "plus-que-parfait": ETRE_IMPERFECT.map(aux => aux + " " + pastParticiple)
      }
    };
  }

  const KNOWN_REGULAR = new Set(["parler", "manger", "commencer"]);

  function conjugate(infinitive) {
    const word = String(infinitive || "").normalize("NFC").trim().toLocaleLowerCase("fr");
    const data = word === "aller" ? aller() :
      KNOWN_REGULAR.has(word) ? regularEr(word) : null;
    if (!data) return null;
    return {
      ...data,
      persons: [...PERSONS],
      availableTenses: [...TENSES],
      source: "voc-fr-verified-rules-v1",
      coverage: "four-verbs-only"
    };
  }

  // Compare bare forms and model-extracted forms containing a French subject.
  function normalizeForm(value) {
    return String(value || "").normalize("NFC").trim().toLocaleLowerCase("fr")
      .replace(/^que\s+/, "")
      .replace(/^(?:j['’]|je\s+|tu\s+|il\/elle\/on\s+|il\s+|elle\s+|on\s+|nous\s+|vous\s+|ils\/elles\s+|ils\s+|elles\s+)/, "")
      .replace(/\s+/g, " ");
  }

  function checkForm(infinitive, tense, personIndex, candidate) {
    const data = conjugate(infinitive);
    const row = data?.forms?.[String(tense || "").trim().toLocaleLowerCase("fr")];
    if (!row || !Number.isInteger(personIndex) || personIndex < 0 || personIndex > 5)
      return {status: "not-verified", reason: "unsupported-verb-tense-or-person"};
    const expected = row[personIndex];
    return normalizeForm(candidate) === normalizeForm(expected)
      ? {status: "verified", expected}
      : {status: "mismatch", expected};
  }

  root.VOCFrenchReference = Object.freeze({
    conjugate, checkForm, normalizeForm,
    supported: Object.freeze(["aller", "parler", "manger", "commencer"]),
    tenses: TENSES
  });
})(typeof window === "undefined" ? globalThis : window);

# Reference data – snapshot reference-20261114-1

The derived reference shards are separate from the application code and are made available under CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/ . Preserve attribution, source versions, change notices and the share-alike licence when redistributing these data.

## UniMorph data

UniMorph and the respective contributors to the German, French, English, Spanish, Portuguese and Dutch datasets: https://unimorph.github.io/ . The upstream repositories attribute their sources to Wiktionary/Wikipedia and, for Spanish, the sources in that repository's README. Upstream datasets are CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/ . Exact immutable Git commits, source URLs and per-language licences are in manifest.json.

Changes: verbs filtered from full lexical corpora; NFC/lowercase lemma keys; inflectional feature tags mapped to school tense/person slots; variants retained; data split into initial-letter shards. No outputs of the WASM engine were used as reference data.

## Publisher reference supplements

Netzverb / verbformen.de: https://www.verbformen.de/ . Published German conjugation facts and auxiliary indications supplement the German lexicon. Netzverb describes its reusable materials as CC BY-SA 4.0. Per-verb source URLs, retrieval date and source-file SHA-256 are retained in the reference entries.

Le Conjugueur / Le Figaro: https://leconjugueur.lefigaro.fr/ . French conjugation facts for the listed pilot verbs were extracted to independently compare the local engine; source URLs, retrieval date and source-file SHA-256 are retained. No page prose, examples, advertising, images or page layout are redistributed.

The local engine is ablaut 0.11.0 (MIT OR Apache-2.0), separately licensed under vendor/ablaut. A reference match establishes agreement of listed inflectional forms; it is not a proof that every context-sensitive bilingual meaning or tense correspondence is correct. German meanings originate from the user's vocabulary; the tense mapping is an explicit school exercise convention.

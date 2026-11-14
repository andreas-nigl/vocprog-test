# Rebuilding the reference snapshot

The checked-in JSON shards are the runtime assets. The application never scrapes publisher websites or sends vocabulary to an AI translation API for this pipeline.

To reproduce, place each original UniMorph file, its README.md, and commit.txt (the immutable SHA in reference/manifest.json) under ../reference-source/{deu,fra,eng,spa,por,nld}/ relative to the repository. Fetch those originals from the exact raw.githubusercontent.com/unimorph/{language}/{sha}/{language} URLs in the manifest, not from moving branch heads. Then run python tools/build_verb_references.py. Publisher HTML is cached under ../reference-source/publisher-fr and publisher-de. The public lemma seed lists in tools/reference_lemmas.json restore the supplemental pilot coverage. Optional --vocabulary PATH extracts additional lemma/headword names for reference acquisition; no vocabulary IDs, book IDs, translations, history or private input files are written to the repository.

Publisher reference acquisition uses at most three concurrent requests, a 30 s timeout and local-file reuse. The source SHA-256 and retrieval date are retained in each supplemental entry. Review date/version values before deliberately updating the snapshot. The data builder should only be run as a controlled development step; a new app release does not automatically recheck already prepared user records.

Run node --test tests/*.test.js after changes. In addition to fixtures, validate the user's actual export outside the repository. Explicitly report pending forms; do not replace missing evidence with agreement against the generator itself. All imported/generated runtime records are stored per language/infinitive/meaning; already stored records are reused, including their original checkedAt and sources. Retry only explicitly selected pending records.

A school tense correspondence is not a context-independent bilingual translation. Source dictionaries validate morphology; the German meaning is supplied by the user's book. Multiword meanings need an explicitly supported construction. Unsupported meanings and reference gaps remain pending.

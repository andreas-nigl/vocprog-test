"""Build pinned, attributed reference shards; no user vocabulary is published."""
from __future__ import annotations
import argparse
import concurrent.futures
import hashlib
import html
import json
from pathlib import Path
import re
import urllib.parse
import urllib.request
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / 'reference-source'
CATALOG = {'deu': {'present': {'IND', 'PRS'}, 'preterite': {'IND', 'PST'},
                  'konjunktiv1': {'SBJV', 'PRS'}, 'konjunktiv2': {'SBJV', 'PST'}},
           'fra': {'présent': {'IND', 'PRS'}, 'imparfait': {'IND', 'PST', 'IPFV'},
                  'futur simple': {'IND', 'FUT'}, 'conditionnel présent': {'COND'},
                  'subjonctif présent': {'SBJV', 'PRS'}}}
CATALOG.update({
    'eng': {'simple present': {'PRS'}, 'simple past': {'PST'}},
    'spa': {'presente': {'IND','PRS'}, 'pretérito indefinido': {'IND','PST','PFV'},
            'pretérito imperfecto': {'IND','PST','IPFV'}, 'futuro simple': {'IND','FUT'},
            'condicional simple': {'COND'}, 'presente de subjuntivo': {'SBJV','PRS'}},
    'por': {'presente': {'IND','PRS'}, 'pretérito perfeito': {'IND','PST','PFV'},
            'pretérito imperfeito': {'IND','PST','IPFV'}, 'futuro do presente': {'IND','FUT'},
            'condicional': {'COND'}, 'presente do conjuntivo': {'SBJV','PRS'}},
    'nld': {'onvoltooid tegenwoordige tijd': {'IND','PRS'}, 'onvoltooid verleden tijd': {'IND','PST'}}
})
LANGS = {'deu':'de-DE','fra':'fr-FR','eng':'en-US','spa':'es-ES','por':'pt-PT','nld':'nl-NL'}

FRENCH_IDS = {'0': 'présent', '100': 'passé composé', '6': 'imparfait',
              '106': 'plus-que-parfait', '18': 'futur simple',
              '24': 'subjonctif présent', '36': 'conditionnel présent'}

def normalized(value: str) -> str:
    return unicodedata.normalize('NFC', value).strip().lower()

def download(url: str, path: Path) -> str:
    if not path.exists():
        with urllib.request.urlopen(url, timeout=30) as response:
            data = response.read()
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
    return path.read_text(encoding='utf-8')

def corpus(language: str) -> dict:
    records: dict = {}
    for line in (SOURCE / language / language).read_text().splitlines():
        parts = line.split('\t')
        if len(parts) != 3:
            continue
        lemma, form, tag = parts
        tags = set(tag.split(';'))
        if not ({'V', 'V.PTCP'} & tags) or ({'PRO','N','ADJ','ACC','DAT','IMP'} & tags):
            continue
        record = records.setdefault(normalized(lemma), {'forms': {}, 'participle': []})
        if {'V.PTCP', 'PST'} <= tags:
            if form not in record['participle']:
                record['participle'].append(form)
        if 'V.PTCP' in tags and 'PRS' in tags:
            record.setdefault('presentParticiple', []).append(form)
        if 'V' not in tags or 'V.PTCP' in tags or 'V.CVB' in tags:
            continue
        if language == 'spa' and 'FORM' in tags:
            continue
        people = {'1','2','3'} & tags
        if people and ({'SG','PL'} & tags):
            indices = [int(next(t for t in ['1','2','3'] if t in tags))-1+(3 if 'PL' in tags else 0)]
        elif language == 'eng' and 'NFIN' in tags:
            row=record['forms'].setdefault('simple present',[[] for _ in range(6)])
            for index in [0,1,3,4,5]:
                if form not in row[index]: row[index].append(form)
            continue
        elif language == 'eng' and 'PST' in tags:
            indices = list(range(6))
        elif language == 'nld' and 'PL' in tags:
            indices = [3,4,5]
        else:
            continue
        for tense, required in CATALOG[language].items():
            if required <= tags:
                row = record['forms'].setdefault(tense, [[] for _ in range(6)])
                for index in indices:
                    if form not in row[index]:
                        row[index].append(form)
    pin = (SOURCE / language / 'commit.txt').read_text().strip()
    for record in records.values():
        record['sourceKey'] = 'unimorph-' + language
    return records

def french(lemma: str) -> tuple[str, dict | None]:
    slug = ''.join(c for c in unicodedata.normalize('NFKD', lemma) if not unicodedata.combining(c))
    url = 'https://leconjugueur.lefigaro.fr/conjugaison/verbe/' + urllib.parse.quote(slug) + '.html'
    try:
        path = SOURCE / 'publisher-fr' / (lemma + '.html')
        source = html.unescape(download(url, path))
        forms = {}
        for number, inner in re.findall(r'<div class="conjugBloc"><div id="temps(\d+)"[^>]*>.*?</div>(.*?)</div>', source, re.S):
            if number not in FRENCH_IDS:
                continue
            rows = []
            for line in re.split(r'<br\s*/?>', inner):
                text = re.sub('<[^>]+>', '', line).strip()
                text = re.sub(r'^(?:que |qu[’\'])', '', text)
                text = re.sub(r'^(?:je |j[’\']|tu |il |nous |vous |ils )', '', text).strip()
                if text:
                    rows.append([text])
            if len(rows) == 6:
                forms[FRENCH_IDS[number]] = rows
        if len(forms) != 7:
            return lemma, None
        first = forms['passé composé'][0][0]
        auxiliary = 'être' if first.startswith('suis ') else 'avoir' if first.startswith('ai ') else None
        part = first.split(' ', 1)[1] if auxiliary else ''
        return lemma, {'forms': forms, 'participle': [part] if part else [], 'auxiliary': auxiliary,
                       'sources': [{'name': 'Le Conjugueur / Le Figaro', 'url': url,
                                    'version': hashlib.sha256(path.read_bytes()).hexdigest(),
                                    'retrieved': '2026-11-14'}]}
    except Exception:
        return lemma, None

def german(lemma: str) -> tuple[str, dict | None]:
    slug = lemma.replace('ä', 'a3').replace('ö', 'o3').replace('ü', 'u3').replace('ß', 's3')
    url = 'https://www.verbformen.de/konjugation/' + urllib.parse.quote(slug) + '.htm'
    try:
        path = SOURCE / 'publisher-de' / (lemma + '.html')
        if lemma == 'sein' and (SOURCE / 'de-sein.html').exists() and not path.exists():
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes((SOURCE / 'de-sein.html').read_bytes())
        source = html.unescape(download(url, path))
        forms = {}
        imperative = {}
        names = {'Präsens': 'present', 'Präteritum': 'preterite', 'Konjunktiv I': 'konjunktiv1',
                 'Konjunktiv II': 'konjunktiv2', 'Perfekt': 'perfect', 'Plusquam.': 'pluperfect',
                 'Futur I': 'future1'}
        for name, inner in re.findall(r'<div class="vTbl">\s*<h[23][^>]*>(.*?)</h[23]>(.*?)</div>', source, re.S):
            if name == 'Imperativ':
                for row in re.findall(r'<tr>(.*?)</tr>', inner, re.S):
                    text = ' '.join(re.sub('<[^>]+>', '', cell).strip()
                                    for cell in re.findall(r'<td[^>]*>(.*?)</td>', row, re.S))
                    for person in ['du', 'wir', 'ihr', 'Sie']:
                        if re.search(r'\b' + person + r'\b', text):
                            imperative[person] = re.sub(r'\((?:du|ihr)\)', '', text).strip()
                continue
            if name not in names or names[name] in forms:
                continue
            rows = []
            for row in re.findall(r'<tr>(.*?)</tr>', inner, re.S):
                cells = [re.sub('<[^>]+>', '', cell).strip() for cell in re.findall(r'<td[^>]*>(.*?)</td>', row, re.S)]
                if len(cells) >= 2 and cells[0] in ['ich', 'du', 'er', 'wir', 'ihr', 'sie']:
                    form = ' '.join(cells[1:]).replace('  ', ' ')
                    variants = [form]
                    for optional in re.findall(r'\(([^()]*)\)', form):
                        variants = [value.replace('(' + optional + ')', replacement, 1)
                                    for value in variants for replacement in ['', optional]]
                    rows.append(variants)
            if len(rows) == 6:
                forms[names[name]] = rows
        plain = re.sub('<[^>]+>', ' ', source)
        plain = re.sub(r'\s+', ' ', plain)
        match = re.search(r'Als Hilfsverb.{0,140}?verwendet', plain)
        auxiliaries = sorted(set(re.findall(r'\b(?:haben|sein)\b', match.group() if match else '')))
        # An infinitive named sein must not count as a second auxiliary occurrence.
        if match and 'wird' in match.group():
            auxiliaries = sorted(set(re.findall(r'\b(?:haben|sein)\b', match.group().split('wird', 1)[1])))
        if not forms:
            return lemma, None
        return lemma, {'forms': forms, 'auxiliaries': auxiliaries, 'imperative': imperative,
                       'sources': [{'name': 'Netzverb: ' + lemma, 'url': url,
                                    'version': hashlib.sha256(path.read_bytes()).hexdigest(),
                                    'retrieved': '2026-11-14', 'license': 'CC-BY-SA-4.0'}]}
    except Exception:
        return lemma, None


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--vocabulary', type=Path)
    args = parser.parse_args()
    seed_file = ROOT / 'tools' / 'reference_lemmas.json'
    seeds = json.loads(seed_file.read_text()) if seed_file.exists() else {}
    vocabulary = []
    data = {lang: corpus(lang) for lang in LANGS}
    if args.vocabulary or seeds:
        if args.vocabulary:
            vocabulary = json.loads(args.vocabulary.read_text())['vocabulary']
        lemmas = sorted({normalized(v['foreign']) for v in vocabulary if v.get('kind') == 'verb-infinitive' and v.get('lang') == 'fr-FR'} | set(seeds.get('fra', [])))
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            for lemma, entry in executor.map(french, lemmas):
                if entry:
                    data['fra'][lemma] = entry
                else:
                    print('No complete publisher table:', lemma, flush=True)
    if args.vocabulary or seeds:
        heads = {'sein', 'haben', 'werden'} | set(seeds.get('deu', []))
        for entry in vocabulary:
            if entry.get('kind') != 'verb-infinitive':
                continue
            for meaning in re.split('[,;]', entry.get('german', '')):
                words = meaning.strip().split()
                if words:
                    heads.add(words[-1].lower())
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            for lemma, entry in executor.map(german, sorted(heads)):
                if entry:
                    previous = data['deu'].get(lemma, {})
                    entry['participle'] = previous.get('participle', [])
                    if not entry['participle'] and entry.get('forms', {}).get('perfect'):
                        first = entry['forms']['perfect'][0][0]
                        entry['participle'] = [first.split(' ', 1)[1]]
                    data['deu'][lemma] = entry
                else:
                    print('No publisher metadata:', lemma, flush=True)
    manifest = {'version': 'reference-20261114-1', 'languages': {}, 'sources': {}}
    for language, records in data.items():
        pin=(SOURCE/language/'commit.txt').read_text().strip()
        manifest['sources']['unimorph-'+language]={'name':'UniMorph '+language,'url':f'https://github.com/unimorph/{language}/blob/{pin}/{language}','version':pin,'license':'CC-BY-SA-3.0'}
        shards: dict = {}
        for lemma, record in records.items():
            if not record['forms']:
                continue
            letter = lemma[0]
            shard = format(ord(letter), 'x')
            shards.setdefault(shard, {})[lemma] = record
        out = ROOT / 'reference' / language
        out.mkdir(parents=True, exist_ok=True)
        for shard, entries in shards.items():
            (out / (shard + '.json')).write_text(json.dumps(entries, ensure_ascii=False, separators=(',', ':')))
        manifest['languages'][LANGS[language]] = {'code': language, 'shards': sorted(shards)}
        print(language, 'lemmas', len(records), 'shards', len(shards), flush=True)
    (ROOT / 'reference' / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False))

if __name__ == '__main__':
    main()

## 2026-11-13 – WASM-Integration lokal fertig, Veröffentlichung blockiert

- Ausgangsbasis Entwicklung `9b223a4`, Test `043141c`; Live unverändert.
- Artefakt 13983474116 erneut geladen, ZIP-SHA256 `99e666636ebfcf6545d8048a2cbee75b9f99329342e9282bc88d1654d70946b2` bestätigt. Browserpaket in `vendor/ablaut`, Lizenzen und SHA256SUMS erhalten; kein Neubuild oder Binärdump.
- Adapter auf reale camelCase-Felder korrigiert (alle fünf Sprachen). Browserlade-Service mit 8-s-Grenze, Fehlerfallback und begrenztem Cache; in HTML und Offlinecache v13 eingebunden.
- Tabelle ergänzt fehlende Personalformen und Grundformen direkt aus lokalem Motor, auch für schon gespeicherte Verben ohne erneuten Scan. Gespeicherte Formen/Übersetzungen und kuratierte französische Referenz haben Vorrang. Keine automatischen Datenbankänderungen oder neuen Lernkarten ohne Übersetzung. Zusammengesetzte französische être-Formen sind Anzeige mit Genus-/Numerushinweis. Niederländisch Perfekt/Plusquamperfekt bleiben ohne unabhängig belegtes Hilfsverb offen.
- 50/50 echte Node-Tests: vorhandene Regressionen, echte Aufrufe des Browserpakets für venir/go/hablar/falar/lopen, funktionale Tabellenprüfung für finir mit fehlenden Formen, Übersetzungserhalt und Öffnen/Schließen. Keine linguistische Vollvalidierung der Bibliothek. Keine Gemini- oder Supabase-E2E-Prüfung.
- Browserprüfung offen: `sites-preview start` scheitert an bereits belegtem Preview-Dienst; laufende andere Vorschau nicht beendet.
- Push automatisch abgelehnt: Umsetzungsfreigabe vom Reviewer nicht als ausdrückliche GitHub-Schreibfreigabe gewertet. Nur lokale Commits vorhanden; Teststand lokal vorbereitet, noch NICHT veröffentlicht. Nächster Schritt nach ausdrücklicher Freigabe: Entwicklungsbranch und Test-main pushen, GitHub Pages prüfen. Produktiv-main weiterhin ausgeschlossen.
- Chatüberlauf: Kein Nachweis, dass WASM-Ausführung selbst die Ursache ist. Nicht erneut allgemeine Ursachenrecherche oder Neubuild starten.

---

## 2026-11-13 – Konturbuttons umgesetzt, WASM-Artefakt erstmals direkt verifiziert

- Entwicklung: index `11cfe44`, CSS `4269c76`, SW `0d299c6`; Test: index `0ef9489`, CSS `e1f115f`, SW `043141c`. Drei App-Dateien jeweils blob-identisch. Cache v12. Produktiv-main unverändert.
- Stift und X sind jetzt SVG-Konturen statt Schriftzeichen; alle drei Icons 20 px, stroke-width 2, ohne Füllung, Flex-Zentrierung. Weiß/schwarzer Rahmen, rotes X erhalten. Browserabnahme der neuen Fassung noch offen.
- Korrektur früherer WASM-Aussagen: Über Actions-Runs-Collection zwei erfolgreiche Builds gefunden (43223467813, 43306504666). Letzter Build: Quellcommit f71068a1d9ca1264d12da1123226b03cec55d26b; alle Jobschritte inkl. Browser-/Node-Build, API-Fixtures und Upload erfolgreich.
- Artefakt 13983474116, voc-ablaut-0110-browser-and-node, nicht abgelaufen, Ablauf 2026-11-26. ZIP heruntergeladen; SHA256 99e666636ebfcf6545d8048a2cbee75b9f99329342e9282bc88d1654d70946b2 stimmt mit GitHub digest überein. Interne SHA256SUMS für Browser-JS und WASM ebenfalls geprüft.
- Echte lokale Binäraufrufe erfolgreich: manger/mangeons, aller/allons, go/went, lopen/liep; hablar und falar liefern Tabellenobjekte (keine vollständige linguistische Validierung). Browser-target JS+WASM unter Node initialisiert und venir/venons geprüft. Das ist noch kein Browser-E2E-Nachweis.
- Vor dieser Änderung im tatsächlichen Testbrowser: genau ein FR-Verbenbuch, 166 auswählbare Présent-Einträge, nach Reload erhalten. Keine Testdaten importiert oder verändert. Kein Nachweis für Mehrgeräte-Sync oder andere Zeitformen daraus ableiten.
- Nächster eng begrenzter Arbeitsblock: vorhandenen WASM-Adapter mit dem nun verfügbaren Artefakt abgleichen, Browserpaket in Test-App einbinden und Initialisierung/FR-Aufruf prüfen. Motor noch nicht in App aktiviert; keine vollständige Generierung behaupten. Neue Buttondarstellung und CI noch prüfen.

---

## VOC 0.5.1 – Fortsetzung im bestehenden Workchat (2026-11-13)

**Auftrag:** Nach fehlerhafter Aussage „kein GitHub-Zugriff“ im bestehenden Workchat fortsetzen, ursprüngliche Buchbuttons wiederherstellen, X im normalen Vokabeltrainer rechts ausrichten, vorhandene Verb-/Tabellenkorrekturen verifizieren und WASM-Build prüfen. Bestehende Freigabe gilt; keine produktive Live-Übernahme.

### GitHub-Bestandsaufnahme und AGENTS.md
- Aktueller Entwicklungsbranch `andreas-nigl/vocprog/develop/offline-supabase-20261105`, Test `andreas-nigl/vocprog-test/main`, Live `andreas-nigl/vocprog/main`.
- **GitHub-Zugriff funktioniert**: Dateien und Commit-Diffs gelesen, Änderungen erfolgreich gepusht. Kein Wechsel in Codex/anderen Workchat erforderlich.
- Die früheren Root-`AGENTS.md` sind inzwischen in allen drei Branches **entfernt** (Entwicklung/Live zuletzt Commit `0a3e3eb`, Test `6bc5581`, jeweils „restore AGENTS.md state of 2026-11-11“). Dies ist eine neuere dokumentierte Entscheidung. **Nicht ungefragt wieder anlegen.** Die maßgebliche `PROJECT_HANDOFF.md` bleibt bestehen.

### Implementierung und veröffentlichter Teststand
- Entwicklung `vocprog-enhancements.css`, Commit `1ba0f816`: Stift/Merge/X nun 40×40 px, weißer Hintergrund, feiner schwarzer Rand, schwarze Linien, dünnes rotes X. Rechte X-Schaltfläche des Vokabeltrainers explizit in **Grid-Spalte 3**, unabhängig davon, ob der mittige Tabellenbutton verborgen ist.
- `vocprog-fr-reference.js`, Commit `b569abda`: lokales, kuratiertes Paradigma für **venir** (présent, imparfait, futur simple, conditionnel présent, subjonctif présent, passé composé, plus-que-parfait), Infinitiv, `venu(e)(s)`, Imperativ `viens / venons / venez`. Zusammengesetzte Zeiten mit `être` nur als kompakte **Anzeige**; automatische OCR-Verifikation dieser Formen bewusst nicht behauptet, da Genus/Numerus des Subjekts benötigt wird. Fünf lokal referenzierte französische Verben, keine allgemeine fünfsprachige Abdeckung.
- `vocprog-enhancements.js`, Commit `04426a83`: Verbtabelle zeigt fehlende französische Grundformen aus lokal kuratierter Referenz, soweit verfügbar; Buchdaten und gespeicherte deutsche Übersetzungen haben Vorrang. Unbekannte Übersetzungen bleiben als nicht erfasst gekennzeichnet.
- `tests/fr-reference.test.js` `ade7d2e`, `tests/verb-ui.test.js` `2a5fb1e`: neue Tests für venir, Übereinstimmung, Grid-Ausrichtung und Buchbutton-Stil.
- Entwicklungs-`index.html` `336331f`, `sw.js` `bcb1ee5`: Version **VOC 0.5.1 Testvorschau**, Offlinecache `vocprog-staging-20261113-v11`.
- Testrepository `andreas-nigl/vocprog-test/main` aktualisiert: CSS `9f1ae91`, FR-Referenz `7864948`, Erweiterungs-JS `fafdde7`, HTML `077ebc7`, SW `b03636d` (letzter App-Commit). Alle **5/5** App-Blob-SHAs mit Entwicklungsbranch identisch.
- URL: <https://andreas-nigl.github.io/vocprog-test/>. GitHub-Pages-HTTP-Erreichbarkeit und echte Browser-/Gerätebedienung **nicht** verifiziert (externer Webabruf aus Arbeitsumgebung fehlgeschlagen). Produktives `main` und Supabase unverändert.

### Tests / WASM / offene Punkte
- **44/44 isolierte JS-Unit-/Regressionstests bestanden** über den vorhandenen Testquelltext mit Node-kompatiblem Test-Harness; HTML-Inline-JS, Erweiterungs-JS, SW, FR-Referenz, WASM-Adapter syntaktisch geprüft. Kein echter `node --test`-CI-Lauf und kein Browser-E2E-Test in dieser Sitzung.
- WASM-Bibliothek `ablaut` 0.11.0 am festgelegten Upstream-Commit `ca8d2212c20d7e5ae83771dc3fe37023fda9c7cc` direkt über GitHub gelesen: `Cargo.toml` bietet Feature `wasm`, `src/wasm.rs` exportiert `conjugate(infinitive,lang)`; `src/fra.rs`, `src/eng.rs`, `src/nld.rs` enthalten die vom Adapter erwarteten Tabellenfelder. Das belegt Quellcode-/API-Kompatibilität, **nicht** den erfolgreichen Binärbuild.
- GitHub-Connector `fetch_commit_workflow_runs` gibt für geprüfte Commits keine Runs zurück (beschränkt auf PR-triggered Runs), Commit-Statuses ebenfalls leer. Ohne Run-ID kann der Connector kein Artefakt/Joblog herunterladen. Öffentlicher API-Abruf scheiterte; lokal `cargo`, `rustc`, `wasm-pack` nicht installiert und externe Git-Verbindung nicht erreichbar. **Kein verifiziertes WASM-Artefakt**, Adapter absichtlich nicht aktiv geladen. Kein fertiger vollständiger Offline-Konjugationsmotor behauptet.
- Bereits zuvor implementiert und durch Regressionstests abgedeckt: deterministische Konsolidierung doppelter FR-Verbenbücher mit Backup und Tombstones; Vokabel- und Verbnummerierung je Seite ab V1 ohne Änderung gespeicherter Referenzen; separate Tabellenkarte. Reale Supabase-Mehrgeräte-Migration noch durch Nutzer zu testen.
- **Nächste Schritte:** echten GitHub-Actions-WASM-Run (ID/Log/ZIP/SHA256) über Actions-Oberfläche oder geeigneten Zugriff beschaffen; anschließend Browser-Ladung und sprachspezifische Adaption prüfen; echte Browser-/Mobil-/Offline-/Supabase-Tests, Nutzerabnahme der 0.5.1-Vorschau. Keine Live-Übernahme ohne separate Freigabe.

### Bearbeitungszeit / Diagnose
- In diesem Chat sind mehrere hundert historische Teilnachrichten referenziert und viele sequentielle GitHub-Datei-Updates erforderlich. Dies sind plausible Laufzeitfaktoren, aber **keine nachgewiesene Ursache** einer Plattformverlangsamung.
- Root-`AGENTS.md` sind aktuell **nicht vorhanden**; sie können daher diese konkreten Arbeitsschritte nicht durch zusätzliche Regeln verlangsamen. Eine kausale Wirkung der GPT-Personalisierung ist nicht nachgewiesen.

---

## Chatwechsel – gesicherter Einstiegspunkt 2026-11-13

**Aktueller Auftrag:** Arbeitsstand sichern und im neuen Workchat nahtlos fortsetzen. In diesem Sicherungsblock ausschließlich diese Übergabe aktualisiert; keine App-, Cloud- oder Releaseänderungen.

### Am 2026-11-13 direkt in GitHub abgeglichene Referenzen
- Entwicklung: `andreas-nigl/vocprog`, `develop/offline-supabase-20261105`, HEAD vor diesem Dokumentationscommit `3013f7458fd63bc20fc3b38e326293dd1bd4dd24`.
- Test: `andreas-nigl/vocprog-test/main`, HEAD `e7a4fdc5edf06588fe7f7a98c0fe31549bda9917`.
- Live: `andreas-nigl/vocprog/main`, HEAD `f5b026e4a3342995db7d0342a3c66be680c14c6f`.
- Root-`AGENTS.md` im Entwicklungsbranch gelesen. Diese Übergabe bleibt maßgeblich; neuere datierte Entscheidungen haben Vorrang vor historischen Abschnitten (insbesondere: kein Latein; öffentlicher Testbestand ohne Login).
- Im aktuellen lokalen Arbeitsverzeichnis lagen keine ungesicherten Projektdateien. Kein neuer Standalone-Build; Test-PWA-Offlinecache laut bisherigem Nachtrag v10, echter Offline-Neustart weiterhin offen.

### Tatsächlicher Stand gegenüber der letzten sichtbaren Chatantwort
Die pauschale Aussage, es bestehe kein GitHub-Zugriff, trifft für diese Sitzung nicht zu: Repository und Übergabe konnten gelesen und können aktualisiert werden. Nicht erneut nur einen Umsetzungsauftrag formulieren.
Die beiden unmittelbar folgenden Nachträge dokumentieren bereits gespeicherte Korrekturen: ein Verbenbuch je Sprache mit Backup/Konsolidierung, ursprüngliche Stift/Merge/X-Optik, lückenlose Anzeige je Seite, Tabellenbutton mittig und separate Tabellenkarte mit Grundformenabschnitten. Nicht ungeprüft erneut implementieren. Die Korrekturfassung ist noch nicht vom Nutzer abgenommen.
Letzter dokumentierter Prüfstand: 40/40 isolierte JS-Tests; in diesem Sicherungsblock nicht erneut ausgeführt. Kein neuer Browser-, CI-, WASM-, Gemini- oder Supabase-Nachweis.

### Nächster bereits freigegebener Arbeitsblock
1. Branch/Commit und AGENTS.md abgleichen; vorhandene Korrekturen im Code und tatsächlichen Browser prüfen. Abnahme: ein FR-Verbenbuch auch nach Sync/Scan; Stift/Merge/X wie Referenz; Vokabelanzeige jeder Seite ab V1 ohne Lücken, persistierte IDs/Referenzen erhalten; Tabelle als zweiter abgerundeter Kasten unter Trainer; mittiger randloser Tabellenbutton in passender Farbe/Höhe/Rundung.
2. Tatsächliche GitHub-Actions-Läufe und Buildlogs des ablaut-WASM-Builds ermitteln; Fehler beheben, echtes Artefakt herunterladen und Herkunft/SHA-256 sowie Browserladung verifizieren. Bisher KEIN erfolgreicher Build nachgewiesen. WASM ist die lokal im Browser ausführbare kompilierte Konjugationsbibliothek, nicht der Vokabelspeicher; Architekturbegründung auf Nachfrage erläutern.
3. Fehlende vollständige Grundformen/Konjugationen für die fünf freigegebenen Sprachen unabhängig prüfen und integrieren. FR-Pilot deckt nur vier Verben ab; fehlende Formen wie bei venir nicht als erledigt ausgeben. Latein vollständig aus weiterem Entwicklungsumfang ausgeschlossen.
4. Regression, Browser/Mobil, Offline, Import/Export und Supabase-Mehrgeräte-/Merge-/Reset-Verhalten prüfen; geeigneten Testbuild im bestehenden Testrepository bereitstellen und Übergabe aktualisieren. Live-Übernahme und einmaliger Analyse-Gesamtreset bleiben gesondert freizugeben.

**Freigabe:** Der bestehende Entwicklungsauftrag und die ausdrücklich angeforderten Korrekturen/WASM-Verifikation gelten weiter. Kein erneutes allgemeines Freigabegespräch. Keine Datenlöschung, Rechteänderung oder produktive Veröffentlichung aus dem Sicherungsauftrag ableiten.
**Minimaler Starttext:** „Weiter mit VOC im Repository andreas-nigl/vocprog, Branch develop/offline-supabase-20261105. Lies AGENTS.md und PROJECT_HANDOFF.md und setze beim nächsten freigegebenen Schritt fort.“

---

## Nachtrag zur VOC-0.5-Korrektur: Vokabelbuch-Nummerierung (2026-11-12)

- Nutzerwunsch präzisiert: In **normalen Vokabelbüchern** müssen
  die nach Verbextraktion verbleibenden Einträge auf jeder
  Seite bei `V1` beginnen und lückenlos weiterlaufen;
  zusätzlich bleibt die bereits korrigierte nummerierte
  Anzeige in Verbenbüchern erhalten.
- `vocprog-enhancements.js` im Entwicklungsbranch,
  Commit `a081c7e72c119882dd2cd3028ef2d99709337b2e`:
  `filterVocabByPages` erzeugt reine Displaykopien
  mit neuen, pro Seite lückenlos aufgebauten
  `refVocab`-Nummern. Persistierte Originalreferenzen,
  Vokabel-IDs, Lernhistorien bleiben unverändert.
- Verbindliche Regression in
  `tests/verb-ui.test.js`, Commits `dfda05c`,
  `5a23fdb`: aus `S156 V62`, `S156 V64`,
  `S157 V8` werden angezeigt
  `S156 V1`, `S156 V2`, `S157 V1`,
  ohne gespeicherte Referenzen zu überschreiben.
- Nach Ergänzung: **40/40 isolierte JavaScript-
  Unit-/Regressionstests bestanden**. Dies ist
  kein echter Node-CI-, Browser- oder
  Supabase-Mehrgeräte-E2E-Nachweis.
- Öffentliche Testversion `vocprog-test/main`
  erneut aktualisiert: JS-Commit `37097bd`,
  Offline-Cache `vocprog-staging-20261112-v10`
  (SW-Commit `e7a4fdc`), Quellen im
  Entwicklungsbranch: SW `eee1cf0`.
- Bestehende Live-Version und Supabase-Rechte
  unverändert. Noch kein erfolgreich verifizierter
  ablaut-WASM-Build oder WASM-Artefakt.

## VOC 0.5 – Korrekturen nach Nutzerabnahme der Testvorschau, 2026-11-12

**Auftrag / Nutzerabnahme:** Nutzer bestätigte Vorschau grundsätzlich, meldete
doppelte FR-Verbenbücher, Abweichungen der Buchbuttons, lückenhafte
Nummerierung und falsche Trainer-Tabellenposition/Grundformen.
Dieser Korrekturblock ist durch den bestehenden freigegebenen
VOC-Entwicklungsauftrag und den ausdrücklichen Fortsetzungswunsch gedeckt.
**Noch keine Nutzerabnahme dieser Korrekturfassung.**

### Gesicherter Entwicklungs- und Veröffentlichungsstand
- Repository `andreas-nigl/vocprog`, Branch
  `develop/offline-supabase-20261105`.
- `index.html`: `382fd8d` – Tabellenbutton im oberen
  Trainerkopf, Panel aus Trainer-Karte heraus als Geschwister-
  Karte unmittelbar darunter verschoben.
- `vocprog-enhancements.css`: `47cc909` – Button
  `Tabelle` mittig, ohne schwarzen Rand, 40 px hoch,
  pill-förmig wie die bestehenden runden Bedienbuttons;
  Buchbuttons Stift/Merge/X wieder 42 px, ursprüngliche
  Farben/Radius; Tabellenkarte weiß mit 16-px-Ecken
  und Schatten wie Trainerkarte.
- `vocprog-enhancements.js`:
  - `c32aa96`: Bei Anlage und Scans vorhandenes Verbenbuch
    gleicher Sprache wiederverwenden. Historisch doppelte
    Verbenbücher werden lokal deterministisch nach Buch-ID
    konsolidiert und anschließend über vorhandene Tombstone-
    Synchronisation fortgeschrieben. Zuvor ein vollständiger
    lokaler Backup-Snapshot aller betroffenen Bücher, Vokabeln,
    Sonderformen und Lernereignisse. Bei Backupfehler
    **keine** automatische Migration.
  - `fce5fc8`: Fehler beseitigt, bei dem ein
    `const b` beim Erkennen einer vorhandenen Sprache
    neu zugewiesen werden sollte.
  - `9b9dbb3`: für jeden anderen Satz doppelter Bücher
    eigenständiger Backup-Schlüssel.
  - `25d7cc0`: Display-Referenzen für Verben pro Buchseite
    und Verb-ID fortlaufend ab `V1`, unabhängig von
    alten OCR-/Vokabelnummern; Originalreferenzen/IDs
    bleiben im Datensatz erhalten.
  - `1f0f8a6`: separate Tabellensektionen für
    `Infinitif`, `Participe passé`, `Impératif`
    und gewählte Zeitform. Vorhandene gespeicherte
    Übersetzungen werden gezeigt; nicht vorhandene
    Grundformen bleiben ausdrücklich als
    `– (noch nicht erfasst)` markiert. Nur für
    vier im lokalen FR-Referenzmotor erfasste Pilotverben
    können Referenz-Partizip/Imperativ zusätzlich
    zugrunde gelegt werden; für `venir` werden
    **keine Formen erfunden**. Tabellenöffnung/
    -schließung und Trainer-Exit schließen Panel korrekt.
  - `d675eb0`: keine Zusammenlegung gleicher Verbformen
    **auf unterschiedlichen Buchseiten**; nur vollständig
    gleiche Datensätze innerhalb derselben Seite gelten
    als Dublette. Wiederholung auf neuer Seite bleibt erhalten.
- `sw.js`: `c44214a`, Cache `vocprog-staging-20261112-v9`.
- Neue/erweiterte Regressionstests
  `tests/verb-ui.test.js`: `d17f838`,
  Erweiterung `b9218d9` für seitenübergreifende
  Verbwiederholungen.
- **Öffentliche Testversion `andreas-nigl/vocprog-test/main` aktualisiert**
  mit HTML, Erweiterungs-JS/-CSS, SW.
  Zuletzt: `1e47d9a42af7de1662692a3ffab5c995b9037b5d`.
  URL <https://andreas-nigl.github.io/vocprog-test/>.
  **Produktives `andreas-nigl/vocprog/main` NICHT verändert**,
  kein eigener Standalone-Build; HTML-Live-Blob
  zuletzt `4ddacd1f1c84ae4dc7a8b60128657545c212b681`.

### Reale Prüfungen und Grenzen
- **39/39 isolierte JS-Unit-/Regressionstests bestanden**,
  inklusive neuer Funktionstests:
  2 französische Verbenbücher → 1 Buch,
  doppelte Vokabeln derselben Seite entfernt,
  weitere Personalform und Wiederholung
  auf anderer Seite erhalten, Lernereignis-
  `sourceId` korrekt remappt, Tombstone
  und lokale Backup-Datei vorhanden;
  `S156 V1, V2` ohne Lücken; zweite Buchseite
  beginnt wieder bei `V1`.
- Zusätzlich isolierter DOM-Mock mit fotografiertem
  Verbfamilienfall `venir` / Présent:
  Tabelle öffnet/schließt; Infinitiv,
  Partizip, Imperativ und Zeitformabschnitt
  vorhanden, sechs gespeicherte Präsensformen
  und deutsche Übersetzungen angezeigt;
  fehlende Grundformen korrekt gekennzeichnet.
- Inline-JS in HTML, Erweiterungs-JS, FR-Referenz
  und Service Worker syntaktisch geprüft.
- Test-HTML/CSS/JS- und SW-Blobs gegen
  Entwicklungsbranch abgeglichen (5/5).
- **NICHT bestanden oder nicht ausführbar nachgewiesen:**
  tatsächlicher öffentlicher GitHub-Pages-HTTP-Abruf,
  vollständiger Browser-/Smartphone-UI-Test,
  echter Gemini-Scan, Supabase-Migration an
  echten Cloud-Datensätzen und Konfliktprüfung
  mit zwei gleichzeitig aktiven Geräten.
  Die automatische lokale Dublettenmigration
  ist für den Nutzer erst beim Start/Sync der App
  aktiv; **keine direkten Supabase-Schreibvorgänge
  durch diese Entwicklungstools**.
- **WASM-Verifikation:** Der GitHub-Actions-
  WASM-Buildworkflow existiert und wurde
  durch Änderung an seiner Workflow-Datei
  zum Auslösen gebracht; jedoch geben die
  verfügbaren GitHub-Connectors für
  `f71068a` und nachfolgende Commits
  weder bestätigte erfolgreiche CI-Runs
  noch WASM-Artefakt/Prüfsumme zurück.
  Kein Rust/`cargo`/`wasm-pack`
  im verfügbaren lokalen Container;
  externer GitHub-Netzabruf dort nicht möglich.
  **WASM-Build nicht als verifiziert deklarieren
  und Motor nicht in Test-/Live-App einbinden.**

### Nächste Arbeitsschritte / offene Abnahme
1. Nutzer testet neue Vorschau, besonders
   den erstmaligen Ein-Buch-Migrationslauf
   in der tatsächlich verbundenen Supabase-Umgebung
   und zweite Geräte-Synchronisierung. Vorher
   möglichst vollständigen App-Export sichern,
   zusätzlich zum automatischen lokalen Snapshot.
2. Echtes WASM-Workflowprotokoll samt Run-ID
   und SHA256-Bundle prüfen; erst dann
   fünfsprachigen Motor und fehlende Formen
   integrieren. Für `venir` sind Partizip/
   Imperativ im aktuellen Fall ohne
   unabhängige Bestätigung nicht vorhanden.
3. Browser-/Offline-/OCR-/Gemini-/Sync-E2E-Prüfungen
   dokumentieren, Testabnahme einholen;
   produktives `main` weiterhin gesondert freigeben.

## VOC-0.5-Testvorschau / AGENTS.md / Latein entfernt — 2026-11-12

### Explizite aktuelle Nutzerentscheidung
- **Latein komplett weglassen.** Unterstützte Sprachenauswahl: Englisch,
  Französisch, Spanisch, Portugiesisch und Niederländisch. Latein nicht
  in Scan-Prompt, Sprachauswahl, Verbenbuchliste oder Zeitform-Katalog.
  Keine lateinischen Formen erzeugen. Historische lokale/cloud-
  Datensätze **nicht löschen**, sondern in der Oberfläche verbergen;
  späterer Datenlösch-/Migrationsauftrag wäre separat.
- **Neue öffentliche Testversion angefordert**. Produktivversion
  bleibt bis separater Abnahme unverändert.
- AGENTS.md projektbezogen und ausdrücklich aufgeteilt in
  allgemeine VOC-Regeln sowie nur für Entwicklungs-/Test-
  umgebung geltende Vorgaben.

### AGENTS.md: tatsächlich erstellt und gepusht
- `andreas-nigl/vocprog`, Branch
  `develop/offline-supabase-20261105`, Root `AGENTS.md`:
  Commit `71842b1`.
- `andreas-nigl/vocprog`, Branch `main`, Root
  `AGENTS.md`: Commit `f5b026e`, **nur Dokumentation**,
  produktiver Anwendungscode unverändert.
- `andreas-nigl/vocprog-test`, Branch `main`, Root
  `AGENTS.md`: Commit `9085e10`.
- In allen dreien klare Trennung zwischen allgemeingültigen
  VOC-Regeln und ausschließlich testbezogenen Vorgaben;
  keine früheren `AGENTS.md` überschrieben.

### Tatsächliche Implementierung / Deployment
- Entwicklungsbranch: `index.html` (`cd40328`,
  `c290859`, `2b7e8e0`): Latein aus Sprache und
  KI-Spracherkennung entfernt; harter OCR-Guard **vor**
  Buchzuordnung und Datenspeicherung; Titel und Fuß
  als `Testvorschau 0.5`.
- `vocprog-enhancements.js` (`924c24f`, `89df5d7`):
  nur fünf unterstützte Sprachen, keine LAT-Zeitform;
  alte LAT-Bücher nicht gelöscht, aber aus Auswahl
  herausgefiltert; alte Auswahl beim Start korrigiert.
- Experimentelle, noch nicht integrierte Latein-Dateien
  `vocprog-latin-principal.js` und
  `tests/latin-principal.test.js` aus Entwicklungsbranch
  entfernt (`24e9092`, `bae9e62`).
- `sw.js`: Cache `vocprog-staging-20261112-v8`,
  Commit `e95f014`.
- WASM-Buildworkflow zum erneuten Ausführen im
  Entwicklungsbranch geändert (`f71068a`);
  Quelle weiterhin gepinnt auf `ablaut` 0.11.0
  Commit `ca8d2212c20d7e5ae83771dc3fe37023fda9c7cc`.
  **Keine bestätigte erfolgreiche GitHub-Action oder
  heruntergeladene WASM-Datei** verfügbar. Der
  `vocprog-wasm-adapter.js` bleibt absichtlich
  **nicht** als aktive Browser-Komponente eingebunden.
- **Testdeployment durchgeführt**:
  `andreas-nigl/vocprog-test`, `main`:
  `vocprog-fr-reference.js` `b8fce46`,
  `vocprog-enhancements.css` `1517c3e`,
  `vocprog-enhancements.js` `573fa05`,
  `index.html` `26ded1f`, `sw.js`
  `44dc3b2` (letzter Staging-Commit).
  URL: <https://andreas-nigl.github.io/vocprog-test/>.
  Neue Testdateien auf GitHub mit dem Entwicklungsbranch
  Blob-für-Blob abgeglichen: **5/5 identisch**.
  Tatsächliche GitHub-Pages-HTTP-Auslieferung konnte
  in der Arbeitsumgebung wegen fehlendem externen
  Zugriff **nicht** überprüft werden.
- Produktionscode `vocprog/main/index.html` blieb
  bei Blob `4ddacd1f1c84ae4dc7a8b60128657545c212b681`.
  Keine Supabase-Migration, RLS-/Auth-Änderung,
  Buchumbenennung oder Analyse-Rücksetzung ausgeführt.

### Tests und eingeschränkte Abnahme
- Der vorangegangene isolierte Stand zeigte 42/42
  Mock-Modultests **mit** Latein. Nach Entfernen der
  Lateinkomponente bleiben 32/32 reine Modultests.
- Neuer `tests/no-latin.test.js` (`b14a3fd`):
  LAT-Sprachoption fehlt, LAT-Scan vor Speicherung
  gesperrt, historische Daten nur verborgen.
  Aktuell **35/35 isolierte JS-Modultests** erfolgreich.
- Staging nach Übertragung: JavaScript-Syntax in
  HTML/Erweiterungs-JS/FR-Referenz/SW parsebar,
  benötigte UI-IDs und CSS-Selektoren vorhanden,
  Script- und SW-Dateipfade konsistent,
  LAT nicht sichtbar.
- **Nicht als getestet behaupten:** echter
  `node --test`-CI-Lauf des neuen Commitstands,
  erfolgreicher WASM-Build/SHA-256-Prüfung,
  Browser-/Mobil-Kamera, reale Gemini-Abfragen,
  echtes Supabase-Merge/Mehrgeräte-Sync,
  Offline-Cache-Neustart und GitHub-Pages-
  HTTP-Erreichbarkeit. Die 0.5-Veröffentlichung ist
  bewusst eine **Testvorschau, keine Nutzerabnahme**
  und keine als vollständig bezeichnete
  Konjugationsfunktion.

### Noch offen und nächste bereits freigegebene Schritte
1. Tatsächliches GitHub-Actions-WASM-Artefakt
   samt Buildlogs/SHA-256 verifizieren,
   fünfsprachige Sprachformen prüfen, danach
   Motor in VOC 0.5 integrieren.
2. Browser- und Supabase-E2E-Abnahme des neuen
   Teststands, vor allem alte Daten, Buch-Merge,
   Reset-Epoch, Scan und Offline-SW.
3. Unabhängige Übersetzungsqualität und nur
   nachgewiesene Verbformen; derzeit FR-Pilot nur
   für vier Verben unabhängig grammatisch geprüft.
4. Nutzerabnahme der Testversion und erst
   danach gesonderte produktive Freigabe.
   Analyse-Gesamtreset ausschließlich unmittelbar
   vor freigegebener Live-Übernahme.

## Fortsetzung 2026-11-12 – vollständige Modultests und CI-Status

**Auftrag:** „weiter“ nach Gmail/Supabase- und CI-Diagnose. **Keine Änderung an
öffentlichen App-Versionen oder Cloud-Daten.** Bestehender Handoff fortgeführt.

### GitHub- und E-Mail-Abgleich
- Branch `develop/offline-supabase-20261105`; Handoff-Blob vor
  diesem Block `4c66646f32668d4f6001b1b3bed206bf79b0c13a`.
- Historischer GitHub-Actions-Fehler im Lauf
  <https://github.com/andreas-nigl/vocprog/actions/runs/43225749898>
  (Commit `11e9840`): **26/27 bestanden**, ein veralteter Test
  erwartete NL 2/5 statt neuerdings 3/5 sicher modellierter
  Schulzeiten. Runnerlogs aus Job `131208340381` bestätigt.
- Aktueller Testblob `tests/wasm-adapter.test.js`
  `ab5b6a9a7d5410d4222ddc267c2818c73a198420`
  erwartet korrekt 3 verfügbare und 2 nicht abgesicherte NL-Zeiten.
- Die eingeschränkte `fetch_commit_workflow_runs`-Schnittstelle
  zeigt keine bestätigten aktuellen CI-Läufe. Das ist **keine**
  grüne CI-Abnahme und kein Beleg für fehlende Actions-Läufe.
- Gmail-Überprüfung bereits dokumentiert: Supabase-Willkommensmail
  und keine konkrete Supabase-Ausfallmeldung; dies prüft weder
  Cloud-Sicherheitskonfiguration noch aktuelle Datenintegrität.

### Tatsächlich durchgeführte weitere Prüfung
- Aktuelle GitHub-Quellen vollständig gelesen:
  `vocprog-fr-reference.js`,
  `vocprog-wasm-adapter.js`,
  `vocprog-latin-principal.js`,
  `vocprog-enhancements.js`,
  `index.html`, `sw.js`, alle vier
  `tests/*.test.js`-Dateien.
- **42/42 vorhandene Tests in einer isolierten JavaScript-
  Ausführung bestanden**. Hierzu die gespeicherten Testfälle mit
  identischen JS-Quellen direkt evaluiert und Node-`assert`/
  `node:test` durch kleine synchron ausgeführte Prüf-Helfer
  ersetzt. Darunter FR-Konjugationsregressionen,
  EN/ES/PT/NL-Adaption, lateinische Principal-Parts-
  Review-Gates, Verbkarten-/Buch-Deduplizierung und
  HTML/JS-Syntax.
- **Prüfgrenze:** kein echter `node --test`-Lauf im
  GitHub-Runtime- oder Container-Filesystem; Modul-Simulation
  beansprucht **nicht** die volle native Node-Runner-
  Semantik oder echte Browser-Interaktionen. Kein echtes
  WASM-Binary geladen. Browser-/Supabase-/Offline-/Multi-
  Device-Abnahme weiterhin offen.
- Kein Bug aus aktuellem Stand belegt, der eine weitere
  Codeänderung erfordert. **Kein Code geändert** in diesem
  Prüfblock; nur die maßgebliche Übergabe fortgeschrieben.

### Nächste bereits freigegebene Aufgaben
1. Einen vollständigen echten `node --test tests/*.test.js`
   GitHub-Actions-Lauf für den **aktuellen** Branchcommit
   verifizieren; bei Fehler Joblogs lesen und Ursache beheben.
2. WASM-Workflow im GitHub-Actions-Runner ausführen,
   Artefakt und SHA-256 nachprüfen; erst dann Adapter
   in die Browser-App integrieren.
3. LAT/FR/EN/ES/PT/NL-Datenvertrag und deutsche
   Übersetzungen mit realen Fällen prüfen, vollständige
   Buchmigration und Cloud-Sync sicher testen.
4. Test-App nur nach E2E-Freigabe aktualisieren.
   Produktiv-App und Supabase-Daten bis zur gesonderten
   Freigabe unangetastet; Analyse-Reset erst vor Live-Release.

## Gmail- und CI-Diagnose bei Wiedereinstieg – 2026-11-12

**Status:** Diagnose und Handoff, **keine** Cloud-Datenbank-
oder Produktivänderung, **kein** Release. Nutzer beauftragte
ausdrücklich Prüfung der Supabase-Mails in Gmail und Fortsetzung.

### Gmail-Befund
- Gmail-Masterkonto und die zwei verfügbaren Archivkonten nach
  Supabase-Nachrichten durchsucht.
- Supabase selbst: `Welcome to Supabase` vom **2026-11-05**,
  keine Warnung über Datenbank-Ausfall, Sicherheitsvorfall,
  Sperrung oder Gebühren. GitHub-OAuth-Autorisierung für
  Supabase am selben Tag per GitHub-Nachricht belegt.
- Relevant für VOC ist stattdessen eine GitHub-Action-Mail
  vom **2026-11-12, 14:17 MEZ**:
  `Run failed: VOC unit tests -
  develop/offline-supabase-20261105 (11e9840)`.
  <https://github.com/andreas-nigl/vocprog/actions/runs/43225749898>
- Aus GitHub über Job-ID `131208340381` vollständig
  ausgelesene Runnerlogs: Checkout erfolgreich,
  Node `v24.22.2`, **27 Tests: 26 pass / 1 fail**,
  kein Infrastruktur- oder Checkout-Fehler.
  Fehlschlag in `tests/wasm-adapter.test.js:58`:
  NL-Adapter erzeugte bereits **3** Zeitformen,
  der am Commit `11e9840` ausgeführte Test
  erwartete noch **2** (Assertion `3 !== 2`).
- Der **aktuelle** Branch-Test
  `tests/wasm-adapter.test.js`
  Blob `ab5b6a9a7d5410d4222ddc267c2818c73a198420`
  verlangt korrekt **3** und **2 fehlende** Zeitformen;
  Zukunft `zal/zult/zal/zullen/zullen/zullen lopen`
  wird explizit geprüft. Es handelt sich bei diesem
  historischen Runner-Befund um einen veralteten Test,
  nicht um belegte Fehler der NL-Konjugationslogik.
- **Nicht als grün deklarieren:** Ein neuer vollständiger
  CI-Durchlauf des letzten Branchstands wurde NICHT
  nachgewiesen. Die GitHub-Funktion
  `fetch_commit_workflow_runs` liefert nur eingeschränkt
  PR-bezogene Läufe; leere Resultate sind kein
  Nachweis für fehlende oder erfolgreiche Runs.

### Fortsetzung / Abnahmekriterien
- Bereits bestehende Latein-Entwicklungsänderungen und
  Übergabe erhalten; keine ältere Fassung wiederhergestellt
  und keine parallele Handoff-Datei angelegt.
- Für jeden neuen Build: Commit-SHA und konkreten
  GitHub-Action-Run samt Logs prüfen, vollständige
  `node --test tests/*.test.js`-Suite muss erfolgreich
  sein. Danach echter WASM-Artefakt-/SHA256-Test.
- Der Supabase-Mailbefund bestätigt **nicht** die
  Sicherheitskonfiguration oder tatsächliche
  Datenintegrität der öffentlichen Tabelle;
  separate Datenschutz-/Sync-/Berechtigungsprüfung
  vor Deployment bleibt verpflichtend.
- `vocprog-test/main` und `vocprog/main` nicht
  aktualisiert, keine Datenmigration und kein Analyse-Reset.


## Entwicklungsfortsetzung – Latein-Datenintegrität und lokaler Lexikoneingang (2026-11-12)

**Freigabe und Deployment:** Fortsetzung unter der bestehenden ausdrücklichen
Gesamtfreigabe, **kein neuer User-Release**. Die bisherige öffentliche
Testversion und `vocprog/main` sind nicht geändert worden.
`vocprog-wasm-adapter.js` bleibt vorläufig nicht aktiv im HTML.

### Verifizierter Ausgangszustand
- Repo `andreas-nigl/vocprog`, Branch
  `develop/offline-supabase-20261105` mit Handoff-Blob
  `3a95d63e3f142fd73405da2cdda80bed19bbd5d6`.
  Tatsächlich war bereits ein dokumentierter NL-/Latein-Block
  vorhanden; dieser wurde fortgesetzt statt überschrieben.
- GitHub-Connector meldete für den ursprünglichen WASM-Baucommit
  `02fc5ce` keine bestätigten Actions-Läufe oder Statuschecks;
  dieses API listet eingeschränkt Workflow-Runs (PR-Filter).
  Ein erfolgreicher Build darf daraus nicht abgeleitet werden.
- Kein lokales `cargo`, `rustup` oder `wasm-pack`,
  `raw.githubusercontent.com` wegen fehlendem DNS nicht
  erreichbar. Browser- und Node-WASM-Artefakt weiterhin nicht
  vorhanden bzw. nicht verifiziert.

### Latein-Referenz und Codeänderungen
- Relevante Quelle `kigawas/whitakers-words`, Version
  `0.1.3` laut gelesenem `package.json`, MIT-Lizenz
  laut `LICENSE`. Der dokumentierte öffentliche Browserpfad
  ist `WordsEngine.create(...)`, dann `parseWord(word)`;
  `dictionaryForm(de)` ist separat aus der Formatter-API
  exportiert. Datenquellen: `DICTLINE.GEN`,
  `DICTLINE.SUP`, `INFLECTS.LAT`, `ADDONS.LAT`,
  `UNIQUES.LAT`. Diese Dateien wurden **nicht**
  kopiert, mitgeliefert oder extern gehostet.
- Vorhandenes `vocprog-latin-principal.js` bereits mit
  konservativen Stammformenprüfungen vorgefunden;
  minimal weiterentwickelt, **nicht ersetzt**.
- Commit `4cb125f`: in `principalPartsFromAnalysis`
  werden Wörterbuch-Kandidaten bei vorhandenem
  `analysis.word` nur dann berücksichtigt, wenn
  die 2. zitierte Stammform (Infinitiv) diakritikbereinigt
  übereinstimmt. Fehlt die `V`-Wortartkennung in der
  Zitationszeile, wird die Zeile übersprungen.
  `makeFourPartReview` lehnt unvollständige Vierergruppen
  und abweichende erste drei Quellstammformen ab. Die
  vierte Stammform kann mit unterschiedlicher
  Wörterbuch-Konvention (z. B. `amātus` vs.
  `amātum`) nach unabhängiger Prüfung angegeben werden.
  Deponentien bleiben ausgeschlossen und brauchen eigene
  Paradigmen. Kein im Code vorgegebenes
  `reviewed:true` gilt als unabhängiger Beweis.
- Commit `40882f1`: Neuer begrenzter lokaler
  `lookupInfinitive(infinitive, engine, dictionaryForm)`
  verwendet `engine.parseWord`, prüft Zeichenlänge
  (max. 80), Unicode-Buchstaben, Resultatstruktur und
  Übereinstimmung des analysierten Wortes. Nur nach
  explizit unabhängig geprüftem Viererbeleg entstehen
  trainierbare Infinitiv- und Stammgruppenkarten; weiterhin
  **keine** allgemeine lateinische Tempuskonjugation.
- Tests in `tests/latin-principal.test.js` erweitert:
  Commits `bd08cbd` und `53a7091`.
  Neu isoliert durch Modell-Testcode ausgeführt:
  5/5 für Lexikonzuordnung, diakritische Übereinstimmung,
  Stamm-Konflikt und Deponentium; 3/3 weitere für
  lokale API-Eingabe, ungültige Zeichen und Antwortmismatch.
  Nach Aktualisierung JS-Syntax kompiliert.
  **Kein echter Node-`--test`-Prozess, keine
  Browser- und Wörterbuch-Laufzeitprüfung nachgewiesen.**

### Unveränderte Sperren / Nächster freigegebener Schritt
1. GitHub-Actions-WASM-Job oder reproduzierbares
   extern gebautes Artefakt inklusive SHA256 erhalten,
   damit die fünf Sprachadapter mit echten Daten getestet
   werden können. Keine unbelegte Erfolgsbehauptung.
2. Latein-Bibliothek mit lokalem Datenpaket und
   geklärter Datenlizenz, Provenienz und Größe aufbauen;
   Quellenkonvention zu vierter Form, deponentischen
   und fehlenden Stammformen unabhängig validieren.
3. Alle übrigen Entwicklungsauflagen aus dem Handoff:
   echte App-Browser-, Scan-, Supabase-, Offline- und
   Zwei-Geräte-Regressionen, Transaktionssicherheit
   beim Buch-Merge, kontrollierte Migration der Live-Bücher,
   fachlich geprüfte Übersetzungen und vollständige
   Verbkataloge für alle Sprachen.
4. Erst nach diesen Prüfungen `vocprog-test/main`
   veröffentlichen und Nutzerabnahme einholen;
   produktives `main` und finale Analyse-Resets
   weiterhin nicht anfassen.


## Fortsetzung 2026-11-12 – bestätigte niederländische Perfektbildung und lateinische Viererformen

**Freigabe/Branch:** Bereits freigegebene VOC-0.5-Entwicklung auf
`develop/offline-supabase-20261105`. **Kein öffentlicher
Testbuild veröffentlicht und keine produktive Datei geändert.**
`vocprog-test/main` bleibt v0.4, `vocprog/main`
bleibt separat. Kein Analysedaten-Reset.

### Prüfung des vorherigen Stands
- Ausgangs-Handoff `984727ca8a5597e5f47ed73fa472b8f78d393710`,
  WASM-Adapter `c809c95c43e4f1777d83728f8cb085c9ce874774`.
- GitHub-Workflow des WASM-Builds weiterhin nicht
  als erfolgreich bestätigt: zu Commit `02fc5ce`
  weder Run noch Commit-Status gemeldet. Im verfügbaren
  Container Node.js 22 installiert, `cargo`/
  `rustup`/`wasm-pack` fehlen, direkter GitHub-
  Download via DNS nicht erreichbar.
  **Kein kompiliertes WASM-Asset vorhanden, kein
  Browsertest des ablaut-Pakets durchgeführt.**
- Upstream ablaut 0.11.0 `src/nld.rs` und
  `data/nld/verbs.tsv` auf GitHub-Quellcommit
  `ca8d2212c20d7e5ae83771dc3fe37023fda9c7cc`
  geprüft: Flexionsdaten für NL vorhanden, aber
  keine umfassende lexikalische Auxiliarentscheidung.

### Neue Arbeit
- `vocprog-wasm-adapter.js`, Commit `11e9840`:
  Niederländisch jetzt drei direkt erzeugbare Schulzeiten
  einschließlich `zal/zult + Infinitiv`.
  Perfekt/Plusquamperfekt zusätzlich **nur mit
  eingegebener, überprüfter Hilfsverb-Evidenz pro
  Bedeutung und Verwendung**, `hebben`/`zijn`.
  Datenvertrag:
  `dutchAuxiliaryEvidence = {auxiliary, context,
  source, reviewed:true}`. Fehlt ein Feld, bleiben
  die beiden Zeiten als `missing` markiert.
  Hinweis: Das Flag allein garantiert keine
  externe Validierung; die Zuweisung wird
  später an ein echtes überprüftes Lexikon gebunden.
- `tests/wasm-adapter.test.js` `98e95ce`:
  Zukünftige Formen, standardmäßige Sperre bei
  fehlendem Auxiliar, erfolgreiches `hebben`/
  `zijn`, Ablehnung ungültiger Angaben.
- Französische Kontraktionen präzisiert:
  `que j'aille`, `qu'il/elle/on aille`,
  `j'allais`, commits `683ae7c`/
  `a2554f2`, Regression in
  `tests/vocab-schema.test.js` `49111f2`.
- **12/12 isolierte** JS-Checks zu diesen Punkten
  bestanden, Syntaxprüfung ohne Befund. Weder
  echter Browser-/Cloud- noch WASM-Lauf.
- Latein: GitHub `kigawas/whitakers-words`
  (Version `0.1.3`, MIT) Quellcode geprüft:
  `WordsEngine.parseWord()` liefert
  `WordAnalysis.results[*].de` mit
  Wörterbuch-`DictionaryEntry` und
  `dictionaryForm(de)` erzeugt citation forms.
  Im README etwa `amo, amare, amavi, amatus`.
  **Wichtig:** Die vierte Wörterbuch-Form
  `amatus` ist nicht automatisch die vom Nutzer
  gewünschte Supinform `amatum`. Bei Deponentien
  sind Stammformen anders. Deshalb keine
  einfache ungeprüfte `-us`→`-um`-Regel.
- `vocprog-latin-principal.js` Commit `7686f5d`:
  konservativer, lokaler Principal-Parts-Adapter
  zur quellgebundenen Extraktion, ohne Remote-
  Aufrufe; akzeptiert nur eindeutig bestimmten
  Verb-Lexikoneintrag. Bis unabhängig geprüfte
  vier Stammformen vorliegen `trainable:false`.
  Danach nur zwei **getrennte Lernkarten**:
  Infinitiv und Vierergruppe. Deponentien,
  Perfektdefektiva und Mehrdeutigkeiten werden
  getrennt blockiert; komplette lateinische
  Schulzeitformen sind **noch nicht erzeugt**.
  Adapter noch nicht in `index.html` eingebunden.
- `tests/latin-principal.test.js`,
  Commit `0df63df`: Regressionen für eindeutige/
  mehrdeutige Einträge, unabhängige Viererform-
  Prüfung, getrennte Lernkarten und Deponentien.
- **8/8 isolierte** lateinische Adapterprüfungen
  bestanden; echte Whitaker-Laufzeit und
  importierte Lexikondaten noch nicht getestet.
- Quellen direkt: <https://github.com/kigawas/whitakers-words>
  (README, `package.json`, `LICENSE`,
  `src/lib/index.ts`, `src/lib/engine/engine.ts`,
  `src/lib/formatter/dictionary-form.ts`),
  daneben <https://github.com/CIRCSE/collatinus>
  als alternativer, GPL-3.0-lizenzierter
  Konjugationstabellen-Generator.

### Verbleibende Sperren
1. `ablaut` WebAssembly-Workflow tatsächlich
   erfolgreich ausführen, Bundle verifizieren und
   lokale E2E-/Browser-Tests durchführen.
2. NL Hilfsverb-Informationen lexikalisch
   fundiert hinterlegen und kontextuell sauber
   unterscheiden. Bis dahin bleiben Perfektformen
   ohne Reviewed-Evidence gesperrt.
3. Lateinische Viererstammformen aus tatsächlichem
   Wörterbuchlauf / verlässlicher Quelle validieren;
   anschließend vollständige Konjugationen
   inkl. Deponentien und fehlenden Formen.
4. Deutsche KI-Übersetzungen fachlich prüfen,
   Buchmerge und Cloudanalyse mit realen Daten/
   Offlinegeräten testen; produktive Buchmigration
   erst nach Backup und Live-Exportdateien.
5. Das bestehende öffentliche Testprogramm und
   das produktive Programm bleiben unberührt,
   bis die vollständige Testversion abgenommen ist.

## Entwicklungsblock 2026-11-12 – Niederländische Schulzeiten / Latein-Ressourcenprüfung

**Stand:** Weiterarbeit auf expliziter früherer Gesamtfreigabe. Noch KEIN
für den Nutzer freigegebener VOC-0.5-Testbuild; nur Entwicklung auf
`develop/offline-supabase-20261105`. Keine Cloud-Datenbank
zurückgesetzt, keine produktive App geändert und
`vocprog-test/main` nicht überschrieben.

### Abgleich beim Wiedereinstieg
- `PROJECT_HANDOFF.md` `984727ca8a5597e5f47ed73fa472b8f78d393710`,
  `vocprog-wasm-adapter.js` `c809c95c43e4f1777d83728f8cb085c9ce874774`,
  WASM-Build-Workflow `e142593f86ddd5669f5652054051ecd540f1c71c`,
  Adaptertests `e207dd6c91672452d62c6dc8d862de4a5826cb72`.
- GitHub-Connector zeigt für den Baucommit `02fc5ce`
  weder bestätigte passende Workflow-Runs noch Status-Checks.
  Im Container `node` vorhanden, aber kein `cargo`,
  `rustup`, `wasm-pack`; DNS zu `github.com` nicht
  erreichbar. Kein WASM-Build oder Artifact bestätigt.

### Implementiert
- `vocprog-wasm-adapter.js`, Commit `11e9840`:
  NL Zukunft `onvoltooid toekomende tijd` mit
  `zal/zult/zal/zullen/zullen/zullen + infinitief`.
  Damit ohne Kontextnachweis 3/5 Zeitformen sicher
  modellierbar (Präsens, Vergangenheit, Zukunft).
- NL `voltooid tegenwoordige tijd` und
  `voltooid verleden tijd` können nur erzeugt werden, wenn
  der Aufrufer mit `dutchAuxiliaryEvidence` ausdrücklich
  `auxiliary` (`hebben` oder `zijn`), nichtleere
  `source` und `context` sowie `reviewed:true` übergibt.
  Ohne dieses durch einen überprüften Wörterbuch-/Kontextschritt
  zu beschaffende Evidenzobjekt gelten die beiden Zeiten
  als **missing**. Solche Flags sind ein Datenvertrag,
  **keine automatische unabhängige externe Validierung**.
  Bei `werken` ergeben sich z. B. `heb gewerkt`/
  `hadden gewerkt`; bei `lopen` je nach Kontext
  `heb gelopen` oder `ben gelopen`.
- `tests/wasm-adapter.test.js`, Commit `98e95ce`:
  NL Zukunkt, fehlende Hilfsverbevidenz, `hebben`,
  `zijn`, Manipulations-/Ungültigkeitsfälle.
- Französische Subjonctif-Oberflächenformen
  korrigiert (`a2554f2`): `que j'aille`,
  `qu'il/elle/on aille`, `j'allais`.
  Regression in `tests/vocab-schema.test.js`
  (`49111f2`).

### Prüfergebnisse und Risiken
- 12/12 separat ausgeführte JS-Prüfungen bestanden
  (NL `hebben`/`zijn`, Future, Ablehnung fehlender
  Verifikation und Latein-Lookup, französische
  Kontraktionen); JavaScript-Syntax parsebar.
- Diese Prüfungen sind isolierte Modul-/Mock-Fälle;
  Browser-, Gemini-, echter WASM-, Supabase-,
  Offline- und Zwei-Geräte-Test **nicht** nachgewiesen.
- Keine automatisch aus Hilfsverbregeln oder Simple-Tense-
  Endungen abgeleitete Gewissheit für alle NL-Verben.
  Kontextuell wechselnde Verben brauchen Lexikoneinträge
  mit Bedeutung/Konstruktion.

### Lateinquellen – evaluierte Kandidaten, noch nicht integriert
- `kigawas/whitakers-words`, Version `0.1.3` im
  gelesenen `package.json`, Lizenz MIT
  (`LICENSE` über GitHub-Connector gelesen):
  TypeScript-Portierung von William Whitakers
  `WORDS` mit umfangreichem Latin-Lexikon,
  Wortformanalyse, Konjugations- und Flexionstags,
  Browser-Demo. Muss geprüft werden, ob eine API
  die **vier Stammformen** pro Lemma sowie vollständige
  Schulkonjugationen und Deponentien eindeutig ableitet.
  Keine unbelegte Behauptung, dass ein Analysator
  automatisch ein vollständiger Paradigm-Generator sei.
  <https://github.com/kigawas/whitakers-words>
- `CIRCSE/collatinus`: nach Projektbeschreibung
  explizite Konjugationstabellen und ~11.000 Lemmata,
  allerdings GPL-3.0; C++/Qt plus zusätzliche
  Browser-Portierungs- und Lizenzabwägung.
  <https://github.com/CIRCSE/collatinus>
- `CIRCSE/LEMLAT3` aufgrund CC BY-NC-SA 4.0
  lizenzrechtlich eingeschränkt; nicht integriert.
- Latein nur bei separat fachlich überprüften
  Vier-Stammformen-Lernkarten für VOC, niemals allein
  aus Infinitiv scheinbar vollständig erfinden.

### Nächste bereits freigegebene Schritte
1. GitHub Actions WASM-Build-Ergebnis/Artefakt prüfen, sobald
   tatsächlicher Workflow-Zugriff oder benutzbares Artefakt
   vorhanden; Download, SHA256, Node- und Browser-Fixtures.
2. Latein-TypeScript-Paketquellen bis zur konkreten
   Lexikon-/Flexions-API verfolgen, daraus einen
   konservativen Principal-Parts-Datenvertrag
   und Testfälle ableiten.
3. Erst nach bestandener E2E-Prüfung den vollständigen
   neuen Build auf `vocprog-test/main` veröffentlichen.
   Produktivübernahme braucht gesonderte Nutzerabnahme;
   Analyse-Reset erst vor dieser Übernahme.

## Nächster freigegebener Schritt – WASM-Buildvorbereitung und Sprachadapter (2026-11-12)

**Ziel / Status:** Reproduzierbare Integration der etablierten
`ablaut`-Konjugationsbibliothek vorbereiten; weiterhin **kein**
öffentlicher v0.5-Testbuild und keine Produktiv- oder Datenänderung.

### Repositoryabgleich
- Arbeitsrepo `andreas-nigl/vocprog`, Branch
  `develop/offline-supabase-20261105`.
- Zu Beginn geglichen: `PROJECT_HANDOFF.md`
  Blob `a4b21779eb283ef1faa043d4a824ba80d8bf5e86`,
  `index.html` `da5ff459876bb63563e58cdbe87f1c80375d0ed4`,
  `vocprog-enhancements.js`
  `9bf208cf4fb726709eeb4a1f1faa4ecdf13c218a`,
  `vocprog-fr-reference.js`
  `ec49b5a5bd3441c592a4e7e21c3acb047374f85b`.
- `main` und `vocprog-test/main` bleiben ohne diese
  Neuentwicklungen.

### Neuer WASM-Build (nur im Entwicklungsbranch)
- Externes Open-Source-Projekt `ablaut-dev/ablaut`, Version
  `0.11.0`, spezifischer **Quellcommit**
  `ca8d2212c20d7e5ae83771dc3fe37023fda9c7cc`
  durch GitHub-Commit-Suche ermittelt und im Build festgehalten.
- `.github/workflows/voc-wasm-build.yml` hinzugefügt,
  Commit `02fc5ce`:
  nur bei Änderung der Build-Workflowdatei auf dem
  Entwicklungsbranch oder manuell; festes Ubuntu 24.04;
  `rustup target add wasm32-unknown-unknown`,
  `cargo install wasm-pack --version 0.14.0 --locked`,
  getrennte wasm-pack Builds für Web und Node.js;
  native Node-WASM-Fixtures
  `manger`/`aller` (FR), `go` (EN),
  `lopen` (NL), `hablar` (ES), `falar` (PT);
  SHA-256-Manifest des Browserbundles; Artefakt mit 14 Tagen
  Aufbewahrung; **kein automatischer Deploy**.
  actions/checkout durch vollständige Commit-SHA gepinnt.
- Laufzeit- und Artefaktstatus: GitHub-Commit-Status-API
  und von Connector sichtbare Workflow-Suche geben derzeit
  **keinen bestätigten erfolgreichen Lauf** zurück.
  Im lokalen Container kein Rust/`cargo`/`wasm-pack`
  und kein externer GitHub-Netzzugang. **Es wurde
  kein WASM-Binary generiert, heruntergeladen oder
  als verfügbar ausgegeben.**

### Sprachübergreifender, nicht aktivierter Adapter
- `vocprog-wasm-adapter.js`, Commit `61cd3e9`;
  Korrektur `e5b36f1`, im Entwicklungsbranch erstellt,
  **noch nicht von `index.html` eingebunden**. Pure JS,
  keine externe Laufzeitkommunikation, keine deutschen
  Übersetzungen oder ungesicherte Ersatzformen.
- Schnittstelle `VOCWasmAdapter.create(wasm.conjugate)` mit
  Sprachcodes `fra/eng/spa/por/nld`, adaptierte
  Tempus-/Modusnamen des VOC-Schulkatalogs;
  strukturiertes `missing` für nicht vorhandene Zeitformen.
- FR 7/7 Kategorien aus den Feldern des ablaut-FR-Tables.
  ES 8/8 und PT 7/7 konzeptionell auf die verifizierten
  Original-Feldnamen abgebildet.
- EN 9/9: Simple Present/Past, Present/Past Perfect,
  Will-Future aus Bibliotheksfeldern, Progressives mit
  `am/is/are`/`was/were` + Present Participle,
  Going-to-Future und Conditional per
  klaren Hilfsverb-Kompositionsregeln.
  Satzkontext/Sonderfälle weiterhin zu prüfen.
- NL nur 2/5 sicher abgedeckte Tabellen:
  Präsens und Vergangenheit (singulär/plural),
  Principal parts separat; Perfekt, Plusquamperfekt
  und Zukunft **absichtlich als 3 fehlende Tempora**.
  Hilfsverbauswahl `hebben`/`zijn` nicht erraten.
- LA nicht unterstützt: Ausnahme statt irreführender
  Konjugation; lateinische Sonderquelle weiterhin offen.
- `tests/wasm-adapter.test.js`, Commit `cfc8482`,
  enthält explizite Regressionen für fünf Sprachen,
  Fehlstellen und Latin-Ausnahme.
- **Isoliert ausgeführt:** 10/10 Adapter-Funktionschecks
  bestanden (FR, EN, ES, PT, NL, Latin-Ablehnung,
  Incomplete-Slots). Keine echte WASM-Laufzeitprüfung.

### Offene Abnahmen, Risiken und Fortsetzung
1. Reproduzierbaren GitHub-Actions-WASM-Lauf tatsächlich
   bestätigen; Artefakt herunterladen und SHA-256 überprüfen.
   Danach Browser-/Node-Regressionsprüfungen mit echten
   WASM-Daten. Nur geprüfte Artefakte ins App-Repo übernehmen,
   dabei Drittquellenlizenz und Version dokumentieren.
2. NL Hilfsverben für zusammengesetzte Zeiten verlässlich
   bestimmen; Latein-Morphologie gesondert integrieren.
3. Fachliche Abnahme aller 6 Sprachkataloge und der
   deutschen Übersetzungen; unbekannte Verben nicht
   stillschweigend als geprüft kennzeichnen.
4. Rückwirkende Server-Buchumbenennung und Import der
   alten Live-App-Bücher ausschließlich mit vollständigem
   Sicherungs-/Merge- und Mehrgeräte-Test.
5. Finaler Testbuild auf `vocprog-test/main` erst
   nach API-, Browser-, Offline-, Synchronisierungs-
   und E2E-Prüfung. Produktive App weiterhin unverändert.


## Entwicklungsfortsetzung 2026-11-12 – lokaler FR-Referenzmotor und sichere Kartenpersistenz
**Status:** durch vorausgehende Gesamtfreigabe gedeckte Teilimplementierung,
keine neue Nutzerabnahme; **nicht deployen** bis vollständige Daten- und
Funktionsregressionen, `vocprog-test/main` weiter v0.4.

### Tatsächlich implementiert und gesichert
- GitHub Repo `andreas-nigl/vocprog`, Entwicklung
  `develop/offline-supabase-20261105` (früherer Handoff-Stand
  `1fb281f` überprüft).
- **Lokaler, dependency-freier französischer Referenzbaustein:**
  `vocprog-fr-reference.js`, Commit `a40e8f5`.
  Strikt freigegebener Umfang: **vier Pilotverben**
  `aller`, `parler`, `manger`, `commencer`.
  Pro Verb sieben Schulzeitformen mit je sechs Personalformen,
  Infinitiv, Participe passé, Impératif, Regularität, Auxiliar-
  und Accord-Metadaten. Unbekannte Verben/Tempora → `null`
  bzw. `not-verified`, **niemals geraten**. Beispiel:
  `manger` mit `nous mangeons`, `nous mangions`,
  `commencer` mit `nous commençons`,
  `aller` mit `allé(e)(s)`.
- Offizielle Grammatikreferenzen für die Stichprobe:
  - <https://www.dictionnaire-academie.fr/conjuguer/A9M0490>
  - <https://www.dictionnaire-academie.fr/conjuguer/A9C3106>
  - <https://www.larousse.fr/de/konjugation/franzosisch/manger/5950>
  - <https://www.larousse.fr/fr/conjugaison/francais/parler/11043>
- HTML lädt `vocprog-fr-reference.js` vor
  `vocprog-enhancements.js` (Commit `e4735b7`);
  SW-Cache-Manifest auf `vocprog-staging-20261112-v7`
  und Offline-Asset erweitert (`206fbe8`).
  **SW nicht real auf Mobilgerät verifiziert.**
- Entwicklungs-Scan verwendet lokalen FR-Referenzabgleich gegen
  tatsächlich vom Scanmodell ausgelesene Personalformen;
  Widersprüche werden verworfen und als Zähler angezeigt
  (`978e708`, `69b4658`). Für nicht unterstützte
  Verben bleibt ein explizites `scan-unverified`, das
  nicht stillschweigend für den Trainer freigegeben wird.
- Für eines der vier Pilotverben wird nach erkannter
  Grundvokabel optional eine zusätzliche Gemini-Anfrage nur
  zur **deutschen Übersetzung** ausgelöst. Die fremdsprachigen
  Formen kommen AUSSCHLIESSLICH aus dem lokalen Referenzmotor;
  die Antwort wird strukturell auf alle 7×6 Formen plus
  Imperativ und Partizip geprüft. Erfolgsfall: 42 Zeitform-
  karten + 2 Grundformkarten + gesonderter Infinitiv
  im vorhandenen sprachspezifischen Verbenbuch
  (`5291766`, `5d73552`).
  Fehlender API-Key, Offline, API-Fehler oder unvollständiges
  Modell-JSON führen zu KEINER spekulativen Ersatzkonjugation;
  der Infinitiv und der Referenzdatensatz bleiben erhalten.
  Jede KI-Übersetzung trägt `translationVerification:
  ai-generated-unverified`: strukturell geprüft heißt
  **nicht fachlich unabhängig verifiziert**.
- Überschneidungen mit vom Foto gelesenen gültigen
  Personalformen werden vermieden (`c125a7a`).
- **Kritischen Datenverlustfehler behoben:** Legacy-Merge
  verwirft nicht länger `verbId`, `lemma`,
  `verification`, `translationVerification` und
  `regularity`. Deduplizierung nach Verb-ID/Art/
  Zeitform/Person statt allein nach identischer Schreibweise,
  sodass z. B. `je mange` in Présent und Subjonctif
  getrennte Karten bleiben (`c43e3d6`, `4016ff1`).
- Verbtabelle zeigt Regularität nur oben im Titel;
  kompakte Imperativantworten mit und ohne Pronomenzusatz
  sowie mit/ohne Leerzeichen um Slash akzeptieren
  (`df4f4fb`).
- Lernanalyse zählt nun Vorleseklicks auf Frage UND
  Antwort (`958fe84`).

### Prüfergebnisse und Testartefakte
- 15/15 isolierte FR-Referenzprüfungen bestanden.
  Includes `manger`/ `aller`/ `commencer`,
  alle sieben Zeitformen, Accord, vorgegebenen Fehler
  `nous mangons` verworfen, unbekanntes Verb/Tempus
  ausdrücklich nicht verifiziert.
- Vier Verben × (42 Zeitformkarten + 2 Grundformkarten):
  isolierte Kartenstruktur und Einzigartigkeit erfolgreich.
- 7/7 isolierte Übersetzungsadapter-Prüfungen bestanden,
  inklusive Ablehnung fehlender Werte/HTML in
  KI-generierten deutschen Texten.
- 3/3 isolierte Legacy-Merge-Prüfungen bestanden:
  Zeitkarten getrennt, Doppeleintrag unterdrückt,
  Verifikationsmetadaten erhalten.
- HTML Inline-JS, Erweiterungs-JS und SW parsebar.
- Neue Testdateien:
  `tests/fr-reference.test.js` (`f4d58b8`);
  `tests/vocab-schema.test.js` (`02c85fe`).
- GitHub Actions Workflow
  `.github/workflows/voc-unit-tests.yml`
  (`a4ed5d0`), Node-Testlauf nur auf
  `develop/offline-supabase-20261105`,
  GitHub `actions/checkout` durch unveränderliche SHA
  gepinnt, `contents: read` und 5-Minuten-Limit.
  **Workflow-Erfolg nicht bestätigt**, kombinierte Commit-
  Status-API meldete keine Statusobjekte. Keine
  Behauptung eines erfolgreichen GitHub-CI-Laufs.
- Öffentliches `vocprog-test/main/index.html` zuletzt
  Blob `710a8317d3177864e6d5dcbe8ba08c717271977f`,
  produktives `vocprog/main/index.html`
  Blob `4ddacd1f1c84ae4dc7a8b60128657545c212b681`.
  Keine Veröffentlichungsänderung in diesem Block.

### Sperrende Restpunkte für den vollständigen VOC-0.5-Testbuild
1. Für **alle französischen Verben** und die weiteren fünf
   vorhandenen Sprachen eine vollständig geprüfte Flexions-
   Engine / Ressourcen integrieren. Der eingeschränkte
   Pilotmotor (4 Verben) ist KEIN Ersatz für ablaut-WASM
   und noch keine allgemeine Verbkonjugation.
2. Deutscher Übersetzungsinhalt der vollständigen Formen
   durch echte Scan-/KI-Fälle und fachliche Probe überprüfen;
   derzeit nur JSON-Strukturtests, keinerlei Live-Gemini-
   Prüfung. KI-Sprachübersetzung ist keine unabhängige
   lexikalische Verifikation.
3. Umfassende Browsertests (Kamera, Scan, Training, Tabelle,
   Nutzerinteraktion, Offline-Neustart, Sync) und Abnahmetests
   auf mindestens zwei Geräten.
4. Merge-Transaktion bzw. idempotente Servermigration
   gegenüber gleichzeitigen/stale Clients absichern.
   Öffentliche Cloud bleibt nach Nutzerentscheidung
   grundsätzlich manipulierbar; kein Authentifizierungs-
   oder Row-Level-Eigentümerschutz.
5. Vorhandene Cloudbücher gemäß Nomenklatur umstellen
   und Vokabeln der alten Live-App erst nach echten
   FR-/EN-Exporten und Bestandsvergleich importieren.
   **Keine Datenbankmigration ausgeführt.**
6. Einmaliger Lernanalyse-Reset erst unmittelbar vor
   freigegebener Produktivübernahme, nicht während
   aktueller Entwicklung.
7. Offline-Standalone nicht neu gebaut; PWA-Testbuild
   v0.5 noch nicht auf öffentliche Testseite übertragen.

### Nächster freigegebener Schritt
- Reproduzierbaren, lokalen WASM-Konjugationsmotor mit
  abgedeckten Schulzeitformen für FR/EN/ES/PT/NL
  integrieren; für Latein separate zuverlässige Quelle.
- Sprachform-Ausgabe + deutsche Referenzübersetzungen
  für die Kernfälle gegen offizielle Konjugationstabellen
  und echte Scanbilder prüfen. Vor Deployment
  Konflikt-/Migrationssicherheit abschließen.

## Referenzmotor-Prüfung – 2026-11-12 (Fortsetzung, noch kein Build)
- Auf Grundlage des bestehenden freigegebenen Entwicklungsschritts nach
  v0.5-Implementierungszwischenstand geprüft: `ablaut-dev/ablaut`
  (<https://github.com/ablaut-dev/ablaut>), Rust-Paketversion
  `0.11.0` im aktuell gelesenen `Cargo.toml`, Lizenz
  `MIT OR Apache-2.0`, optionales `wasm`-Feature.
- Die quelloffene Schnittstelle in `src/wasm.rs` liefert
  `conjugate(infinitive, lang)` als strukturierte JavaScript-Objekte
  (`serde_wasm_bindgen`), grundsätzlich geeignet für lokalen
  Browserbetrieb **nach erfolgreichem Build und Qualitätstest**.
  Verifizierte Implementierungsschnittstellen per Quelltext:
  - Französisch `src/fra.rs`: `infinitive`, `auxiliary`,
    `past_participle`, `imperative[3]`, `present[6]`,
    `imperfect[6]`, `passe_compose[6]`,
    `plus_que_parfait[6]`, `future[6]`,
    `conditional[6]`, `subjunctive_present[6]`.
  - Englisch `src/eng.rs`: `infinitive`, `past`,
    `past_participle`, `present_participle`,
    `present_row[6]`, `past_row[6]`,
    `present_perfect_row[6]`, `past_perfect_row[6]`,
    `future_row[6]`. **Keine eigenen Felder für
    Present Progressive/Past Progressive/Going-to-Future
    oder Conditionals:** Kompositionsregeln erforderlich.
  - Spanisch `src/spa.rs`: `gerund`, `past_participle`,
    `imperative[5]`, Präsens, Präteritum,
    Imperfekt, Perfecto compuesto, Pluscuamperfecto,
    Futur, Conditional, Presente de subjuntivo.
  - Portugiesisch `src/por.rs`: `gerund`, `past_participle`,
    `imperative[5]`, Presente, Imperfeito, Pretérito,
    Condicional, Futur, Perfeito composto,
    Mais-que-perfeito composto, Conjuntivo presente.
  - Niederländisch `src/nld.rs`: `present[6]`,
    `past[2]`, `past_participle`, `imperative`.
    **Keine vollständigen zusammengesetzten Zeiten** als
    Tabellenfelder; zusätzliche Regeln und Auxiliarwahl nötig.
- **Latein fehlt** in den durch `Lang` unterstützten veröffentlichten
  Sprachen; eigener geprüfter Konjugationsmotor und Quellenlizenz nötig.
- Die im Projekt-README beworbenen 100-%-Scores beziehen sich auf
  jeweilige Vergleichsmengen der unabhängigen Lexika, nicht auf
  alle denkbaren Schulparadigmen bzw. die benötigte VOC-Integration.
  Ohne separate VOC-Falltests keine uneingeschränkte Qualitätsfreigabe.
- **Kein WASM eingebunden oder generiert.** Lokaler Buildversuch
  hier blockiert: kein Rust/`cargo`/`wasm-pack` installiert;
  Netzwerkzugriff auf npm im Container nicht verfügbar.
  Keine fremde Laufzeitbibliothek blind über CDN eingebunden.
- Weitere Arbeiten: WASM-Bundle mit fixierter Quelle, Prüfsummen
  und offline verfügbaren Artefakten erzeugen, strukturierte
  Schulzeit-Adapter testen, EN/NL fehlende analytische Zeiten
  korrekt zusammensetzen, eigenständige Lateinquelle evaluieren;
  erst dann vollständig erzeugte Konjugationen zulassen.
- Zusätzliche Prüfung: zuvor gesicherter Entwicklungsstand
  `index.html` (SHA `ebd7ca67126c532adf58c599d50b21b4f058795c`),
  Erweiterung (SHA `e8ee31cbbb0937d9815a51ed202ab5de9b147420`)
  und SW (v6) vor Recherche abgeglichen. Keine Änderung
  an `vocprog-test/main` oder produktivem `vocprog/main`.

## Entwicklungszwischenstand nach Gesamtfreigabe – 2026-11-12
**Freigabe:** Gesamter VOC-Entwicklungsblock durch Nutzer ausdrücklich freigegeben.
**Release:** UNVOLLSTÄNDIG; bis zur Fertigstellung/Abnahmetests KEINE
Veröffentlichung dieses Zwischenstands auf `vocprog-test/main` oder
`vocprog/main`. Die öffentliche Testversion bleibt weiterhin v0.4.

### Gesicherter Entwicklungsstand
- Repository `andreas-nigl/vocprog`, Branch
  `develop/offline-supabase-20261105`.
- Änderungen im Entwicklungsbranch (Commitreihenfolge):
  - `aaf6dab`: HTML für Merge-Dialog, Verben-Zeitform, Trainer-Tabelle,
    Auswahlbuch in der Lernanalyse und Überschrift `LERNANALYSE`.
  - `ef2ca74`: Unterscheidung `vocab`/`verbs`, UI-Namensschema
    `– Vokabeln/Verben (Sprache)`, je Sprache nach Möglichkeit
    Wiederverwendung eines Verbenbuchs.
  - `6fceb76`: sprachspezifische Kernzeitkataloge und
    Verb-Lern-/Tabellenansicht; abgedruckte Konjugationen filterbar.
  - `fafbdc5`: Lernanalyse pro Buch; Abfragen, korrekte Antworten (%),
    Vorlesen; nach Buchtyp gruppiert; dreifaches Antippen der
    Kategorieüberschrift erzeugt synchronisierbaren Reset-Epoch.
  - `9c45602`: Merge von genau 2 Büchern mit Sprach-, Typ-, Seiten- und
    Inhaltsprüfung und Backup-Download; Tombstones, Event-Übertragung.
  - `74feabc`: CSS für dezentes Merge-Symbol, Lernanalyse/Tabellenbereich.
  - `6512b27`: getrennte bisherige Vokabel-Bewertung erhalten,
    zweisprachige Zeitform-Tabellenüberschriften ergänzt.
  - `e7bd992` + `1e22c4b`: Scan erkennt Verb-Infinitive auch bei
    einzelnen Vokabeln, legt diese einmal pro Sprache in Verbenbuch ab.
    **Nur Buchbelege und gedruckte Konjugationen, noch keine
    freigegebene automatische Vollkonjugation aller Schulzeitformen.**
  - `640de49`: alte Datenimporte strikt in Vokabelbücher.
  - `86ae2f4`: neues Verbenbuch wird erst nach tatsächlicher
    Spracherkennung angelegt/wiederverwendet; Scan-Vormerkung
    bleibt lokal über Neustart erhalten.
  - `1942650`: Zeitform-Auswahl speichert neuen Select-Wert vor dem Neuaufbau; verhindert Rücksprung auf veraltete Auswahl.
  - `95cb9a6` + `cfe0f44`: Buch-Merge verweist bei inhaltsgleichen
    Duplikaten auf bestehende Vokabel-IDs und berücksichtigt zuvor
    zurückgesetzte Analysedaten.
- **Nicht geändert:** Die produktive Anwendung `main` hat die
  experimentellen Formulare nicht. Die öffentliche Test-App
  `vocprog-test/main` behält unverändert ihre v0.4-Dateien.
  Letzter geprüfter Test-JS-Blob `b9ced8b6bde895f72b245136facfbc4037c25bef`.
- **Offline:** SW-Datei im Entwicklungsbranch noch Version v6,
  bewusst nicht aktualisiert, weil kein freigabefähiger Build
  veröffentlicht wurde. Standalone nicht gebaut.

### Durchgeführte Prüfungen
- HTML-Inline-JS und Erweiterungs-JS parsebar, SW-JS parsebar.
- HTML: 14/14 neue erforderliche DOM-Elemente vorhanden.
- CSS: 6/6 zentrale neue Selektoren vorhanden.
- Sprachkataloge vorhanden für FR (7), EN (9), ES (8), PT (7),
  NL (5), LA (6) Zeitform-Optionen.
- Buchname: alte `Konjugationen`-Bezeichnung -> Anzeige als
  `Verben`; vorhandene Vokabelnamen korrekt suffixiert,
  keine doppelten Namenssuffixe (4 isolierte Checks).
- Merge isoliert: unterschiedliche Sprachen und Typen gesperrt,
  gleicher Inhalt auf gleicher Seite zulässig, widersprüchlicher
  Inhalt auf gleicher Seite gesperrt, nichtüberlappende Seiten zulässig.
- Statik: nach Änderung bisherige Vokabelantwortprüfung weiter
  referenziert; Backuppfad vor Merge-Datenänderung; persistente
  Analyse-Resets als special records vorhanden.
- **Noch NICHT geprüft:** Browser-Rendering/Interaktion, Kamera,
  Gemini-API, Offline-Wiederanlauf, echte Supabase-Schreiboperationen,
  konfliktfreier Mehrgeräte-Merge, Statistik-Reset über zwei
  Geräte, Export/Import-Roundtrip und vollständige grammatische
  Genauigkeit. Keine Nutzerabnahme der neuen Funktionen.

### Sperrende offene Implementierungs- und Sicherheitslücken
1. Zu JEDEM erkannten Verb vollständige Schulstoff-Formen für alle
   6 Sprachen erzeugen und **unabhängig** grammatisch validieren.
   Aktuell nur gedruckte Verbformen und erkannte Infinitive;
   keine generierten, unkontrollierten Formen als korrekt speichern.
   Möglicher lokal einbindbarer Referenzmotor:
   `https://github.com/ablaut-dev/ablaut` (MIT/Apache-2.0,
   Rust/WASM, FR/EN/ES/PT/NL, nicht LA), zunächst Quellstand,
   API, Qualität, Build, Lizenz und Offline-Nutzung prüfen;
   lateinische Flexion benötigt weiteren Beleg/Ressource.
   Fremde Online-Konjugations-APIs nur nach gesonderter Risiko-/
   Datenschutz-/CORS-/Lizenzprüfung; keine ungeprüfte
   Abhängigkeit einbauen.
2. Vollständiges lernbares Datenmodell der Pflichtgrundformen:
   für FR Infinitif/Participe passé/Impératif inklusive Accord;
   EN/NL getrennte Dreiergruppe und Infinitiv/Partizip;
   EN `-ing` als separate Karte; ES/PT Einzelkarten;
   LA Vierergruppe plus Infinitiv. Tabellen müssen dies
   vollständig in 2 Spalten mit korrekter Wortteil-Hervorhebung
   zeigen. Die bisherige Tabelle rendert **nur vorhandene**
   Datensätze; spezielle Basisformen werden noch nicht erzeugt.
3. Server-Migration der alten Buchnamen/Arten noch nicht
   ausgeführt. Im UI wird die Namenskonvention lediglich
   abgeleitet. Vor Datenmigration Backup und echte
   Inventur der Cloud-Datensätze erforderlich.
4. Übernahme produktiver Browser-LocalStorage-Bücher in
   öffentliche Supabase-Tabelle noch nicht möglich ohne
   Live-App-Export (je Sprache EN/FR) und Vergleich
   gegen bestehende Test-Cloud-Datensätze.
5. Merge bisher clientseitig mit mehrere Cloud-Einzelrecords;
   NICHT atomar, Konflikte/offline Stale-Write noch nicht
   sicher geprüft. Vor Freigabe transaktionale oder
   robuste Wiederanlauf-/Idempotenzstrategie und
   reale Geräteabnahme erforderlich.
6. Datensicherungs-/Anzeigepfade, KI-Scan,
   Abfragebewertung und Reset vollständig im Browser prüfen.
   Für aktuell nicht reproduzierte Szenarien nichts als
   bestanden deklarieren.
7. Einmaliger Reset der Lernanalyse erst unmittelbar
   VOR produktiver Migration nach gesonderter
   Nutzerfreigabe, nicht während der Entwicklung ausführen.

### Nächste Schritte
- Zuerst Referenzmotor für vollständige Offline-Konjugation
  unter Berücksichtigung aller 6 Sprachen festlegen und integrieren,
  mit Tests für `manger`, `aller`, `go/went/gone` und lateinische
  vier Stammformen. Pro Formenart Validierung und Provenienz.
- Danach Merge-Transaktionssicherheit und reale E2E-/Cloud-
  Regressionen. Erst bei bestandenem Stand v0.5 auf
  `vocprog-test/main` veröffentlichen und Nutzerabnahme einholen.
- Produktives `main` und eine eventuelle Standalone bleiben bis
  zur separaten Release-Freigabe unverändert.

## Lernanalyse – Änderungsanforderung zur Freigabe (2026-11-12)
**Status: spezifiziert, Implementierung noch nicht freigegeben; keine Produktivänderung.**
- Titel `LERNANALYSE` in Versalien, gleiche Schriftgröße. Direkt darunter
  ein Buch-Dropdown, exakt ein Buch je Ansicht. Nur Statistiken dieses Buchs anzeigen.
- Vokabelbücher: Kategorien `Vokabeln`, `Einfache Sätze`,
  `KI-Spezialsätze`; unverändert seitenbasiert, aber je Kategorie
  und Seite drei Kennzahlen: (1) Anzahl abgefragter Karten,
  (2) Anteil korrekter unter **bewerteten** Antworten in Prozent,
  (3) Anzahl der Vorleseklicks. Getippt und Sprache-zu-Text gleich gewertet.
  Bei 0 bewerteten Antworten `–` (nicht 0 %).
- Verbenbücher: nur `Verben`, KEINE normalen Beispielsätze oder
  KI-Spezialsätze erstellen, trainieren oder auswerten. Kennzahlen
  aggregiert über gesamtes Buch, NICHT je Seite/Verb: Anzahl
  Abfragen, Trefferquote bewerteter Antworten, Vorleseklicks.
- Pro ausgewähltem Buch darunter `Nicht richtig beantwortet`:
  fremdsprachiger Eintrag und Anzahl falscher Bewertungen, absteigend
  nach Häufigkeit, keine Tabelle und keine buchübergreifende Liste.
  Bei identischen Oberflächenformen eindeutige Kartenidentität beachten.
- **Triple-Tap/-Click** (dreimal aufeinanderfolgend) auf jeweilige
  Kategorieüberschrift setzt ausschließlich die zugehörige
  Lernanalyse zurück; Vokabelkategorien getrennt, Verben als
  gesamter Bereich. Kein Löschen von Büchern, Vokabeln,
  Verbformen oder KI-generierten Lerninhalten. Bedienung inkl.
  Bestätigungs-/Rückmeldungsmechanismus und Ereignisabgrenzung
  vor Implementation testen.
- Zurücksetzen synchron und dauerhaft auf allen Geräten:
  bisherige `history`-Events dürfen bei Merge nicht zurückkehren
  und keine alten Zähler reaktivieren. Geeignete Lösung:
  versionierter, zentral synchronisierter Analysestand/Epoch
  pro Buch+Kategorie, mit explizitem Stichtag oder stabilem
  Reset-Ereignis (Kollisions-/Offline-Fälle testen), statt lokaler
  Zählerlöschung.
- **Einmaliger Reset aller Analysen vor finalem Produktiv-Merge**
  nach Nutzerabnahme und zusätzlich bestätigter Deployment-Freigabe,
  Lerninhalte bleiben bestehen. Zeitpunkt und Migration/Backup
  ausdrücklich dokumentieren; nicht jetzt ausführen.
- Abnahmetests: Buchwahl, Seitenstatistik und Gesamt-Verbenstatistik,
  3 Balken in korrekter Reihenfolge, Prozentsatz bei
  nur gewerteten Antworten, Vorlese-Ereignisse, Fehlerliste,
  scoped Triple-Tap-Reset, Cross-Device- und Offline-Sync,
  keine Wiederherstellung alter Lernereignisse, keine verlorenen
  Vokabeldaten, Nullstand vor Live-Übernahme.

## Beschlossene Verfeinerungen 2026-11-12 – getrennte Stammform-Abfragen, Accord und Datenübernahme

### Tabelle/Trainer je Sprache (bindende neue Regeln, noch nicht implementiert)
- In französischer Tabelle Bezeichner genau `Infinitif :`,
  `Participe passé :` und `Impératif :` vor der jeweiligen französischen
  Grundform/-gruppe; deutsche Spalte enthält nur die Übersetzung.
  Ein einziges `[rég.]`/`[irrég.]` neben dem Tabellen-Lemma oben, nicht
  in der Infinitivzeile wiederholen.
- Tabellen-Zeitüberschrift spaltenweise: z. B. `Présent` über Französisch
  und `Gegenwart` über Deutsch. Als Kleine-Abweichung nur die tatsächlich
  geänderten Buchstaben fett markieren: `nous mang**e**ons`, nicht
  die gesamte Verbform. Das gilt auch in der Imperativzeile.
- Englisch: **Infinitiv einzeln** (`to go`) und **Dreiergruppe als eine
  zusätzliche separate Lernkarte** (`go / went / gone`); daneben
  **Past participle allein** (`gone`) und **-ing-Form allein**
  (`going`). Nie `go / went / gone / going` als eine Karte.
  Vollständige Tabellenstruktur: individuelle Infinitivzeile,
  `Principal parts : go / went / gone`, `Past participle : gone`,
  `-ing form : going`, ggf. Imperativ und darunter gewählte Zeitform.
  Dopplung von Formen ist hier bewusst gewollt; beim Training
  unterschiedliche Karten-IDs / `kind`-Kennung erhalten.
  Korrektur: `do / did / done`, nicht `do / did / did`.
- Niederländisch: Infinitiv einzeln (`lopen`), *zusätzlich* eine
  Dreiergruppen-Lernkarte `lopen / liep / gelopen`, und voltooid
  deelwoord `gelopen` als separate Karte. Weitere Basisformen je
  Sprachkatalog, gewöhnlicher Imperativ nach Sprachgebrauch.
- Latein: Infinitiv allein (`amāre`) sowie **separate**
  Vier-Stammformen-Lernkarte `amō / amāre / amāvī / amātum`;
  Partizip nur dann zusätzlich, wenn grammatisch korrekt ableitbar
  und gesondert sinnvoll; keine pauschale Gleichsetzung von
  vierter Stammform und Partizip. Unregelmäßige/deponente Verben
  anhand Referenz nachprüfen.
- Spanisch und Portugiesisch: je eine separate Karte für
  Infinitiv, Gerundio/Gerúndio, Participio/Particípio, Imperativo
  (soweit vorhanden); KEINE gruppierte Dreier-/Vierer-Lernkarte.
- In allen Verbenbüchern: Dropdown „Zeitform“ exakt mit bisheriger
  Select-Gestaltung zwischen „Abfragerichtung“ und „Lernmodus“.
  Die ausgewählte Zeitfilterkarte PLUS die jeweiligen
  sprachspezifischen Pflichtgrundkarten abfragen.
- Bei gruppierten Karten Leerzeichen vor/nach Slash ignorieren,
  Reihenfolge grammatisch unterschiedlicher Stammformen bleibt
  relevant. Kein identischer Eintrag doppelt unter derselben
  Kartenfunktion; bewusst unterschiedliche Kartenrollen dürfen
  dieselbe Wortform enthalten.

### Partizipangleichung nach Sprache (Grammatik-Datenvertrag)
- Französisch: `être` mit Subjektaccord, z. B. `allé(e)(s)`;
  `avoir` bei vorangestelltem direkten Objekt ggf. Accord;
  reflexive Verben mit Sonderbedingungen. Basisform und
  Übereinstimmungsregel separat speichern.
- Spanisch: mit `haber` ist das part. perfecto unveränderlich
  (`he hablado`), als Adjektiv oder mit `ser/estar` dagegen
  Genus-/Numerusangleichung (`puertas abiertas`).
- Portugiesisch: mit `ter` in zusammengesetzten Zeiten i. d. R.
  unveränderlich (`tem escrito`); passivisch mit `ser` oder
  adjektivisch mit `estar` anpassungsfähig
  (`cartas escritas`); einige Verben haben *zwei verschiedene*
  Partizipstämme, z. B. `aceitado/aceite` (Varietät beachten).
- Englisch: Past participle selbst kein männlich/weiblich/plural-
  Accord (`has gone/have gone`); Hilfsverb ggf. angepasst.
- Niederländisch: im Verbalkomplex das Voltooid deelwoord normalerweise
  unverändert (`heeft gewerkt`); adjektivisch können
  Adjektivendungen vorkommen (`de geplande reis`).
- Latein: Partizipien werden wie Adjektive nach Kasus, Numerus,
  Genus flektiert (`amātus/amāta/amātum` etc.) und können
  schulrelevant sein; nicht als französisches `(e)(s)` darstellen.
- Quellen: spanische Partizipangleichung (Universitätstext)
  https://human.libretexts.org/Bookshelves/Languages/Spanish/Spanish_Grammar_and_Linguistics_Bookshelf/Spanish_Grammar_Manual_%28Yepes%29/16/62_Tiempos_compuestos;
  portugiesisch https://ciberduvidas.iscte-iul.pt/consultorio/perguntas/ser-e-estar--participio-passado/2584;
  niederländisch https://inburgeringsexamen.nl/en/grammar/participles-as-adjectives;
  lateinisch https://www.nationalarchives.gov.uk/latin/stage-2-latin/lessons/lesson-19-participles-present-past-and-future/.
- Für die Basis-Lernkarte die sprachtypische meist unmarkierte Form
  verwenden; grammatisch bedingte Varianten als Regel speichern
  und in Kontext-Sätzen korrekt einsetzen. Keine getrennten
  Genus-/Numerus-Abfragen, außer sprachspezifischer Lernstoff
  verlangt es ausdrücklich.

### Bestandsmigration – ausdrücklicher Nutzerwunsch, bisher blockiert
- Vorhandene Cloud-Bücher mit altem Namenssuffix `Konjugationen`
  in `– Verben (<Sprache>)` überführen, Vokabelbücher in
  `– Vokabeln (<Sprache>)`, unter Erhalt von Buch-UUIDs,
  sämtlichen Vokabel-IDs, Trainingsevents, KI-Sätzen und Tombstones.
  Auf nicht doppelte Suffixe und Mehrdeutigkeiten prüfen.
- Aus der **produktiven älteren Standalone/GitHub-Pages-App**
  (Repo `vocprog/main`) existierende EN/FR-Vokabeln mit Seiten
  ins neue gemeinsame Public-Supabase-Vokabellernsystem migrieren,
  ohne bestehende Test-Cloud-Daten zu überschreiben, fehlende
  Sprachbestände aber nicht erfinden. Import-Dedupe per
  normalisierter Sprache/Seite/Vokabel/Übersetzung und Buchquelle.
- **Architekturprüfung durchgeführt:** alter produktiver Stand
  speichert Vokabellisten pro Sprache im Browser-LocalStorage
  `vocab_trainer_data_<lang>` und besitzt keine Supabase-
  Schnittstelle. Cloud-Public-Tabelle verwendet `book:<id>`,
  `vocab:<id>`, `event:<id>`, `special:<id>` mit timestamp.
  GitHub-Repository enthält KEINE Nutzerdaten. Deshalb kann der
  tatsächliche Live-Datenbestand nicht allein aus GitHub gelesen
  werden und ist derzeit nicht unabhängig verifiziert.
- **Kein Supabase-Schreibconnector verfügbar**; daher NOCH KEINE
  öffentliche Datenbankmigration/Umbenennung durchgeführt und
  keine Migration als erfolgreich behauptet. Notwendig:
  Backup/Export der Live-App aus den betreffenden Browsern
  (Französisch und Englisch getrennt) sowie unabhängiger Snapshot
  der öffentlichen Cloud-Tabelle. Danach ein validierter
  importer/migrationslauf mit Vorschau, Sicherung und Rollback;
  nicht blind Remote-Records manipulieren.
- Alle Datenübernahmen in separater Testversion und nur
  nach nachvollziehbarem Vergleich; produktive App erst
  nach Geräteabnahme und expliziter Freigabe aktualisieren.
- Festgelegte Restabnahmen: französisches `manger` inkl.
  `nous mang**e**ons` und 2-spaltigem Präsens; Englisch
  getrennt `to go`, `go/went/gone`, `gone`, `going`;
  Niederländisch getrennt `lopen` und `lopen/liep/gelopen`;
  span./port. Einzelkarten, lateinische Stammformen;
  idempotente Server-Migration und geräteübergreifender
  Daten-/Lernverlauf ohne verlorene Quelle oder Duplikate.


## Ergänzung 2026-11-12 – Imperativ-Beschriftung
- In der französischen Verbtabelle lautet die Zeile in der Fremdsprachenspalte ausdrücklich **`Impératif : (tu) mange / (nous) mangeons / (vous) mangez`**. Das französische Label `Impératif :` steht einmal vor den drei Formen. Die Deutschspalte zeigt nur die Übersetzungen, ohne wiederholten Bezeichner. Vorhandene Hervorhebung von Schreibabweichungen bleibt erhalten, z. B. `mang**e**ons`.
- Gleiches Schema bei allen französischen Verben mit Imperativ; bei Verben ohne gebräuchlichen Imperativ die Zeile weglassen. Diese Korrektur betrifft das Konzept, noch nicht implementierten App-Code.

## Verbindliche Präzisierung 2026-11-12 – sprachspezifische Stammformen und Tabellenüberschriften
- Dieser Abschnitt ergänzt die oben dokumentierten Konjugationsanforderungen;
  **keine Implementierung / kein produktiver Release in diesem Schritt**.
- Tabellenkopf zeigt das Lemma samt einmaligem Regelmäßigkeitsstatus,
  z. B. `manger [rég.]` oder `go [irrég.]`. In der Infinitivzeile
  KEIN wiederholtes `[rég.]`/`[irrég.]`.
- Zeile Französisch: **`Infinitif : manger`** (Französischspalte)
  und `essen` (Deutschspalte); nächste Zeile
  **`Participe passé : mangé`** und `gegessen`.
  Deutsche Spalte nur Übersetzung, nicht nochmal das Formenlabel.
- Für jede ausgewählte Zeit `Présent`, `Imparfait` usw. steht der
  französische Titel **über der Fremdsprachenspalte** und die deutsche
  Zeitbezeichnung, z. B. **`Gegenwart`**, über der Deutschspalte.
  Finite Einträge darunter ohne vorgesetztes Label.
- Imperativ: vorhandene Personformen mit geklammerten Pronomen,
  in 2 Spalten mit deutscher Bedeutung, andernfalls weglassen.
- Alle Sprachdaten haben einen *konfigurierten Satz von Basisformen*
  unabhängig vom Tempus-Dropdown, statt eines universell angenommenen
  „Infinitiv + Participe passé + Imperativ“. Jedes Verb enthält weiterhin
  die vollständigen freigegebenen Schulstoff-Zeitformen.
- Französisch: Infinitif présent, Participe passé, Impératif présent
  (sofern vorhanden), zusätzlich die ausgewählte finite Zeitform.
- **Englisch:** Separater Pflichteintrag „Principal parts / Stammformen“
  **base form / past simple / past participle**, z. B.
  `go / went / gone`, `do / did / done` (NICHT `do / did / did`);
  regelmäßig z. B. `work / worked / worked`.
  `to go` kann in der Infinitivzeile angezeigt werden, erste
  Stammform bleibt technisch `go`. Schulrelevante Form `-ing`
  (present participle/gerund) `going` zusätzlich als Basisform,
  da für Continuous/Progressive nötig. Englischer Imperativ nach
  Wunsch nur als Form `go!` (keine französische Dreierlogik).
  Speichern als unabhängige Formen, Zusammenfassung per Schrägstrich
  ist Anzeige/Lernkarte, nicht einziges freies Textfeld.
- **Niederländisch:** Analog drei Stammformen Infinitief /
  Onvoltooid verleden tijd (Singular als Lernform, ggf. Plural) /
  Voltooid deelwoord, z. B. `lopen / liep / gelopen`; Imperatief
  sprachtypisch.
- **Spanisch und Portugiesisch:** Infinitivo, Gerundio (`-ando`,
  `-iendo` / `-endo`), Participio und gängige Imperativo-
  Personenformen; Finite Schulzeiten über Zeitfilter. Sie benötigen
  NICHT die englischen 3 *principal parts* als Grundschema.
- **Latein:** Vier *Stammformen* (principal parts), z. B.
  `amō / amāre / amāvī / amātum`; letzte Stammform ist nicht
  bei allen Verben mechanisch als direktes Participium perfectum
  zu verstehen. Für intransitive bzw. deponente Verben
  lexikonspezifische Abweichungen respektieren. Nicht das
  französische Standard-Dreierschema übertragen.
- Beim Antwortvergleich für erlaubte zusammengesetzte Stammformlisten
  Leerzeichen um `/` ignorieren; Reihenfolge der grammatisch
  verschiedenen Formen (base/past/participle) bleibt signifikant.
- Quellenvermerk: British Council irregular verbs
  https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/irregular-verbs;
  Cambridge https://dictionary.cambridge.org/grammar/british-grammar/irregular-verbs;
  Onze Taal https://onzetaal.nl/taalloket/sterk-zwak-onregelmatig-werkwoord;
  UCM https://www.ucm.es/plataformaele/formas-no-personales;
  Dickinson Latin grammar https://dcc.dickinson.edu/grammar/latin/four-conjugations.
- Abnahme: Sprachwechsel passt Basiskarten und Zeitformliste an;
  Englisch `go/went/gone` und `do/did/done`; NL `lopen/liep/gelopen`;
  Latein `amō/amāre/amāvī/amātum`; Französisch `Infinitif`/
  `Participe passé` und zweisprachig ausgerichtete Zeitüberschrift.
  Falsche Klassifikation / verlorene Wortformen nicht akzeptieren.


## Verbindliche Konzeption Konjugationslernen – 2026-11-12 (noch nicht implementiert)

### Status, Freigabegrenze und Quellen
- Dieser Abschnitt dokumentiert die im Dialog am 11./12.11.2026 bestätigten
  fachlichen Anforderungen als projektinterne Wissensbasis und nächste
  Umsetzungsvorlage. **Kein Code/Schema der App in diesem Arbeitsschritt geändert.**
- Maßgebliche externe Grammatikreferenzen:
  https://www.academie-francaise.fr/questions-de-langue
  (Accord du participe passé, einschließlich être/avoir/reflexive Verben);
  https://www.larousse.fr/de/konjugation/franzosisch/manger/5950
  (manger: Zeiten, nous mangeons, Imperativ, Partizip);
  https://www.francaisavecpierre.com/present-de-lindicatif-1er-groupe/
  (orthographische Anpassungen -ger/-cer).
- Produktiv-`main` nicht ohne vollständige gesonderte Nutzerabnahme auf die
  umfassende Test-Funktionsversion migrieren. Repository-Handoff fortführen.

### Scannen, Bücher, Datenmodell
- Zwei Plus-Optionen im Buchauswahldialog:
  `+ Neues Vokabelbuch anlegen`, `+ Neues Verbenbuch anlegen`.
- Anzeige der Buchnamen: `<Name> – Vokabeln (<Sprache>)` oder
  `<Name> – Verben (<Sprache>)`; kein altes `Konjugationen`.
  Sprachdetektion aus Scan nach erster analysierter Seite.
- Pro Sprache **genau ein gemeinsames Verbenbuch**; „Neues Verbenbuch“
  für bereits vorhandene Sprache soll dieses verwenden, nicht duplizieren.
  Vokabelbücher dürfen dieselben Namen/inhaltsgleiche Seiten haben und
  später manuell gemergt werden.
- **Jedes erkannte Verb**, auch wenn nur als normale Vokabel gedruckt,
  soll vollständig für die sprachspezifischen *Schulstoff*-Zeitformen
  generiert werden; Verb-Grundvokabel + Übersetzung, Partizip/Imperativ
  und finite Formen in EINEM Verbenbuch. Keine eigene zweite
  Verbenbuch-Kopie pro fotografiertem Quellbuch.
- Andere Wortarten bleiben ausschließlich im normalen Vokabelbuch.
  Normale Quellbuch-Vokabeln ggf. beibehalten (dieses Verhalten vor
  Implementierung auf unbeabsichtigte Doppelzählung prüfen).
- Pro Sprache und Lemma ein eindeutiger Verb-Datensatz mit stabiler ID;
  getrennte Formen pro Tempus/Modus/Person, Übersetzung, Quelle/Seite,
  Provenienz, Validierungsstatus und Herkunft (Scan/KI/Referenz);
  Doppeleinträge vermeiden; alte Lernstatistiken erhalten.

### Französisch: relevante Schulstoff-Zeiten (ausschließlich diese)
- Indicatif: Présent (Gegenwart), Imparfait (unvollendete Vergangenheit),
  Passé composé (zusammengesetzte Vergangenheit), Plus-que-parfait
  (Vorvergangenheit), Futur simple (Zukunft).
- Conditionnel présent (würde-Form).
- Subjonctif présent (Subjonctif Gegenwart).
- KEINE erweiterte/literarische Zeiten wie Passé simple, Passé antérieur,
  Futur antérieur, Conditionnel passé, Subjonctif imparfait etc.
- **Unabhängig von Zeit-Dropdown immer zusätzlich** Infinitif présent
  (Grundvokabel mit Übersetzung und Kennzeichnung), Participe passé
  und Impératif présent, soweit das jeweilige Verb diese Formen
  tatsächlich besitzt. Fehlende Imperative nicht erfinden.
- Zeitform-Dropdown **nur bei Verbenbüchern**, exakt gleiche Gestaltung
  wie bestehende „Abfragerichtung“ und „Lernmodus“, unmittelbar dazwischen.
  Optionen: Originalsprachbezeichnung + deutsche Bedeutung in Klammern.
  Es wird exakt EIN Schulzeitmodus gefiltert, nicht alles auf einmal.
- Entsprechende **sprachspezifische Schulstoff-Kataloge** für en-US,
  es-ES, pt-PT, nl-NL, la-LA, fr-FR hinterlegen; Fremdsprachenbez.
  + deutsche Bedeutung; Eigenheiten anderer Sprachen beachten,
  z. B. Latein ohne verpflichtende Personalpronomen.

### Participe passé und Übereinstimmung
- Bei nichtreflexiven être-Verben Übereinstimmung mit Subjekt in Genus
  und Numerus; *vier* Formen möglich: allé, allée, allés, allées.
  **Kompakte Darstellung: `allé(e)(s)`**, ein gemeinsamer Karteieintrag,
  KEINE vier getrennten Abfragen. Basispartizip + Accord-Regel im
  Datensatz separat speichern, Darstellung daraus generieren.
- Das gilt nicht pauschal für jedes Partizip. Bei avoir ergibt sich die
  Angleichung unter bestimmten Bedingungen (vorangestelltes COD);
  bei reflexiven Verben eigene syntaktische Regeln. Für Satztrainer
  kontextgerechte Form anwenden.
- Im Trainer Leerzeichen um `/` bei Imperativ-/Variantenantworten
  optional; `va / allons / allez` und `va/allons/allez` gleichwertig.
  Auch geklammerte bzw. expandierte Accord-Varianten sinnvoll
  normalisieren; keine eigene Abfrage pro Genus/Numerus.
- Imperativ nur 3 französische Personengruppen (tu/nous/vous),
  dargestellt mit *geklammerten* Pronomen vor den Formen, z. B.
  `(tu) va / (nous) allons / (vous) allez`, auch deutsche
  Übersetzungen im separaten Tabellenspaltenfeld.
- Abweichende Sonderformen und vollständige Tempuskonjugation
  müssen anhand belastbarer Grammatik/Verbkonjugationsquelle
  validiert werden. Zweite KI-Abfrage allein ist keine unabhängige
  Verifikation. Nicht verifizierte KI-Formen als Prüfstatus markieren.

### Klassifizierung und visuelle Abweichungen
- Infinitiv-Lernkarte: `manger [rég.]`, `aller [irrég.]`, deutsch
  `essen` / `gehen`. Regelmäßigkeitskennzeichen **nur Infinitiv**.
- Interne Unterscheidung:
  1. strikte Regelmäßigkeit,
  2. Grundmuster mit kleiner orthografischer Anpassung,
  3. wirklich unregelmäßige Flexion.
- 1 und 2 nach Nutzerwunsch `[rég.]` anzeigen. 2 zusätzlich
  Positions-/Zeichen-Hervorhebung nur der abweichenden Buchstaben,
  beispielsweise `nous mang**e**ons` und `nous commen**ç**ons`.
  3 zeigt `[irrég.]` und erhält keine überladene
  teilzeichenweise Hervorhebung.
- Orthografische Ausnahme hat keinen verlässlichen allgemeinen
  Bedeutungsumfang allein aus der Flexionsgruppe. Klassifikation
  lexikon- bzw. mustergebunden, nicht rein am Suffix.
- Fettschrift ist **Darstellung**, niemals Teil des Texts, des
  Antwortvergleichs oder des gespeicherten Lemmas.

### Neuer Tabellenbutton im Trainer
- Ein kleiner, dezent umrandeter Button `Tabelle` in der oberen
  Trainerzeile zwischen Karten-Zähler und X, nur für Verben.
  Neutrale Gestaltung passend zu unteren Buttons, keine kräftige Farbe.
- Klick blendet UNTER dem bisherigen Abfragebereich einen gleichartig
  gestalteten Kasten ein/aus; kein Navigationswechsel.
- Inhalt je aktuelles Verb: **2 Spalten** Fremdsprache und Deutsch,
  mit Infinitiv + Kennzeichen, Participe passé (inkl. Accord),
  Imperativ (3 Formen mit geklammerten tu/nous/vous und /),
  dann sechs finite Personalformen ausschließlich für die gerade
  gewählte Zeitform (bei Sprachen mit anderem Paradigma angepasst).
  Deutsche Übersetzungen in eigener Spalte. Orthografische
  Abweichungen per gezielter Teilzeichen-Fettschrift.
- Die Tabelle dient zur Einsicht; Entscheidung ob Einsicht als
  Lernerfolg/Fehler gewertet wird ist vor späterer Implementierung
  gesondert zu testen. Fokus/Responsive Layout dürfen nicht leiden.

### Beispiel für Tabellenvorschau: manger (Présent)
| Fremdsprache | Deutsch |
| --- | --- |
| manger [rég.] | essen |
| Participe passé: mangé | gegessen |
| (tu) mange / (nous) mang**e**ons / (vous) mangez | iss / essen wir / esst bzw. essen Sie |
| je mange | ich esse |
| tu manges | du isst |
| il/elle/on mange | er/sie/man isst |
| nous mang**e**ons | wir essen |
| vous mangez | ihr esst / Sie essen |
| ils/elles mangent | sie essen |

Präzisierung: *manger* bildet das Passé composé mit **avoir**,
darum steht im Beispiel Participe passé nur `mangé`; die Schreibweise
`allé(e)(s)` ist das Beispiel für *aller* mit **être**.
Auffälligkeit `mangeons`: eingeschobenes e erhält weiches g.

### Bücher zusammenführen
- Bestätigtes dezentes, eigens entworfenes Dünnlinien-Symbol: zwei
  Linien laufen in einen einzelnen Pfeil; zwischen Stift und rotem X.
- Genau **zwei** Bücher, erster Buchname als Vorschlag, editierbar.
  Buchsprache muss übereinstimmen; normales Vokabelbuch darf nur mit
  normalem Vokabelbuch, Verbenbuch nur mit Verbenbuch.
- Überlappende Seiten auf identischen Inhalt prüfen: doppelte Vokabeln
  deduplizieren, abweichende Bücher nicht mergen, mit Begründung warnen.
  Nichtüberlappende Seiten zusammenfassen.
- Alle Referenzen inkl. Lernfortschritt/KI-Sätzen auf Zielbuch
  umstellen; nach gesicherter erfolgreicher Übernahme alte
  Buch-Referenzen als Tombstones synchronisieren. Vorher Backup.
  Cloud-Konflikte, Offline-Geräte und Atomicity gesondert testen.

### Abnahmeprüfungen (noch ausstehend)
1. Gemischte Vokabelseite mit französischem Verb + Verbformen, genau
   ein französisches Verbenbuch (Quell-Vokabelbuch nur bei expliziter
   Wahl), jeweils korrekte Infinitiv-/Partizip-/Imperativdaten.
2. Nur Infinitiv auf Foto löst vollständige Kernstoff-Konjugation aus.
3. Regelmäßig/orthografisch angepasst/unregelmäßig korrekt
   klassifiziert; hervorzuhebende Buchstaben geprüft.
4. Aller: Accord `allé(e)(s)` und richtige zusammengesetzte Zeiten;
   manger: `mang**e**ons`, keine unangebrachte Accord-Klammer.
5. Temporale Auswahl, Abfrage nur ausgewählte Personalformen plus
   Infinitiv, Participe passé und Imperativ.
6. Tabellenbutton zeigt zwei korrekte Spalten und bleibt im
   Trainerfenster klappbar, auch auf Smartphone.
7. Leerzeichen um Schrägstriche in Eingaben ignorieren; sonst
   fachlich falsche Antworten zurückweisen.
8. Merging mit Überschneidung, unterschiedlichen Sprachen,
   Buchtypen, Deduplizierung und gesamtem Lernverlauf; echte
   Zwei-Geräte-Synchronisation/Offline-Konflikte.
9. JSON-Export/Import mit neuen Datensätzen, Abwärtskompatibilität,
   Regression bestehender Vokabeltrainer.
10. Separater Nutzer-Abnahmetest auf der Testseite; **erst danach**
    Übernahme der vollständig getesteten Version auf `main`.


## Teil-Update auf produktivem main – 2026-11-11
- Nutzerfreigabe: Neues VOC-Logo und unabhängig übertragbare
  allgemeine UI-Verbesserungen schon in der Nicht-Testversion.
- Produktiver Branch `main` geändert:
  - `favicon.svg`: neues royalblaues VOC-Sprechblasenlogo auf Weiß;
    Commit `e945da9369ddb525872df9b674d8d278f7c2f3ab`.
  - `index.html`: Favicon-Link und Überschriften
    **1. API & Sprache**, **2. Datenverwaltung**, **3. Lernbereich**.
    Die Sprachauswahl bleibt in der Legacy-Produktion bewusst sichtbar,
    da sie dort für den Scan erforderlich ist.
    Commit `64c2867e9f46cee823a780cf5da1fafb1ff73887`.
  - `manifest.json`: neues PWA-Icon und Kurzname VOC;
    Commit `e36a7c2c1aa41d2da2c42faaff955d987bd7029e`.
- Bewusst **nicht** auf `main` übernommen: Cloud-Sync, Buchverwaltung,
  Konjugationsscanner, Lernverlauf und öffentliche Datenbankanbindung.
  Diese erfordern einen vollständigen kompatiblen Test-Release,
  andernfalls wäre eine produktive Sync-Zeile funktionslos.
- Prüfumfang: Inline-JS nach Änderung syntaktisch validiert;
  Logo/Manifest über GitHub gespeichert. Echter Browser/PWA-Installations-
  test noch offen. Produktiv-GitHub-Pages-URL derzeit nicht unabhängig verifiziert.
- Im Unterschied zu älteren Übergabevermerken ist `main` seit diesem
  Teil-Update absichtlich **nicht mehr identisch** zum Sicherungsbranch.
  Backup `backup-20261105-pre-supabase` bleibt unverändert.
- Die Testseite `vocprog-test` und ihr bislang abgenommener Sync-Stand
  bleiben unangetastet. Nächster großer Schritt: vollständige Testergebnisse,
  dann separate Freigabe für die produktive Migration.

## Teilabnahme und Korrektur 2026-11-11 (VOC v0.4 Test)
- **Nutzerseitig bestätigt:** SQL-Migration ausgeführt; Testapp meldet erfolgreichen
  `Online · Sync`-Zeitstempel; Bücher geräteübergreifend sichtbar;
  Löschung funktioniert geräteübergreifend; Lernfortschritt auf beiden
  Geräten sichtbar. Diese drei Sync-Pfade sind als **Teilabnahme**
  dokumentiert, keine vollständige Produktivfreigabe.
- Korrektur des Statusformats: `Sync DD.MM.YY HH:mm` **ohne Komma**
  durch explizite `formatToParts`-Zusammensetzung.
- Buchauswahl in Datenverwaltung und Scan-Buchdialog auf beiden Geräten
  **deterministisch alphabetisch** sortiert (deutsche Sortierung, natürliche
  Zahlenreihenfolge; ID als Tie-Breaker). Bestehende Bücher und deren IDs,
  Speicherreihenfolge sowie Datenbankinhalt bleiben unverändert. Sortierung
  kann beim Umbenennen wechseln.
- Test-Build in `andreas-nigl/vocprog-test/main` aktualisiert;
  letzter geprüfter JS-Commit `c78b0afde0286b9c5a41d9b773cd3d214585c254`,
  SW `da69b8308160438a77db9d9ae8b98f52ad5f1d19`.
  SW-Cache auf v6 aktualisiert. Test-URL:
  https://andreas-nigl.github.io/vocprog-test/
- Tests: JS- und SW-Syntax, 6/6 App-Dateien identisch zwischen
  Entwicklungsbranch und Testrepository, verschiedene Eingabereihenfolgen
  liefern identische Buchreihenfolge; Zeitformatprobe
  `11.11.26 00:14` ohne Komma; Produktions-`main` unverändert.
- **Noch offen für vollständige Abnahme:** KI-Gemini-Scan mit realen
  Französischseiten inklusive Konjugationen und Gruppierung; KI-Sätze
  geräteübergreifend; Offline-Neustart/Wiederverbindung und Upload zuvor
  geänderter Daten; JSON-Export/Import-Roundtrip mit Konjugationen/Statistik;
  gleichzeitig geänderte Datensätze/Konfliktsicherheit, öffentliche
  Manipulierbarkeit und Quoten; Browser-/Mobil-Layout inklusive Diktat und
  Kamera/Galerie; anschließende explizite Freigabe vor Produktiv-Merge.
- Standalone-Offline-HTML für v0.4 nicht aktualisiert; Online/PWA-Code
  aktualisiert, tatsächliche Offline-Verfügbarkeit nicht getestet.

# vocprog – Entwicklungsstand 2026-11-05

## UI-Entscheidung – korrigiert 2026-11-06
- Der Analysebutton befindet sich **außerhalb aller App-Bereiche 1–3** und außerhalb des Trainerfensters.
- Desktop: quadratischer 44x44-Button mit Balkendiagramm-Symbol, fest unten rechts am Browserfenster.
- Mobil: eigener Bereich nach dem gesamten App-Inhalt, rechtsbündig oberhalb der Statuszeile; nicht schwebend.
- Klick: `showLearningAnalysis()`. Export/Import unverändert.
- Neues Browser-Favicon: `favicon.svg`, Karteikasten mit VOC; im App-Inhalt nirgendwo sichtbar. Standalone hat eingebettetes Favicon.
- Teststand nicht veröffentlicht und nicht auf realen Desktop-/Mobilgeräten bestätigt.
- Ausführliche Einrichtung: [docs/SUPABASE_GITHUB_EINRICHTUNG.md](docs/SUPABASE_GITHUB_EINRICHTUNG.md).
- Wiederverwendbare Migrationsvorlage: [docs/TEMPLATE_GITHUB_SUPABASE_MIGRATION.md](docs/TEMPLATE_GITHUB_SUPABASE_MIGRATION.md).
- UI-Abnahmekriterien: [docs/VOC_UI_UEBERGABE.md](docs/VOC_UI_UEBERGABE.md).

## Prüfprotokoll 2026-11-06 – UI-Nachbesserung
- 22 statische Prüfungen bestanden (inklusive Syntax aller Inline-Skripte,
  Steuerung der Kamera- und Galerie-Buchauswahl, drei Abschnittsnamen,
  Niklas-Standard, 15-Minuten-Sync, Sessionlogin und CSS-Regeln).
- Sechs App-Dateien in `vocprog-test/main` anhand ihrer Git-Blob-SHAs
  mit dem Entwicklungsbranch abgeglichen: **6/6 identisch**.
- Produktives `vocprog/main/index.html` weiterhin unverändert
  gegenüber `backup-20261105-pre-supabase`.
- Statische Tests sind kein Ersatz für echte Browser-/Mobil- und Supabase-
  Anmeldungstests; diese bleiben bis zur Abnahme offen.
- Bei Pages mit älterem Service Worker: Seite neu laden. SW-Version v3
  nutzt Network-first für denselben Origin und Cache-Fallback für Offline.

## Änderungsblock 2026-11-06 – Test-UI (freigegeben)
- Abschnitt 1 heißt **1. API**. Fremdsprache wird nicht mehr global angezeigt;
  sie bleibt intern je Buch erhalten und wird beim Anlegen eines neuen Buchs im Scan-Dialog gewählt.
- Abschnitt 2 heißt **2. Datenverwaltung**. Die Nutzerwahl steht als vollbreites Dropdown
  direkt über der Bücherliste (Niklas als Standard, bisher gespeicherte Nutzerwahl wird bewahrt).
  Die Buchzeile ist weiterhin anklickbar zum Umbenennen; kein Stift/Piktogramm.
- Abschnitt 3 heißt **3. Lernbereich**.
- Der bisherige JavaScript-Fehler der Kamera-/Galerie-Buttons beruhte auf
  falsch escaped Anführungszeichen in den `onclick`-Attributen. Korrigiert.
- Während einer Abfrage erscheint die Nutzerwahl nicht, weil sie nur in Abschnitt 2 liegt.
- Trainer: Mikrofon etwas angehoben, Feedback-Zwischenraum verkleinert,
  Lösungsfeld bis zur rechten Button-Spalte verbreitert.
- Cloud: Nach einmaliger Anmeldung je Gerät gespeicherte Auth-Sitzung mit Refresh
  und Sync beim Start, nach Datenänderungen und alle 15 Minuten online.
  Dauerhafte Sync/Login/Logout-Buttons entfallen. Solange keine Sitzung besteht,
  zeigt die Statuszeile eine Verbindungsoption. Kein Passwort im Quelltext.
- Noch keine verifizierten interaktiven Browser-/Mobil-/Supabase-Livetests.
- Weiterhin nur Entwicklungsbranch + separate Testseite; Produktion `main` unverändert.

## Aktueller Entwicklungsstand: Staging 0.2 (2026-11-05)
- Quelle: `develop/offline-supabase-20261105`; `main` weiterhin identisch mit Backup-Branch.
- Realisiert im Staging-Code: Buch-Migration, Buchauswahl vor Scan, Buch-Dropdown
  beim Lernen, Profilwahl Andreas/Niklas, Enter-Antwortkontrolle, Tracking,
  Histogramme, vollständiger JSON-Export/Import, temporäre IndexedDB-Bilder,
  Service Worker, Cloud-Login und Cloud-Synchronisationsgrundlage.
- Standalone: `261105_2307_vocprog.html` (eine Datei, lokales Lernen;
  Online-Funktionen benötigen Verbindungszugang).
- Weder Supabase-Migrations-SQL ausgeführt noch echte Zwei-Geräte-/Browser-/
  RLS-/Offline-Tests durchgeführt. **Kein Produktionsrelease.**
- Offene Punkte: Auth-Testkonto in Supabase, Testrepository mit GitHub Pages,
  echte UI-/Offline-/Sync-Tests, konkurrierende Änderungen und Lösch-Tombstones,
  serverseitige Gemini-Proxy-Lösung vor öffentlicher kommerzieller Nutzung,
  robustere Übersetzungsbewertung, Abgleich der AE/BE-Buchnotation.
- Datenschutz: Auf `main` keine Änderung. Scanbilder werden nur temporär
  in IndexedDB gespeichert, nicht an Supabase übertragen; beim Gemini-Aufruf
  findet wie bisher eine Übertragung an Google statt.
- Nutzerkonten: **ein** Supabase-Login mit zwei internen Lernprofilen;
  Profiltrennung ist nicht dieselbe wie getrennte Authentifizierung.

## Architekturentscheidung 2026-11-09 – Identität und Synchronisation
- Primärquellen: Supabase Anonymous Sign-Ins, User Sessions, RLS und
  GitHub Contents API (öffentlich recherchiert am 09.11.2026).
- **Anonyme Auth für Familien-Synchronisation abgelehnt:** anonyme
  Konten verlieren nach Löschung der Browserdaten oder auf anderem Gerät
  ohne verknüpfte Identität ihren Zugriff. Daher keine verlässliche
  Wiederherstellung / gemeinsamer Datensatz.
- **GitHub-JSON als laufende Datenbank abgelehnt:** Browser benötigt
  Repository-Contents-Schreibberechtigung; ein in HTML hinterlegtes Token
  wäre öffentlich. Ebenso entstehen Konflikte zwischen Geräten.
- Verbleibende Architektur: GitHub Pages/PWA + lokaler Speicher +
  Supabase-RLS über **ein gemeinsames Familienkonto**, einmaliger Login
  je Gerät und anschließend automatische Session-Erneuerung; kein
  fest im JS hinterlegtes Passwort. Niklas/Andreas bleiben interne
  Lernprofile. Publizierter Supabase Publishable Key ist kein Geheimnis.
- GitHub↔Supabase-Integrationsoption "Deploy to Production" bleibt aus.
  Keine Datenbankmigration im Zuge dieses Codeblocks durchgeführt.

## Test-UI 0.3: 2026-11-09
- Sprache beim erfolgreichen KI-Scan automatisch erkennen und am Buch
  speichern; bestehende Buchsprache gegen neuen Scan prüfen.
- Neues Buch mit vorbelegtem Namen **Muster**, ohne Sprach-Dropdown.
- Buch-Dropdown in 2. Datenverwaltung unter Nutzer; daneben Stift und rotes X,
  Löschen mit Bestätigung und Hinweis auf Folgen.
- Die alte sprachbasierte Löschschaltfläche ist aus dem UI entfernt.
- Buchauswahl aus 3. Lernbereich entfernt; Übungsauswahl folgt dem
  im Bereich 2 gewählten Buch.
- Lösch-Tombstones in lokalem Speicher und Cloud-Records pro Buch,
  Vokabel, Spezial-Satz und Ereignis; Synchronisationskonflikte und
  Offline-Wiederherstellung weiterhin im Echttest prüfen.
- Enter/Weiter: leer überspringt, erste gefüllte Eingabe prüft,
  weitere Aktion blättert. Mobil kein Fokus beim Kartenstart,
  nach Diktat Fokus; Desktop Autofokus.
- Status: kompaktes "Sync DD.MM.YY HH:mm", zentriert mit Version;
  Trainer blendet Status, Version, Login und Analyse aus.
  Mobile Analyse unter der Versionsnummer rechts.
- Favicon: weißer Hintergrund, royalblaue Sprechblase und VOC-Buchstaben;
  nur im Browser-Tab, nicht als App-Inhalt.
- Änderungen ausschließlich in Entwicklungsbranch und Testrepository;
  **produktives `main` nicht anfassen**.
- Abnahme ausstehend: Browser-UI, Kamera-Scan, Datenbank-RLS, Multi-Geräte-
  Synchronisation einschließlich Löschereignis, Offline-Neustart,
  Backup-Import. Diese Tests sind noch nicht live durchgeführt.

## Build- und Prüfstand 2026-11-09
- Testseite: https://andreas-nigl.github.io/vocprog-test/
  (GitHub-Dateien aktualisiert; HTTP/GUI dieser Adresse nicht unabhängig verifiziert).
- Testrepo `andreas-nigl/vocprog-test`, Branch `main`: 6/6 App-Dateien
  byte-identisch zum Entwicklungsbranch; letzter beobachteter GitHub-Commit
  für `index.html`: `7165a67265c14c871eb94e4175880aaeb3ad6bfd`.
- Produktives `vocprog/main/index.html` weiterhin exakt gleicher Blob-SHA
  wie `backup-20261105-pre-supabase`.
- JavaScript-Syntaxprüfungen bestanden; 6/6 isolierte Logiktests für
  Enter/Weiter bestanden, 10/10 statische neue UI-Kriterien erfüllt.
- Keine echte browsergesteuerte E2E-Prüfung und keine RLS-/Supabase-
  Synchronisationsprüfung mit zwei Geräten möglich; keine Nutzerabnahme.
- GitHub↔Supabase Production Deployment weiterhin aus; keine SQL-Migration.
- Offline-Standalone aus vorherigem Entwicklungsstand **nicht neu gebaut**;
  der Online-Teststand ist die aktuelle Version. Standalone nur auf Wunsch.
- Offene Punkte für Abnahme: Buchanlage `Muster` und Sprachdetektion
  (Mehrsprachigkeit/Gemini-Fehler), Löschvermerke mit mehreren Geräten,
  App-Neustart offline, Cache-Update, Login-Session auf zwei Geräten,
  Import nach Löschung, Mobil-Tastaturverhalten und exakte UI-Ausgestaltung.

## Architekturwechsel 2026-11-10 – freigegeben, Testversion 0.4
- Nutzerfreigabe: gemeinsamer **öffentlicher** Datensatz ohne Konto/Login,
  keine Profilwahl oder gespeicherte Benutzernamen. Bücher, Vokabeln,
  generierte KI-Sätze und gesamter Lernverlauf über alle Geräte synchron.
- Supabase Free verursacht keine nutzungsabhängigen Rechnungen, solange
  Organisation im Free-Tarif verbleibt. Quotenüberschreitung kann
  Beschränkungen auslösen; nur bewusster Wechsel in Paid löst Kosten aus
  (Supabase Billing FAQ, Stand 2026-11-10).
- Neue eigenständige Tabelle `public.vocprog_public_records` mit
  Lese-/Schreibrechten für DB-Rolle `anon`. SQL unter
  `supabase/migrations/20261110_000002_vocprog_public_records.sql`.
  **Noch nicht produktiv in Supabase ausgeführt**; die bisherige private
  `vocprog_records` wird nicht geöffnet, verändert oder gelöscht.
- Sicherheitseinschränkung (bewusst akzeptiert): Jeder mit dem öffentlichen
  Projekt-Publishable-Key kann Datensätze lesen, schreiben und
  manipulieren; kein Schutz gegen fremde Löschvermerke, Spam, Speichervoll-
  lauf oder böswillige Zeitstempel. Kein Benutzerkonto, damit keine
  Identitätsprüfung möglich. Keine Secrets in HTML.
- Cloud-Sync: beim Start, nach Änderungen und alle 15 Minuten;
  Offline-Daten werden lokal gehalten. Testbetrieb erst nach SQL.
- Bestand: Profile aus lokalen Ereignissen vor Veröffentlichung entfernt.
  Vorherige lokale Token-/Profil-Metadaten werden entfernt; Altbestand in
  privater Supabase-Tabelle bleibt unverändert.
- Neu: KI erkennt auf gescannten französischen Verbseiten zusätzlich
  gedruckte Konjugationen, nur tatsächlich sichtbare Zeitformen.
  Pro Ursprungsbuch ein Buch `<Name> – Konjugationen`, mit
  Infinitiv, Tempus, Seite, Personengruppe, Französisch und Deutsch.
  Gruppierung: je, tu, il/elle/on, nous, vous, ils/elles;
  deutsche Übersetzung nach Bedeutung, z. B. er/sie/man.
  Vorhandene Vokabeln bleiben im Quellbuch.
- Abnahme: SQL manuell ausführen, erster Start auf zwei Geräten,
  RLS öffentliche Endpunkte, Sync ohne Login, Konjugationsscan mit
  realen Französischseiten, Dubletten, Profilbereinigung, Löschung,
  Offline und Backup prüfen. Keine Nutzerabnahme der Version 0.4.
- Test-URL `https://andreas-nigl.github.io/vocprog-test/`;
  Produktivbranch `vocprog/main` bleibt unverändert. Weitere
  GitHub-/Supabase-Integrationsmigrationen nicht automatisch deployen.

## Abschluss Entwicklungsblock 2026-11-10 – v0.4 Test, Cloud-Migration noch offen
- **Verfügbarer Online-Testbuild:** `andreas-nigl/vocprog-test` auf `main`,
  Quellstand `vocprog/develop/offline-supabase-20261105`.
  Letzter geprüfter `index.html`-Commit im Testrepo:
  `03e173e2f3d839ab56a7b631be7e08e3c19dd22c`.
- **GitHub-Abgleich:** sechs Dateien 6/6 identisch (index.html, Erweiterungs-JS,
  CSS, Favicon, sw.js, manifest.json). Produktiv-`vocprog/main` stimmt
  unverändert mit dem Sicherungsbranch überein.
- **Statische Prüfungen:** Inline-/Erweiterungs-/Service-Worker-JavaScript
  parsbar; keine Login-/Profil-UI; 6/6 isolierte Beispiel-Konjugationen
  erkannt, Wiederholung 0 Dubletten, eigenes Buch richtig benannt,
  Quellbuch wieder ausgewählt. Cloud-Endpunkt `vocprog_public_records`
  wird referenziert; frühere private Tabelle nicht mehr verwendet.
- **WICHTIG:** Keine Live-Migration in Supabase durchgeführt,
  `supabase/migrations/20261110_000002_vocprog_public_records.sql`
  muss nach Nutzersichtung im SQL Editor ausgeführt werden.
  Bis dahin zeigt der Sync einen HTTP-Fehler und verarbeitet nur lokale Daten.
- **Offen:** echtes Scanbild/Modellantwort; Browser/Mobil-Rendering,
  KI-Sätze und Konjugationskarten; echte Synchronisation auf zwei Geräten,
  idempotente Löschvermerke, Datenkollision bei simultaner Änderung,
  Ausfall/Wiederanlauf und RLS-Test in Datenbank. Keine Nutzerabnahme.
- **Offline/Standalone:** Online-GitHub-Pages-Build übertragen; Offline-SW
  aktualisiert und statisch geprüft, kein echter Offline-Neustart getestet.
  Standalone-HTML nicht für diesen Änderungsblock erneuert.
- **Nächster freigegebener Schritt:** SQL-Migration kontrolliert ausführen
  (vom Nutzer im Dashboard), dann Live-Sync/RLS und Scanner testen,
  danach erst Nutzerabnahme und Merge in Produktion.

## Versionierung
- Unverändertes Original: Branch `backup-20261105-pre-supabase`.
- Produktiver `main` bleibt unverändert.
- Entwicklungsbranch: `develop/offline-supabase-20261105`. **Nicht produktiv.**
- Veröffentlichte Test-URL noch nicht eingerichtet. Kein automatischer Deploy auf Produktion.
- Supabase-Referenz: Projekt `yiayotftqqaivoxvuzmz`, nur **Publishable Key**, keine Geheimnisse im Repository.

## Ziel
GitHub-Pages/PWA mit lokalem Offline-Speicher, optional authentifizierter
Supabase-Synchronisation, Buchverwaltung, Lernprofilen, gespeicherten KI-Sätzen
und Statistik. Kein App-Store-Projekt derzeit.

## Datenvertrag
- `books` (lokal): `{id, name, lang, updatedAt}`
- `vocab`: `{id, bookId, page, foreign, german, sentence_foreign, sentence_german, ...}`
- `special`: `{id, bookId, page, sourceRefs, items, updatedAt}`
- `events`: `{id, profile, bookId, page, kind, sourceId, at, action, result?}`
- Cloud: `vocprog_records`, ein Record je ID, durch `owner_id = auth.uid()` geschützt.
  Familienprofile sind **keine** eigenen Sicherheitsidentitäten.
- Alte `vocab_trainer_data_*` werden beim ersten Start um UUID und Buch `Muster`
  ergänzt, keine Löschung des Originaldatensatzes; vor Migration exportieren.
- Backup: `YYMMDD_vokabeln.txt`, JSON mit `schemaVersion`, `books`, `vocabulary`,
  `specialSentences` und `practiceEvents`, ohne Bilddaten/API-Key.

## Online/Offline
- Cache via Service Worker für GitHub Pages, kein SW in file://-Standalone.
- Temporäre Scanbilder in IndexedDB, nie in Supabase. Bei erfolgreicher Analyse löschen.
- Kein automatischer KI-Neuversuch nach Verbindungsverlust; manuelles Wiederholen.
- Cloud-Sync nur nach angemeldeter, gültiger Supabase-Sitzung.
- Statuszeile trennt Netzwerkstatus, Zeitpunkt **erfolgreicher** Cloud-Synchronisation
  und ausstehende Daten.
- Gleichzeitige Änderungen: vergleiche `updatedAt`, Konflikte dokumentieren; für
  produktive Mehrgeräte-Nutzung später serverseitige Revision/CAS ergänzen.

## Sicherheit/Deployment
1. SQL unter `supabase/migrations/20261105_000001_vocprog_records.sql` im
   Supabase SQL Editor **nach Prüfung** manuell ausführen.
2. Auth: für Testkonto E-Mail/Passwort oder geeigneten Provider aktivieren.
3. Zwei Konten auf RLS prüfen (fremde Records nicht sichtbar).
4. GitHub-Integration: Produktionsdeploy ausgeschaltet lassen.
5. Keine `service_role`, `sb_secret` oder privaten Gemini-Schlüssel ins Web.
6. Für kommerzielle Nutzung Auth-/KI-Backend, Datenschutz und Buchrechte prüfen.

## Prüfprotokoll vom 2026-11-05
- 15 statische Prüfungen erfolgreich: Inline-/Erweiterungs-/SW-JavaScript
  parsbar, einteilige Standalone, zentrale UI-Elemente, RLS-Schema,
  nichtdestruktive SQL-Anweisungen, temporäre Bilder nicht Cloud-Records,
  Enter-Bewertung, SW-Cache, Exportfelder, IPA-Filter, Artikel/Präposition,
  AE-Label-Filter und HTML-Escaping.
- GitHub-Verifikation: `main` und `backup-20261105-pre-supabase` besitzen
  weiterhin denselben `index.html`-Blob-SHA
  `299759a49a1430b9e05676f2ac9e9efccf7b9184`.
- **Nicht durchgeführt:** echtes Browser-/Mobilgerät-Rendering, Gemini-
  Scanregression, Offline-Neustart, Auth-RLS gegen echte Supabase-Instanz,
  Zwei-Geräte-Sync, Last-/Konflikttests. Kein Release für Produktion.
- Für App-Test ist eine Supabase-SQL-Migration und ein gültiges Auth-Konto
  erforderlich. Testseiten-Repo `vocprog-test` ist bislang nicht angelegt.
- Bekannte Einschränkungen: Cloud-Löschung bis zu Tombstone-Implementierung
  gesperrt, Timestamp-Konfliktauflösung ist noch keine atomare serverseitige
  Versionsprüfung, Scanbilder bleiben temporär per IndexedDB; Vokabellisten
  werden aus Gründen der Legacy-Kompatibilität derzeit weiterhin in
  localStorage gehalten. Verschiedene Nutzer sind serverseitig per RLS
  isoliert; die beiden Familienprofile einer Anmeldung sind das nicht.

## Testmatrix
- Ursprungsdaten Englisch/Französisch -> Musterbuch, umbenennen.
- Bücher gleicher Sprache mit gleichen Seitenzahlen getrennt; Kamera/Galerie vor Scan.
- Analyse online, offline vor/nach Start, Wiederaufnahme und Bildpersistenz.
- Enter bewertet, Weiter ohne Enter zählt nur als geübt.
- Drei Histogramme pro Buch, Vorlesen getrennt und Fehlerliste.
- Export/Import roundtrip, Duplikate, alte Backups.
- Zwei Geräte: Sync nach Login, Offline-Neustart, RLS fremder User.
- PWA-Start ohne Netz nur nach erfolgtem Cache; Standalone lokale Funktionen.
- Keine Änderungen an `main` ohne gesonderte Freigabe.

## Smartphone-App (zurückgestellt)
Optionen: Capacitor / lokale SQLite, ML Kit oder Apple Vision OCR,
systemseitige Sprachausgabe. Keine Entwicklung derzeit. Offene Punkte:
Buchlizenzen, Gemini-Nutzungskosten, Benutzer- und Kinderdatenschutz,
Offline-Textanalyse, native Berechtigungen, App-Store-Policies.

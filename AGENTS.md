# AGENTS.md — VOC öffentliche Testumgebung

## A. Allgemeine VOC-Projektregeln
- Mobile deutschsprachige Vokabelscanner-/Trainer-App; bestehende Scan-, Foto-, Sprach-, Seiten-, Lern-, Vorlese-, Import-/Export- und Offline-Bedienabläufe sowie VOC-Icon erhalten.
- **Latein vollständig aus dem Projektumfang gestrichen:** keine Lateinbücher, Zeitformoptionen, Karten oder experimentellen lateinischen Komponenten in Testbuilds.
- Keine erfundenen Verbformen, Daten oder Prüfergebnisse. Externe OCR-/KI-Antworten und HTML validieren und sicher darstellen. Ungeprüfte Konjugationen/Übersetzungen kennzeichnen und nicht als bestätigt ausgeben.
- Keine Datensätze, Seiten, Lernhistorien, Referenzen oder lokalen Backups ohne kontrollierte Migration verlieren; alle Änderungen auf Datenschutz, Eingaben, Secrets und Abhängigkeiten prüfen. Nie API-Keys oder Token committen.
- Vor Arbeit Branch, Commit, `AGENTS.md`, die betroffenen Dateien und die maßgebliche Übergabe lesen; fremde Änderungen erhalten. Nur tatsächlich durchgeführte Prüfungen als bestanden angeben.

## B. Ausschließlich Regeln der Testumgebung (NICHT live)
- Dieses Repo `andreas-nigl/vocprog-test`, Branch `main`, liefert die **öffentliche Test-App** aus; Änderungen hier sind unmittelbar eine Testveröffentlichung. Produktiv ist dagegen `andreas-nigl/vocprog`, Branch `main`, und bleibt ohne ausdrückliche Freigabe unverändert.
- Maßgebliche Entwicklungsquelle: `andreas-nigl/vocprog`, Branch `develop/offline-supabase-20261105`; dort vorhandene versionierte `PROJECT_HANDOFF.md` ist bindend. Vor Staging-Deployment dort den freigegebenen Build, Commit, Prüfstand, offene Punkte und die Nutzerabnahme lesen. Nach abgeschlossenem Block **dieselbe** Handoff-Datei aktualisieren, keine weitere Übergabedatei erfinden.
- Test-App: `index.html`, `vocprog-enhancements.js`/`.css`, `sw.js`, `manifest.json`, `favicon.svg`. Offline-Cache-Version zu allen eingebundenen Assets passend aktualisieren. Standalone wird nicht routinemäßig ausgegeben.
- Zielregeln von VOC 0.5: Buchtyp Vokabeln/Verben, ein Verbenbuch je Sprache, bei Verben Zeitformauswahl statt Lernmodus und keine einfachen oder KI-Spezialsätze; korrekte Grundformen und geordnete Principal Parts, buchbezogene Lernanalyse mit Abfragen, Prozent korrekter **bewerteter** Eingaben und Vorlesen, Kategorie-Reset durch dreifaches Betätigen; sicherer Buch-Merge. Das ist **Entwicklungsziel**, nicht automatisch bereits geprüfte Fähigkeit des aktuell veröffentlichten Teststands. Details und Schulzeitkataloge aus der maßgeblichen Handoff-Datei übernehmen.
- Supabase-`vocprog_public_records` ist als öffentlich geteilte `anon`-lesbare/-schreibbare Tabelle dokumentiert: **keine Mandantentrennung oder Manipulationssicherheit**. Keine Geheimnisse oder vertrauliche Daten hineinschreiben; Rechte, Authentifizierung und RLS nicht ohne gesonderte Freigabe ändern. Lokale Speicherung, Tombstones, Export/Import und 15-Minuten-Sync dürfen keine Daten verlieren.
- Vor Test-Deployment: `node --test tests/*.test.js` im Entwicklungsrepo, Syntax/DOM/CSS, Browser-/Mobil-/Offline-Regression, OCR/Trainer/Spracheingabe, Mehrgeräte-Supabase-Synchronisation sowie sichere Migration testen; WASM nur bei verifiziertem Build/Checksumme bundeln. Offene Prüfungen ausdrücklich benennen.

## C. Commit, Push, Release
- Im bereits ausdrücklich freigegebenen Entwicklungsblock erfolgreich geprüfte, zusammengehörige Änderungen samt aktualisierter maßgeblicher Handoff-Datei committen und pushen. Staging-Veröffentlichung nur für den tatsächlich freigegebenen und geprüften Build; nie ungetesteten Quellstand als abgenommen kennzeichnen.
- Produktives `vocprog/main`, neue Repositories, Rechteänderungen, destruktive Datenmigrationen und sonstige Live-Veröffentlichungen nur mit gesonderter ausdrücklicher Freigabe. Analyse-Gesamtreset erst vor ausdrücklich freigegebener Live-Übernahme.

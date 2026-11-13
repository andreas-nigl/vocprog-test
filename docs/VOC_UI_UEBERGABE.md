# vocprog – UI-Änderung und Arbeitsstand

Stand: 2026-11-06. Freigegeben durch Auftraggeber, aber **noch nicht auf GitHub veröffentlicht**.

## Ausgangslage

- Repository: `andreas-nigl/vocprog`
- Entwicklung: `develop/offline-supabase-20261105`
- Sicherung: `backup-20261105-pre-supabase`
- Produktivzweig `main` unverändert lassen.
- Frühere vorläufige Gestaltung: `analysisOpenBtn` innerhalb `scanCard` (Abschnitt 2). Diese Platzierung ist **falsch** und ausdrücklich abgelöst.

## Verbindliche UI-Anforderung

1. `analysisOpenBtn` aus `scanCard` entfernen; nicht innerhalb eines der Bereiche 1–3 und nicht im Trainerfenster platzieren.
2. Als eigenes Geschwisterelement **nach dem äußeren `.container`** und vor der Status-/Footerzeile anordnen. Einmalig im DOM.
3. Desktop (breit): 44 × 44 px quadratisch, `position: fixed`, `right: 20px`, `bottom: 20px`, mit Diagrammsymbol und Accessible Name `Lernanalyse öffnen`, unabhängig vom Scrollen in der rechten unteren Ecke der Browseransicht. Freiraum zur Footerzeile beachten.
4. Mobil (z. B. `max-width: 640px`): **nicht fixed**. Eine eigene schmale Buttonzeile unterhalb der App-Inhaltsbereiche am Ende der Seite, Button rechtsbündig; die nachfolgende Statuszeile bleibt lesbar.
5. Klick ruft vorhandenes `showLearningAnalysis()` auf; Berechnung und Diagramme unverändert.
6. Im Browser-Tab den bisherigen Globus durch `favicon.svg` ersetzen. Browser-Favicon **nirgendwo innerhalb der App-Oberfläche** zeigen. Die Standalone-HTML benötigt einen eingebetteten Favicon-Daten-URI; die GitHub-Pages-Version darf `favicon.svg` als Datei laden. Nicht versehentlich als PWA-App-Icon verknüpfen.
7. Frühere Standalone aus Entwicklungszweig nach UI-Korrektur neu generieren, eigene Versionskennung und Testprüfung.

## Dateiliste

- Neues `favicon.svg` ist als eigenständige Datei beigefügt.
- `index.html`: Favicon-Referenz; Analysebutton als äußeres Element.
- `vocprog-enhancements.css`: Desktop-/Mobilplatzierung.
- `261105_2307_vocprog.html` bzw. neue zeitgestempelte Standalone: Favicon-Daten-URI und eingebettete CSS-/JS-Version.
- `PROJECT_HANDOFF.md`: Diese Anforderung nach Überprüfung als neuer Abschnitt übernehmen, alte Platzierungsbeschreibung ausdrücklich aufheben.

## Prüfungen nach Umsetzung

- Desktop: Button außerhalb der App unten rechts; nicht von Dialog verdeckt und Footer bedienbar.
- Mobil: Button erscheint unter Abschnitt 3 bzw. nach dem App-Hauptinhalt, nicht als Overlay; keine horizontale Scrollbar.
- Browser: Tab zeigt Karteikasten mit VOC; kein zusätzliches Logo im Dokument.
- Alte Produktionsversion bleibt unverändert.
- CSS, JS, HTML und Standalone kontrollieren; Desktop und Smartphones tatsächlich öffnen.

## Externe Infrastruktur

- Supabase-Projekt-ID `yiayotftqqaivoxvuzmz`.
- GitHub Integration besteht; Working Directory `.`; Deploy to Production AUS.
- Ob der SQL Editor die Migration erfolgreich ausgeführt hat, ist in diesem Arbeitsblock nicht nachgewiesen.
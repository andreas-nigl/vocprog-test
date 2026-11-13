# Wiederverwendbare Vorlage: [APP] von GPT-Site/lokal nach GitHub Pages + Supabase

**Vorlagenversion:** 1.0 / 2026-11-06  
**Basisanleitung:** [SUPABASE_GITHUB_EINRICHTUNG.md](SUPABASE_GITHUB_EINRICHTUNG.md) (enthält sämtliche Klickwege und SQL-Sicherheitsprüfungen).

## Projektsteckbrief (je App ausfüllen)

| Feld | Eintrag |
|---|---|
| App / Repository | `[OWNER]/[REPO]` |
| Aktuelle GPT-Site oder GitHub-Pages-URL | `[URL]` |
| Bisherige gültige Version / Commit | `[VERSION]` / `[SHA]` |
| Produktionsbranch | `main` oder `[BRANCH]` |
| Geschützter Backupbranch | `[BACKUPBRANCH]` |
| Entwicklungsbranch | `[DEVELOPBRANCH]` |
| Neue vorläufige Test-URL | `[URL, verifiziert]` |
| Supabase-Projektname | `[PROJEKT]` |
| Supabase Project ID | `[ID]` |
| EU-Region | `[REGION]` |
| Projekt-URL | `https://[ID].supabase.co` |
| Publishable Key | nur in Client-Konfiguration, nicht im Dokument nötig |
| GitHub-Integration | `[an/aus]`; Working Directory `[.]` |
| Deploy to Production | **AUS**, bis produktive Migration freigegeben |
| Benutzer-/Rechtemodell | `[ein Account/mehrere Accounts/Rollen]` |
| Offline-Modell | `[IndexedDB, SQLite, Cache, SW, ...]` |
| Export-/Restore-Schema | `[Format, Version, Pfad]` |
| Externe APIs / kostenpflichtige Dienste | `[Liste]` |

## Vorgehen für jedes neue Projekt

1. **Inventarisieren:** vorhandenes Hosting, Benutzerkonten, Dateien, lokale Speicher, Datenmengen, externe APIs, Zugriffsschlüssel, Datenschutz, Lizenzpflichten und Backup prüfen.
2. **Sichern:** Produktions-Commit festhalten; Backupbranch erstellen; Export/Restore der bisherigen Daten ermöglichen; technische Übergabe in der *bestehenden* Projekt-Wissensdatei fortführen.
3. **Datenmodell aufstellen:** eindeutige IDs, `owner_id`, Datensätze, Fremdschlüssel/Referenzen, Zeitstempel, Schema-Version, Tombstones und Konfliktlösung definieren. Keine Bilder in Texttabellen, wenn nicht erforderlich.
4. **Supabase-Projekt einrichten:** die neun Abschnitte der Basisanleitung durchgehen, insbesondere sichere Ersteinrichtung und API/RLS/Grants.
5. **GitHub/Supabase verknüpfen (optional):** Repository auswählen, Working Directory `.` bei Root-`supabase/`, Produktions-Deployment zunächst deaktivieren. GitHub-Verbindung ändert **nicht** automatisch die App-Datenbankzugriffe.
6. **SQL versionieren:** `supabase/migrations/YYYYMMDD_HHMMSS_<name>.sql` mit nichtdestruktiven, überprüften Schemaänderungen. Rollen und RLS für alle Tabellen mit Benutzerinformationen testen. Vor produktiven Migrationen ein Backup erstellen.
7. **Auth bestimmen:** Supabase Auth, Anmeldemethode, Sessions, E-Mail-Einrichtung. Ein gemeinsames Familienkonto und mehrere UI-Profile sind **keine** isolierten Benutzerkonten.
8. **Cloud-Zugriff kapseln:** Backend-Adapter in der App (Konfiguration + CRUD/Synchronisation) von UI-/Domänenlogik trennen. Niemals `service_role`/Secret Key im Client.
9. **Offline-first:** lokale Datenbank, Service Worker/PWA oder Standalone, robuste Wiederaufnahme, Fehlerzustände, Cacheversionierung und definierte Abläufe bei Funklöchern.
10. **Synchronisation:** inkrementelle Änderungen, Idempotenz, Konfliktbehandlung, Wiederholungen, Löschungen, Gerätewechsel; Serverzeit vs. Clientzeit berücksichtigen. Erfolgreichen Sync nur nach bestätigter Übertragung ausweisen.
11. **Datenmigration:** bestehende Datensätze mit stabilen IDs importieren, Duplikate verhindern, Referenzen erhalten; nachprüfbare Zähl- und Integritätsprüfungen vornehmen.
12. **Testbetrieb:** Test-URL unabhängig vom produktiven Host veröffentlichen; Zwei-Benutzer-RLS-Test, Zwei-Geräte-Sync, Offline-/Online-Regression, Sicherheit und Wiederherstellung prüfen.
13. **Freigabe:** erst nach dokumentierten Prüfergebnissen Produktion aktivieren. Release dokumentieren; Live-App-Link und geprüften Download/Standalone bereitstellen.
14. **Betrieb:** Backups, Supabase-Kontingente, pausierte Free-Projekte, E-Mail- und API-Kosten überwachen; Notfall-Rollback testen.

## Wiederverwendbare Repository-Struktur

- `index.html`, optionale `js/`, `css/`, `assets/` – Web-App
- `sw.js`, `manifest.json`, `favicon.svg` – PWA und Favicon (falls benötigt)
- `supabase/migrations/` – versionierte Datenbankschemata
- `docs/` oder vorhandene Projekt-Wissensdatei – Setup, Betrieb und Testnachweise
- `tests/` – automatisierte und manuelle Regressionstests

## Mindestanforderungen an ein Migrations-SQL

- Keine Tabellen aus einer fremden App überschreiben oder ungewollt löschen.
- Vorhandene Daten bewahren; Migration und Rollback-Strategie beschreiben.
- `owner_id` und RLS bei Benutzerdaten; Tabellen-Grants und API-Rollen explizit kontrollieren.
- Keine hochprivilegierten Schlüssel in Git, Webseiten oder Backups.
- SQL-Sicherheitshinweise des Editors ernst nehmen; destruktive Operationen vor Ausführung einzeln erklären.
- Wenn Migration manuell lief, späteres CI/CD-Deployment mit Migrationshistorie abstimmen.
- Migrationsdateien sind App-spezifisch; **nicht** unverändert SQL von `vocprog` in DutyBase oder fotos2album übernehmen.

## Abnahmecheckliste

- [ ] Produktiver Code durch Branch/Commit gesichert
- [ ] Datenbackup inklusive Restore-Test vorhanden
- [ ] Testhost getrennt und erreichbar
- [ ] Supabase-Projekt und API-Zugang geprüft
- [ ] SQL-Migration versioniert und erfolgreich ausgeführt
- [ ] RLS: fremde Daten nicht sichtbar oder veränderbar
- [ ] Gleichzeitiger Zugriff, Offline-/Online-Rückkehr und Dubletten getestet
- [ ] Eigene App-Daten nach Abmelden nicht fremden Benutzern gezeigt
- [ ] Externe APIs, Datenschutz und Lizenzen geprüft
- [ ] Alle relevanten Regressionstests bestanden
- [ ] Live-URL und Standalone geprüft, GitHub-Release dokumentiert

## Projektübergreifende Besonderheiten

- **DutyBase:** lokale Dienstplandaten, Import/Export, Zeitzonen und Authentisierung separat auditieren.
- **fotos2album:** Bilder benötigen ein eigenes Storage-/Freigabekonzept, nicht nur SQL; Freigabelinks einschließlich Ablauf, Rechte und Widerruf prüfen.
- **MAN2REF:** Manual-PDFs, Herstellerrechte, OCR-Index, lokale Volltextsuche und Offline-Speichergröße separat berücksichtigen.
- **OFP2Flyer:** sensible Crew-/Dienstplandaten und Leserechte externer OneDrive-Quellen beachten.
- **NOTAM2AGC:** Karten-/NOTAM-Quellen, Nutzungsbedingungen, Versionsstände und lokale Kartenressourcen beachten.

**Gültigkeit:** Diese Vorlage ist eine technische Checkliste, kein Beleg einer erfolgreichen Migration. Die maßgebliche projektspezifische Übergabedokumentation bleibt pro App im jeweiligen Repository.
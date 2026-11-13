# Supabase + GitHub Pages: vollständige Einrichtung am Beispiel `vocprog`

**Version 1.0 – 2026-11-06**  
**Status:** Dokumentation. Kein Nachweis einer erfolgreichen SQL-Ausführung oder Live-Synchronisation.  
**Projekt:** `andreas-nigl/vocprog`; Supabase-Projekt `yiayotftqqaivoxvuzmz`; Entwicklungsbranch `develop/offline-supabase-20261105`.

## 0. Ziel und Trennung der Verantwortlichkeiten

- **GitHub**: versionierter Quellcode, GitHub Pages hostet HTML/CSS/JS und Service Worker.
- **Supabase**: PostgreSQL-Datenbank, Authentifizierung und REST-API.
- **Browser**: lokale Offline-Daten (IndexedDB), temporäre Scanbilder; Synchronisation bei Internetverbindung.
- Die Supabase-GitHub-**Integration** ist optional für Migrationen und Datenbank-Deployments. **Sie ist nicht erforderlich**, damit die laufende GitHub-Pages-App mit Supabase spricht.
- GitHub-**Pages** und Supabase-**GitHub Integration** sind zwei getrennte Funktionen. Für sichere Zugriffe benötigt die App ein authentifiziertes Supabase-Benutzerkonto und RLS-Richtlinien.

## 1. Projekt anlegen

1. [Supabase Dashboard](https://supabase.com/dashboard) öffnen, anmelden (GitHub-Login ist möglich).
2. Gewünschte Organisation wählen/anlegen.
3. **New project** wählen; Projektname `vocprog`.
4. Starkes **Database password** im Passwortmanager speichern. **Nie im Repository oder Chat veröffentlichen.**
5. EU-Region wählen (Angebot und konkrete Region im Dashboard prüfen).
6. Tarif **Free** wählen, wenn die Limits für Tests ausreichen.
7. Auf dem gezeigten Sicherheitsformular:
   - **Enable Data API: AN** – Supabase REST-API wird gebraucht.
   - **Automatically expose new tables: AUS** – keine globalen automatischen Grants auf neue Tabellen.
   - **Enable automatic RLS: AN** – zusätzlicher Schutz; Richtlinien bleiben erforderlich.
8. **Create new project** klicken; nach der Einrichtung das Projekt-Dashboard öffnen.

Hinweis: Automatische RLS allein erteilt noch keine Berechtigungen, und Grants allein ersetzen kein RLS. Beides muss geprüft werden.

## 2. API-Verbindungsdaten ermitteln

1. Im Dashboard des richtigen Projekts auf **Connect** klicken und die **Project URL** notieren. Diese sieht aus wie `https://<projekt-id>.supabase.co`.
2. Unter **Project Settings → API Keys** den **Publishable Key** kopieren (`sb_publishable_...`). Menübezeichnungen können abweichen.
3. Für die Anbindung **nur** URL und Publishable Key in der Web-App hinterlegen. Der öffentliche Schlüssel ist nicht geheim, aber die Datenbank muss mit Login, Grants und RLS geschützt sein.
4. **Nicht** veröffentlichen: Database password, Connection String mit Passwort, `sb_secret_...`, `service_role`-Key, Gemini-Privatschlüssel.
5. In den Einstellungen der App die Werte zentral als Konfiguration halten, damit andere Projekte sie ersetzen können; keine Entwickler-Passwörter in HTML fest einbauen.

## 3. GitHub-Integration (optionales Deployment von Supabase-Schemaänderungen)

1. Supabase **Project Settings → Integrations → GitHub Integration** öffnen.
2. **Authorize GitHub** wählen und GitHub-Freigabe kontrollieren.
3. Nach Möglichkeit nur das benötigte Repository freigeben; für `vocprog`: `andreas-nigl/vocprog`.
4. Repository in Supabase auswählen.
5. **Working Directory = `.`**, wenn der Ordner `supabase/` direkt im Repository-Root liegt. Das ist bei `vocprog` so.
6. **Deploy to Production = AUS** für die Entwicklungs-/Testphase. Damit werden Migrationen aus dem Produktionsbranch nicht automatisch auf die Live-Datenbank angewendet.
7. **Enable Integration** klicken.
8. Kontrollieren, ob Projekt und Repository verbunden sind.

**Was macht die Integration?** Sie liest versionierte SQL-Migrationsdateien und kann bei aktiver Automatik Datenbankänderungen ausrollen. **Was macht sie nicht?** Sie verbindet nicht automatisch die Web-App mit der Datenbank und synchronisiert keine Vokabeln. Das geschieht ausschließlich durch den App-Code über HTTPS. GitHub verändert ohne eine konfigurierte Deployment-Automatik keine Datenbanktabellen. Bei aktivierter Automation werden jedoch alle noch nicht ausgeführten Migrationen aus dem festgelegten Branch angewandt; schadhafte SQL-Anweisungen können deshalb unbeabsichtigt Daten verändern. Die Bestätigung jeder produktiven Migration bleibt sinnvoll.

**Wichtig bei manuellem SQL:** Wenn du eine Migrationsdatei bereits manuell im SQL Editor ausgeführt hast, darf sie nicht später unbesehen durch automatisches Deployment **noch einmal** eingespielt werden. Migrationshistorie mit Supabase CLI/Deployment-Mechanismus abstimmen, bevor `Deploy to Production` aktiviert wird.

## 4. SQL-Migration für `vocprog`

1. Die maßgebliche Datei öffnen: [GitHub – 20261105_000001_vocprog_records.sql](https://github.com/andreas-nigl/vocprog/blob/develop/offline-supabase-20261105/supabase/migrations/20261105_000001_vocprog_records.sql).
2. **Raw** ansehen, vollständigen SQL-Text kopieren und sicherstellen, dass es die beabsichtigte Datei ist.
3. Supabase → **SQL Editor → New query**.
4. SQL einfügen und **vor dem Ausführen** prüfen: zu erwartende Befehle sind `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`, `REVOKE`, `GRANT`, `DROP POLICY IF EXISTS` und `CREATE POLICY`.
5. Bei **Potential issue detected / destructive operations** nicht blind bestätigen: Die Warnung wird hier von `DROP POLICY IF EXISTS` ausgelöst. Solche Befehle löschen vorhandene *Richtlinien* (nicht Tabellen) und legen sie danach neu an. Wenn bereits Regeln existieren oder das Skript verändert wurde, Auswirkungen zuerst analysieren.
6. Erst nach Prüfung **Run** klicken. Erfolgsmeldung kann `Success. No rows returned` lauten.
7. Unter **Table Editor** überprüfen, dass `public.vocprog_records` existiert; unter **Database → Policies** prüfen, dass RLS aktiv ist und für SELECT/INSERT/UPDATE/DELETE je eine auf `auth.uid()` eingeschränkte Policy existiert.
8. Zusätzlich unter den Table Grants prüfen: `anon` darf nicht direkt auf die Tabelle zugreifen; `authenticated` erhält die erforderlichen Rechte. `owner_id` darf nicht die Kennung eines anderen Benutzers annehmen.

**Keine Live-Bestätigung:** Aus dem bisherigen Gespräch ist noch nicht sicher, ob das SQL tatsächlich ausgeführt wurde. Vor einem produktiven Login oder Sync zunächst das Ergebnis prüfen.

## 5. Testbenutzer / Familienprofile

1. Supabase → **Authentication → Users** öffnen.
2. Für den ersten privaten Test einen Benutzer administrativ anlegen, beispielsweise über **Add user**; bei Bedarf die E-Mail administrativ bestätigen. Passwort sicher speichern.
3. Falls Mail-Bestätigung oder Passwort-Reset erforderlich wird: Der eingebaute Supabase-Maildienst darf ohne eigenen SMTP-Dienst derzeit nur an Adressen von Organisationsmitgliedern senden und ist mengenmäßig begrenzt. Nicht von allgemein funktionierendem E-Mail-Versand ausgehen.
4. In `vocprog` vorerst **ein Supabase-Login** verwenden; darunter zwei **Lernprofile** Andreas und Niklas. Damit ist die Lernstatistik getrennt, aber beide Profile haben Zugriff auf den gemeinsamen Datenbestand.
5. Bei einer späteren öffentlichen App: getrennte echte Benutzerkonten, individuelle Authentifizierung, RLS-Isolation und gegebenenfalls eigener SMTP-Dienst.

## 6. App-Verbindung zu Supabase herstellen

1. Die App stellt für den Browser die Project URL und den Publishable Key bereit.
2. Der Benutzer meldet sich über Supabase Auth an; der Client erhält eine Sitzung mit begrenzter Laufzeit.
3. Die REST-API unter der Project URL erlaubt nur gemäß **RLS** autorisierte Datensätze.
4. Der Client liest neue Datensätze, gleicht lokale Änderungen ab und vermerkt den letzten **erfolgreichen** Sync. Bei Offline-Betrieb bleibt der lokale Speicher die Arbeitsgrundlage.
5. Nach Wiederherstellung der Verbindung werden ausstehende Änderungen übertragen. Datenkonflikte, parallele Geräteänderungen, Lösch-Tombstones und große Datenmengen müssen getestet werden.
6. Bilder werden nur temporär lokal gespeichert und für die KI-Analyse übertragen; Scanbilder gehören **nicht** in die Cloud-Datenbank. Beim erfolgreichen Speichern aus IndexedDB entfernen.
7. Die Synchronisationsanzeige muss Fehler und fehlende Anmeldung klar von einem erfolgreich abgeschlossenen Datenaustausch unterscheiden.

## 7. GitHub-Pages-Testumgebung

1. Produktives Repository `andreas-nigl/vocprog`, Branch `main`, zunächst **nicht** ändern.
2. Gesicherten Stand im Branch `backup-20261105-pre-supabase` behalten.
3. Entwicklungsbranch `develop/offline-supabase-20261105` verwenden.
4. Für eine getrennte Test-URL ein separates GitHub-Repository (z. B. `vocprog-test`) erstellen oder bewusst eine getrennte Pages-Quelle verwenden. Repositoryname und tatsächlich aktivierte Pages-URL verifizieren.
5. **Settings → Pages → Build and deployment → Deploy from a branch**; den zu veröffentlichenden Branch/Ordner wählen. URL öffnen und nicht nur aus dem Repositorynamen erraten.
6. Tests mit Desktop und Smartphone: Login, Datenbankzugriff, Buchzuordnung, Import/Export, Lernhistorie, Service Worker, Offline-Neustart, Bildpersistenz und Zwei-Geräte-Sync.
7. Erst nach dokumentiertem Abnahmetest auf `main` übernehmen. Produktives GitHub-/Supabase-Deployment bis dahin ausgeschaltet lassen.

## 8. Betrieb und Sicherheit

- **Inaktivität:** Ein kostenloses Supabase-Projekt kann bei geringer tatsächlicher Datenbankaktivität nach ungefähr sieben Tagen pausiert werden. Ein normaler echter Sync beim Online-App-Start erzeugt Datenbankaktivität; reine Offline-Nutzung nicht. Keine Garantie gegen Pausieren.
- **Reaktivierung:** Supabase Dashboard → pausiertes Projekt → **Resume project**, danach Auth/API/Sync prüfen.
- **Backup:** Benutzerexport `YYMMDD_vokabeln.txt` (JSON); zusätzlich regelmäßig sicherer administrativer Datenbankexport für den gesamten Datenbestand, wenn produktiv.
- **Kosten:** Dashboard-Metriken für Datenbank, Ausleitung, Auth, Edge Functions und E-Mail-Versand kontrollieren. Gemini-Kosten werden **nicht** von Supabase abgedeckt.
- **Schlüssel:** Nur Publishable Key im Client; echte Secrets serverseitig oder im Passwortmanager.
- **DSGVO:** Bei Nutzung außerhalb der Familie Datenschutzinformationen, Auftragsverarbeitung, Drittlandübermittlungen, Löschbarkeit und Jugend-/Kinderkontext prüfen.

## 9. Prüf- und Abnahmeprotokoll zum Ausfüllen

| Test | Erwartung | Ergebnis / Datum |
|---|---|---|
| SQL erfolgreich | Tabelle + vier RLS-Policies | offen |
| `anon` ohne Zugriff | API gibt keine privaten Daten heraus | offen |
| Benutzer A/B getrennt | Keine Einsicht in fremde Datensätze | offen |
| Gemeinsames Familienkonto | Andreas-/Niklas-Lernverlauf getrennt | offen |
| Browser offline starten | App-Shell + lokale Daten vorhanden | offen |
| Scan unterwegs unterbrechen | Bilder bleiben lokal erhalten | offen |
| Wieder online | Sync ohne Dubletten und Datenverlust | offen |
| Export/Import | Vollständiger JSON-Roundtrip | offen |
| Rollback | Backup-Branch + Daten-Backup verfügbar | offen |

## Primärquellen (Stand 2026-11-06)

- https://supabase.com/docs/guides/deployment/branching/github-integration
- https://supabase.com/docs/guides/deployment
- https://supabase.com/docs/guides/api/securing-your-api
- https://supabase.com/docs/guides/auth/auth-smtp
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
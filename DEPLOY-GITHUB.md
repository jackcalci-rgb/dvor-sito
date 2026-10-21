# Pubblicare il sito sulla VPS con GitHub (Virtualmin + nginx)

## Come funziona
- Il sito vive in un repository GitHub **privato**, nella cartella `site/`.
- Due rami (branch):
  - **`test`** → pubblica su `profumidistria.com` (versione di prova, non indicizzabile, creata da `tools/make_test.py`)
  - **`main`** → pubblica in **produzione** (`osteriadvor.com`)
- Ogni volta che aggiorni uno di questi rami, GitHub (Actions) copia sulla VPS **solo i file cambiati** via SSH/rsync.
- Per la produzione puoi richiedere un'**approvazione** manuale prima della pubblicazione (vedi passo 5).

**Non vengono mai toccati dall'aggiornamento:** `data/` (password e elenco foto), `uploads/` (foto caricate), `config.php` (impostazioni e-mail/Google) e `images/vini/` (foto delle bottiglie caricate a mano). Si modificano direttamente sul server.

## 1. Prima installazione sulla VPS (una volta sola)
Installa il sito la prima volta con lo zip `dvor-site.zip` (come da `docs/LEGGIMI-INSTALLAZIONE.txt`) e, per nginx, incolla le regole di `docs/nginx-produzione.conf` (o `nginx-test-profumidistria.conf` per il dominio di prova) nel blocco `server { }`. Questo crea `data/`, `uploads/` e la password dell'area foto.

## 2. Chiave SSH dedicata al deploy
Sul tuo computer (terminale):
```
ssh-keygen -t ed25519 -f deploy_key -C "github-deploy" -N ""
```
Si creano `deploy_key` (**privata**, non condividerla) e `deploy_key.pub` (pubblica).

Sulla VPS, per l'utente Unix del dominio (in Virtualmin ogni dominio ha il suo utente):
1. Virtualmin → *Edit Users* → utente proprietario del dominio → *Login shell* = `/bin/bash` (non "nologin").
2. Nella sua home crea `.ssh/authorized_keys` e incollaci il contenuto di `deploy_key.pub`
   (permessi: cartella `.ssh` = 700, file `authorized_keys` = 600).
3. Assicurati che `rsync` sia installato sulla VPS: `apt install rsync`.
4. Prova dal tuo computer: `ssh -i deploy_key UTENTE@IP_VPS` deve entrare senza password.

Impronta del server (per evitare falsi server): `ssh-keyscan -p 22 IP_VPS` → copia tutto l'output, ti serve al passo 4.

## 3. Repository GitHub
1. Crea un repository **privato** (es. `dvor-sito`).
2. Carica il contenuto di questa cartella (con `git`, GitHub Desktop, oppure dal sito: *Add file → Upload files*; assicurati che la cartella nascosta `.github` sia stata caricata).
3. Crea il ramo di prova: `git checkout -b test && git push -u origin test`.

## 4. Segreti (Settings → Environments)
Crea due ambienti, **production** e **test**, e in ciascuno aggiungi questi *secrets* (così ogni dominio ha il suo utente, chiave e cartella):

| Secret | Valore |
|---|---|
| `SSH_HOST` | IP o nome della VPS |
| `SSH_PORT` | porta SSH (lascia vuoto se è 22) |
| `SSH_USER` | utente Unix del dominio |
| `SSH_KEY` | contenuto del file `deploy_key` (privata) |
| `KNOWN_HOSTS` | output di `ssh-keyscan` |
| `DEPLOY_PATH` | cartella del sito, es. `/home/osteriadvor/public_html` (test: `/home/profumidistria/public_html`) |

Facoltativo: variabile `TEST_BASE_URL` (Settings → Variables) se il dominio di prova cambia o passa a https.

## 5. Approvazione prima della produzione (consigliato)
Settings → Environments → **production** → *Required reviewers* → aggiungi te stesso. Ogni push su `main` aspetterà il tuo OK.

## Uso quotidiano
1. Modifichi i file in `site/` (o ti consegno i file aggiornati e li copi dentro).
2. `git push` sul ramo **test** → in 1 minuto è su profumidistria.com: controlla.
3. Se va bene, unisci `test` in `main` (Pull Request) → approvi → in produzione.
4. **Tornare indietro:** su GitHub → *Revert* del commit, oppure rilancia il workflow di un commit precedente.

## Sicurezza
- Repository privato; nessuna password nel repo (`data/auth.php` è escluso da `.gitignore`).
- La chiave SSH serve solo a quell'utente; per revocarla basta togliere la riga da `authorized_keys`.
- Il workflow non cancella mai `data/`, `uploads/`, `config.php`.

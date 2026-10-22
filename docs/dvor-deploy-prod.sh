#!/bin/bash
# Pubblica osteriadvor.com dal ramo "main" di GitHub (eseguire come root, anche da cron).
# Uso: dvor-deploy-prod.sh          -> aggiorna solo se ci sono novità
#      FORCE=1 dvor-deploy-prod.sh  -> aggiorna comunque (primo avvio)
set -euo pipefail
REPO="https://github.com/jackcalci-rgb/dvor-sito.git"
BRANCH="main"
VUSER="osteriadvor"
DEST="/home/$VUSER/public_html"
WORK="/var/lib/dvor-deploy-prod"

mkdir -p "$WORK"
[ -d "$WORK/.git" ] || git clone -q -b "$BRANCH" "$REPO" "$WORK"
cd "$WORK"
git fetch -q origin "$BRANCH"
if [ "$(git rev-parse HEAD)" = "$(git rev-parse origin/$BRANCH)" ] && [ -z "${FORCE:-}" ]; then exit 0; fi
git reset -q --hard "origin/$BRANCH"
[ -d site ] || { echo "ERRORE: cartella site/ mancante nel ramo $BRANCH"; exit 1; }

mkdir -p "$DEST"
rsync -a --delete --chown="$VUSER:$VUSER" \
  --exclude 'data/' --exclude 'uploads/' --exclude 'config.php' --exclude 'images/vini/' \
  --exclude '.well-known/' --exclude 'cgi-bin/' --exclude 'stats/' \
  site/ "$DEST/"

# primo avvio: crea ciò che non sta su GitHub
[ -f "$DEST/config.php" ] || { cp site/config.php "$DEST/config.php"; chown "$VUSER:$VUSER" "$DEST/config.php"; }
mkdir -p "$DEST/data" "$DEST/uploads" "$DEST/images/vini"
[ -f "$DEST/data/photos.json" ] || echo '[]' > "$DEST/data/photos.json"
chown -R "$VUSER:$VUSER" "$DEST/data" "$DEST/uploads" "$DEST/images/vini"
chmod 775 "$DEST/data" "$DEST/uploads"
[ -f "$DEST/data/auth.php" ] || echo "ATTENZIONE: manca data/auth.php: senza non si entra in admin/ (caricalo dallo zip dvor-site.zip, cartella data/)"
command -v restorecon >/dev/null && restorecon -R "$DEST" || true
echo "$(date '+%F %T') pubblicato $(git rev-parse --short HEAD) su $DEST"

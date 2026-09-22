#!/usr/bin/env bash
# Manual deploy: build locally and ship the files to the NUC.
#
# Normally you do not need this. Pushing to main builds an image in CI and
# Watchtower pulls it within ~5 minutes. Keep this for when CI is down or you
# want to test an uncommitted change on the NUC.
#
# LAN only — Forge has no authentication.
set -euo pipefail

HOST="${FORGE_HOST:-homelab}"
DIR="${FORGE_DIR:-apps/forge}"

echo "==> building"
npm run build

echo "==> shipping to $HOST:~/$DIR/html"
ssh "$HOST" "mkdir -p ~/$DIR/html && rm -rf ~/$DIR/html/*"
tar -czf - -C dist/forge/browser . | ssh "$HOST" "tar -xzf - -C ~/$DIR/html"

echo "==> restarting container"
ssh "$HOST" "cd ~/$DIR && docker compose up -d --force-recreate"

echo "==> checking"
ssh "$HOST" "curl -s -o /dev/null -w 'HTTP %{http_code}\n' http://localhost:4012/"
echo "done: http://192.168.68.114:4012"

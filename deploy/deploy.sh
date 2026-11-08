#!/bin/bash
set -euo pipefail

# Injected by GitHub Actions workflow
ENV_B64="__ENV_B64__"
PAT_B64="__PAT_B64__"

echo "--- Installing Docker if missing ---"
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sudo sh > /dev/null 2>&1
  sudo usermod -aG docker ubuntu
fi

echo "--- Ensuring app-net network exists ---"
sudo docker network inspect app-net >/dev/null 2>&1 || sudo docker network create app-net

echo "--- Cloning or updating repo ---"
sudo mkdir -p /opt/terrain
GH_PAT=$(echo "$PAT_B64" | base64 -d)
if [ ! -d /opt/terrain/.git ]; then
  sudo git clone https://x-access-token:${GH_PAT}@github.com/12thmar/terrain.git /opt/terrain
fi
sudo git config --global --add safe.directory /opt/terrain
cd /opt/terrain
sudo git remote set-url origin https://x-access-token:${GH_PAT}@github.com/12thmar/terrain.git
sudo git fetch origin prod
sudo git reset --hard origin/prod

echo "--- Writing .env ---"
echo "$ENV_B64" | base64 -d | sudo tee /opt/terrain/backend/.env > /dev/null

echo "--- Pulling / building images ---"
sudo docker-compose \
  --project-name terrain \
  -f /opt/terrain/docker-compose.yml \
  -f /opt/terrain/docker-compose.prod.yml \
  pull --ignore-pull-failures || true

sudo docker-compose \
  --project-name terrain \
  -f /opt/terrain/docker-compose.yml \
  -f /opt/terrain/docker-compose.prod.yml \
  build

echo "--- Stopping old containers ---"
sudo docker-compose \
  --project-name terrain \
  -f /opt/terrain/docker-compose.yml \
  -f /opt/terrain/docker-compose.prod.yml \
  down

echo "--- Starting containers ---"
sudo docker-compose \
  --project-name terrain \
  -f /opt/terrain/docker-compose.yml \
  -f /opt/terrain/docker-compose.prod.yml \
  up -d

echo "--- Waiting for startup ---"
sleep 10

echo "--- Terrain logs ---"
sudo docker logs terrain-app --tail=30 2>&1 || echo "terrain-app not found"

echo "--- Running containers ---"
sudo docker-compose \
  --project-name terrain \
  -f /opt/terrain/docker-compose.yml \
  -f /opt/terrain/docker-compose.prod.yml \
  ps | grep -E "terrain-(app|web)" || { echo "DEPLOYMENT FAILED: containers not running"; exit 1; }
# deployed 2026-11-08

#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "=== MicroForge — Installation ==="

if ! command -v docker >/dev/null 2>&1; then
  echo "ERREUR: Docker requis. Installez Docker Desktop ou docker-ce."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "ERREUR: docker compose requis."
  exit 1
fi

if ! docker ps >/dev/null 2>&1; then
  echo "Docker installé mais le moteur ne tourne pas encore."
  echo "→ Ouvrez Docker Desktop (Applications) et attendez « Engine running »."
  echo "→ Acceptez la popup macOS « accès privilégié » si demandée."
  open -a Docker 2>/dev/null || true
  echo "Attente du démarrage (max 3 min)…"
  for i in $(seq 1 36); do
    if docker ps >/dev/null 2>&1; then
      echo "Moteur Docker prêt."
      break
    fi
    sleep 5
    if [[ $i -eq 36 ]]; then
      echo "ERREUR: Docker Desktop n'a pas démarré. Relancez Docker Desktop puis réexécutez ./install.sh"
      exit 1
    fi
  done
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Fichier .env créé depuis .env.example"
fi

echo "Build et démarrage des conteneurs…"
docker compose up -d --build

echo "Attente API (healthcheck)…"
for i in $(seq 1 30); do
  if curl -sf http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "API OK"
    break
  fi
  sleep 2
  if [[ $i -eq 30 ]]; then
    echo "WARN: API non joignable — vérifiez: docker compose logs backend"
  fi
done

echo ""
echo "=== MicroForge prêt ==="
echo "  Frontend : http://localhost:8080"
echo "  API      : http://localhost:3000/api/health"
echo ""
echo "Comptes démo (@microforge.demo / DemoPass123!):"
echo "  client@ / worker1@ / reviewer@ / admin@"
echo ""
echo "Commandes utiles:"
echo "  docker compose logs -f"
echo "  docker compose down"
echo "  docker compose exec backend npm run test:e2e"

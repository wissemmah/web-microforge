#!/bin/sh
set -e

echo "Attente PostgreSQL…"
until node -e "
const net=require('net');
const s=net.createConnection({host:process.env.DB_HOST||'db',port:+(process.env.DB_PORT||5432)});
s.on('connect',()=>{s.end();process.exit(0)});
s.on('error',()=>process.exit(1));
" 2>/dev/null; do
  sleep 2
done

echo "Seed base de données…"
node dist/database/seed-runner.js || echo "WARN: seed skipped"

echo "Démarrage API…"
exec node dist/main.js

#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "🚀 Iniciando MIA Backend..."

# Verificar .env
if [ ! -f .env ]; then
  echo "❌ ERROR: No existe backend/.env"
  exit 1
fi

# Verificar dependencias
if [ ! -d node_modules ]; then
  echo "📦 Instalando dependencias del backend..."
  npm install --silent
fi

# Verificar entry point
if [ ! -f server.js ]; then
  echo "❌ ERROR: No existe backend/server.js"
  exit 1
fi

echo "✅ Backend listo en http://localhost:3000"
exec node server.js

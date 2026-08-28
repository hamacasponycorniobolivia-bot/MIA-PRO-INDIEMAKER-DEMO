#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "🚀 Iniciando MIA Frontend..."

# Crear .env si no existe
if [ ! -f .env ]; then
  echo "⚙️  Creando frontend/.env con valores por defecto..."
  cat << 'ENVEOF' > .env
VITE_API_URL=http://localhost:3000
ENVEOF
fi

# Verificar dependencias
if [ ! -d node_modules ]; then
  echo "📦 Instalando dependencias del frontend..."
  npm install --silent
fi

# Build de producción si no existe dist/
if [ ! -d dist ] || [ ! -f dist/index.html ]; then
  echo "🔨 Construyendo bundle de producción..."
  npm run build
fi

echo "✅ Frontend listo en http://localhost:4173"
exec npm run preview -- --host 0.0.0.0

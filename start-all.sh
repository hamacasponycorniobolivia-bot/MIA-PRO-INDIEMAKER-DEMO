#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

echo "========================================="
echo "🚀 MIA PRO RELEASE FINAL"
echo "========================================="

# Verificar estructura
if [ ! -d backend ] || [ ! -d frontend ]; then
  echo "❌ Estructura inválida. Ejecutar desde /mnt/MIA/MIA_PRO_RELEASE_FINAL"
  exit 1
fi

cleanup() {
  echo ""
  echo "🛑 Deteniendo servicios..."
  [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null || true
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null || true
  wait 2>/dev/null || true
  echo "✅ Servicios detenidos."
  exit 0
}
trap cleanup INT TERM

# 1. Levantar backend
echo ""
echo "📡 Iniciando backend..."
cd backend
./start.sh &
BACKEND_PID=$!
cd "$ROOT_DIR"

# 2. Esperar a que backend responda (cualquier respuesta HTTP en puerto 3000)
echo "⏳ Esperando a que backend esté listo..."
MAX_WAIT=30
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null | grep -qE "^[0-9]{3}$"; then
    echo "✅ Backend respondiendo en puerto 3000"
    break
  fi
  sleep 1
  WAITED=$((WAITED + 1))
done

if [ $WAITED -ge $MAX_WAIT ]; then
  echo "❌ Timeout: backend no respondió en ${MAX_WAIT}s"
  cleanup
fi

# 3. Levantar frontend
echo ""
echo "🎨 Iniciando frontend..."
cd frontend
./start.sh &
FRONTEND_PID=$!
cd "$ROOT_DIR"

# 4. Esperar a que frontend responda
echo "⏳ Esperando a que frontend esté listo..."
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/ 2>/dev/null | grep -q "200"; then
    echo "✅ Frontend respondiendo en puerto 4173"
    break
  fi
  sleep 1
  WAITED=$((WAITED + 1))
done

if [ $WAITED -ge $MAX_WAIT ]; then
  echo "⚠️  Frontend tardó más de lo esperado, pero continuando..."
fi

echo ""
echo "========================================="
echo "✅ MIA PRO RELEASE FINAL ACTIVO"
echo "========================================="
echo "   Backend:  http://localhost:3000"
echo "   Frontend: http://localhost:4173"
echo ""
echo "Presiona Ctrl+C para detener todo"
echo "========================================="

wait

#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

set -a
source .env
set +a

if [ $# -ne 1 ]; then
  echo "Uso: $0 <archivo.dump>"
  exit 1
fi

BACKUP_FILE="$1"

if [[ "$BACKUP_FILE" != /* ]]; then
  BACKUP_FILE="$(pwd)/$BACKUP_FILE"
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup no encontrado: $BACKUP_FILE"
  exit 1
fi

if [[ "${BACKUP_FILE##*.}" != "dump" ]]; then
  echo "ERROR: El archivo debe tener extensión .dump"
  exit 1
fi

echo "=== MIA PRO RESTORE ==="
echo "Database destino: $DB_NAME"
echo "Backup: $BACKUP_FILE"

echo
echo "=== VALIDANDO BACKUP ==="

if ! pg_restore --list "$BACKUP_FILE" >/dev/null 2>&1; then
  echo "ERROR: El archivo no es un backup PostgreSQL válido."
  exit 1
fi

echo "Backup: OK"

echo
echo "=== RESTAURANDO ==="

PGPASSWORD="$DB_PASSWORD" pg_restore \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-owner \
  "$BACKUP_FILE"

echo
echo "=== RESTORE OK ==="
echo "Database restaurada correctamente."

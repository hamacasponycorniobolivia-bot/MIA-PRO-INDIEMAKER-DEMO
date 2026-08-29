#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

set -a
source .env
set +a

if [ $# -ne 1 ]; then
  echo "Uso: $0 <directorio_destino>"
  exit 1
fi

BACKUP_DIR="$1"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/mia_pro_${TIMESTAMP}.dump"

echo "=== MIA PRO BACKUP ==="
echo "Database: $DB_NAME"
echo "Host: $DB_HOST"
echo "Output: $BACKUP_FILE"

PGPASSWORD="$DB_PASSWORD" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -Fc \
  -f "$BACKUP_FILE"

pg_restore --list "$BACKUP_FILE" >/dev/null

echo "=== BACKUP OK ==="
echo "File: $BACKUP_FILE"
echo "Size: $(du -h "$BACKUP_FILE" | cut -f1)"

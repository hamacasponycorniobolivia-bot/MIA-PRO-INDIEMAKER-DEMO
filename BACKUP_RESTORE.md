# MIA Pro — Backup & Restore

## Objetivo

Procedimiento oficial para realizar, validar y restaurar backups de la base de datos de MIA Pro.

## Configuración

- PostgreSQL 18.6
- Base de datos: `mia_pro`
- Host: `localhost`
- Puerto: `5432`
- Credenciales gestionadas mediante `.env`

Las credenciales no deben almacenarse en este documento.

## Backup

El script oficial es:

`backend/backup.sh`

Ejecutar:

`./backup.sh`

El script genera un backup PostgreSQL en formato Custom y valida su integridad mediante `pg_restore --list`.

## Restore

El script oficial es:

`backend/restore.sh`

Ejecutar:

`./restore.sh <archivo.dump>`

El script valida previamente el archivo y ejecuta `pg_restore --no-owner`.

## Validación realizada

Se realizó una restauración completa sobre una base de datos independiente.

Resultado:

- RESTORE_EXIT_CODE=0
- RESTORE_ERRORS=0
- 21 tablas restauradas correctamente

## Integridad de datos

La base restaurada fue comparada con la base de producción.

| Tabla | Producción | Restore |
|---|---:|---:|
| users | 38 | 38 |
| wallets | 4 | 4 |
| assets | 1 | 1 |
| listings | 2 | 2 |
| tenants | 1 | 1 |
| organizations | 24 | 24 |
| webhooks | 22 | 22 |
| outbox_events | 2 | 2 |

Resultado:

`DATA_INTEGRITY=OK`

## Rendimiento

Backup:

- Tiempo: 426 ms
- Tamaño: 76K
- Integridad: OK

Restore:

- Tiempo: 5677 ms
- Errores: 0

Estos valores corresponden al entorno de validación utilizado.

## Buenas prácticas

- Mantener varias generaciones de backups.
- Mantener copias fuera del servidor principal.
- Proteger los archivos de backup.
- Realizar restauraciones de prueba periódicamente.
- Nunca realizar pruebas destructivas directamente sobre producción.

## Estado

- BACKUP_SCRIPT = VERDE
- RESTORE_SCRIPT = VERDE
- BACKUP_INTEGRITY = VERDE
- RESTORE_VALIDATION = VERDE
- DATA_INTEGRITY = VERDE
- PERFORMANCE_TEST = VERDE
- BACKUP_RESTORE = VERDE

**MIA Pro Backup & Restore — VALIDADO**

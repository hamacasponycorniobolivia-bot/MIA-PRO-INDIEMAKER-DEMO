# MIA PRO — Deployment

## Requisitos

- Linux
- Docker
- Docker Compose
- Node.js
- npm
- PostgreSQL 15
- Redis 7

## Backend

Directorio:

`backend/`

Dependencias principales:

- Express
- PostgreSQL / pg
- Prisma
- Redis
- JWT
- BullMQ
- Helmet
- express-rate-limit
- Zod
- Ethers

## Infraestructura Docker

`backend/docker-compose.yml`

Servicios principales:

- PostgreSQL 15
- Redis 7

PostgreSQL:

- Host: localhost
- Port: 5433

Redis:

- Host: localhost
- Port: 6380

## Variables de entorno

Las variables sensibles deben permanecer exclusivamente en `.env`.

Nunca publicar:

- DB_PASS
- JWT_SECRET
- API_KEY
- claves privadas
- credenciales de producción

## Arranque

Desde `backend/`:

```bash
npm install

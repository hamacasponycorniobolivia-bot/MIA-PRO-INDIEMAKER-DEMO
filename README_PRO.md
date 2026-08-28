# MIA PRO — Release Candidate

## Estado

MIA Pro se encuentra en fase de validación Release Candidate.

## Validaciones realizadas

- E2E completo: 6/6 PASS
- Exit Code E2E: 0
- Redis activo y operativo
- Cache-Aside de `/api/listings`
- TTL de cache: 60 segundos
- Invalidación de cache en operaciones de marketplace
- Conteos de datos origen/restaurado verificados

## Componentes principales

- Backend: Node.js / Express
- Base de datos: PostgreSQL
- ORM: Prisma
- Cache: Redis
- Frontend: aplicación web
- Blockchain: Foundry / Solidity
- Autenticación: JWT
- Seguridad: Helmet, rate limiting, RBAC
- Auditoría: audit logs
- Webhooks: eventos y entregas

## E2E

El test principal se encuentra en:

`backend/test-e2e.sh`

Pruebas:

1. Register
2. Login
3. Tenant
4. Users
5. Wallet
6. Webhook

Resultado de la última ejecución:

`6 PASS / 0 FAIL`

Exit code:

`0`

## Redis

Endpoint cacheado:

`GET /api/listings`

Clave:

`mia:listings`

TTL:

`60 segundos`

El sistema degrada de forma controlada si Redis no está disponible y continúa utilizando PostgreSQL.

# MIA PRO — Security

## Autenticación

MIA utiliza autenticación basada en JWT.

Las rutas protegidas requieren:

Authorization: Bearer <token>

## Autorización

El backend utiliza control de acceso basado en roles (RBAC).

Las operaciones administrativas requieren permisos apropiados.

## Multi-Tenancy

Los datos asociados a tenants utilizan aislamiento mediante tenant_id.

## Database

PostgreSQL es la fuente persistente de datos.

Las operaciones críticas utilizan transacciones.

## Audit Logs

El sistema mantiene registros de auditoría para operaciones relevantes.

## Redis

Redis se utiliza como cache, no como fuente primaria de verdad.

Patrón:

Cache → PostgreSQL fallback

Si Redis falla, la aplicación registra el problema y continúa utilizando PostgreSQL.

## Webhooks

Los webhooks forman parte del sistema de eventos y deben protegerse mediante mecanismos de autenticación/firma apropiados.

## Secretos

Los secretos nunca deben almacenarse en:

- código fuente
- Git
- documentación
- logs
- archivos públicos

## Producción

Antes de producción deben utilizarse secretos únicos y fuertes y una configuración separada de desarrollo/testing.

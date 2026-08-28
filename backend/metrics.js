const client = require('prom-client');

// Crear un registro de métricas
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Métrica personalizada: número de peticiones HTTP
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de peticiones HTTP',
  labelNames: ['method', 'route'],
  registers: [register],
});

// Métrica personalizada: latencia de peticiones
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duración de peticiones HTTP en segundos',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

module.exports = { register, httpRequestsTotal, httpRequestDuration };

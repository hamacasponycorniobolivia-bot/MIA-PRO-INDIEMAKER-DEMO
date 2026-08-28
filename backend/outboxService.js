const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Guardar un evento en la tabla outbox_events (junto con la transacción principal)
async function createOutboxEvent(client, eventType, payload) {
  const result = await client.query(
    `INSERT INTO outbox_events (event_type, payload, status)
     VALUES ($1, $2, 'PENDING')
     RETURNING *`,
    [eventType, JSON.stringify(payload)]
  );
  return result.rows[0];
}

// Procesar eventos pendientes (lo ejecuta un worker)
async function processOutbox() {
  const result = await pool.query(
    `SELECT * FROM outbox_events WHERE status = 'PENDING' ORDER BY id ASC LIMIT 10`
  );

  for (const event of result.rows) {
    // Buscar webhooks que escuchen este tipo de evento
    const webhooks = await pool.query(
      `SELECT * FROM webhooks WHERE event_type = $1`,
      [event.event_type]
    );

    for (const webhook of webhooks.rows) {
      // Crear entrega de webhook
      await pool.query(
        `INSERT INTO webhook_deliveries (webhook_id, payload, status, attempts)
         VALUES ($1, $2, 'PENDING', 0)`,
        [webhook.id, event.payload]
      );
    }

    // Marcar evento como procesado
    await pool.query(
      `UPDATE outbox_events SET status = 'PROCESSED' WHERE id = $1`,
      [event.id]
    );
  }

  return result.rows.length;
}

module.exports = { createOutboxEvent, processOutbox };

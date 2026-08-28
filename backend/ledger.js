const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function createTransaction(entries, idempotencyKey) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verificar idempotencia
    const existing = await client.query(
      `SELECT id FROM ledger_transactions WHERE idempotency_key = $1`,
      [idempotencyKey]
    );

    if (existing.rowCount > 0) {
      await client.query('ROLLBACK');
      return { duplicate: true, transactionId: existing.rows[0].id };
    }

    // Crear transacción
    const txResult = await client.query(
      `INSERT INTO ledger_transactions (operation_type, idempotency_key, status)
       VALUES ($1, $2, 'COMPLETED')
       RETURNING id`,
      ['purchase', idempotencyKey]
    );
    const txId = txResult.rows[0].id;

    // Insertar entradas (débito/crédito)
    for (const entry of entries) {
      await client.query(
        `INSERT INTO ledger_entries (transaction_id, account_id, debit, credit)
         VALUES ($1, $2, $3, $4)`,
        [txId, entry.accountId, entry.debit || null, entry.credit || null]
      );
    }

    await client.query('COMMIT');
    return { transactionId: txId };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { createTransaction };

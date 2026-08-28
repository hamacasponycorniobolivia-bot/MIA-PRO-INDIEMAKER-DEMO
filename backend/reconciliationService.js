const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function reconcileTransaction(txHash) {
  // 1. Obtener transacción blockchain
  const txResult = await pool.query(
    `SELECT * FROM blockchain_transactions WHERE tx_hash = $1`,
    [txHash]
  );

  if (txResult.rowCount === 0) {
    return { status: 'NOT_FOUND' };
  }

  const tx = txResult.rows[0];

  // 2. Obtener transacción ledger asociada
  const ledgerResult = await pool.query(
    `SELECT * FROM ledger_transactions WHERE id = $1`,
    [tx.operation_id]
  );

  if (ledgerResult.rowCount === 0) {
    return { status: 'LEDGER_NOT_FOUND' };
  }

  // 3. Verificar que coincidan
  if (tx.status === 'CONFIRMED') {
    await pool.query(
      `UPDATE blockchain_transactions SET status = 'RECONCILED' WHERE tx_hash = $1`,
      [txHash]
    );
    return { status: 'RECONCILED' };
  }

  return { status: 'PENDING_RECONCILIATION' };
}

module.exports = { reconcileTransaction };

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function createBlockchainTransaction(txHash, operationType, operationId) {
  const result = await pool.query(
    `INSERT INTO blockchain_transactions (tx_hash, status, operation_type, operation_id)
     VALUES ($1, 'PENDING', $2, $3)
     RETURNING *`,
    [txHash, operationType, operationId]
  );
  return result.rows[0];
}

async function updateBlockchainTransaction(txHash, status, blockNumber, confirmations) {
  const result = await pool.query(
    `UPDATE blockchain_transactions
     SET status = $2, block_number = $3, confirmations = $4
     WHERE tx_hash = $1
     RETURNING *`,
    [txHash, status, blockNumber, confirmations]
  );
  return result.rows[0];
}

module.exports = { createBlockchainTransaction, updateBlockchainTransaction };

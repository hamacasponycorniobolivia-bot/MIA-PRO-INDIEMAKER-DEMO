const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function createBlockchainTransaction(
  txHash,
  operationType,
  operationId,
  metadata = {}
) {
  const result = await pool.query(
    `INSERT INTO blockchain_transactions
      (tx_hash, status, operation_type, operation_id, to_address, amount, asset, network)
     VALUES ($1, 'PENDING', $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      txHash,
      operationType,
      operationId,
      metadata.toAddress || null,
      metadata.amount || null,
      metadata.asset || null,
      metadata.network || null,
    ]
  );

  return result.rows[0];
}

async function updateBlockchainTransaction(
  txHash,
  status,
  blockNumber,
  confirmations,
  metadata = {}
) {
  const operationId = metadata.operationId ?? null;

  const result = await pool.query(
    `UPDATE blockchain_transactions
     SET
       tx_hash = COALESCE($1, tx_hash),
       status = $2,
       block_number = $3,
       confirmations = $4,
       to_address = COALESCE($5, to_address),
       amount = COALESCE($6, amount),
       asset = COALESCE($7, asset),
       network = COALESCE($8, network)
     WHERE (CAST($1 AS VARCHAR) IS NOT NULL AND tx_hash = CAST($1 AS VARCHAR))
        OR (CAST($9 AS INTEGER) IS NOT NULL AND operation_id = CAST($9 AS INTEGER))
     RETURNING *`,
    [
      txHash || null,
      status,
      blockNumber ?? null,
      confirmations ?? 0,
      metadata.toAddress || null,
      metadata.amount || null,
      metadata.asset || null,
      metadata.network || null,
      operationId,
    ]
  );

  return result.rows[0] || null;
}

module.exports = {
  createBlockchainTransaction,
  updateBlockchainTransaction,
};

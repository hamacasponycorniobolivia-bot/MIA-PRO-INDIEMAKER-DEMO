const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '.env')
});

const { Pool } = require('pg');
const crypto = require('crypto');


const { postLedgerTransaction } = require('./ledger');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

/**
 * Obtiene una transacción de ledger por referencia externa.
 */
async function findLedgerTransaction(client, reference) {
  const result = await client.query(
    `
    SELECT id, idempotency_key, status
    FROM ledger_transactions
    WHERE idempotency_key = $1
    LIMIT 1
    `,
    [reference]
  );

  return result.rows[0] || null;
}

/**
 * Depósito simulado.
 *
 * Wallet + ledger simple + Ledger Engine
 * quedan dentro de una única transacción PostgreSQL.
 */
async function deposit(address, amount, metadata = {}) {
  const numericAmount = Number(amount);

  if (!address || !Number.isFinite(numericAmount) || numericAmount <= 0) {
    console.error('❌ Depósito inválido');
    return null;
  }

  const client = await pool.connect();

  const reference = metadata.reference || `deposit_${Date.now()}`;
  const txHash = metadata.txHash || `sim_${Date.now()}`;
  const transactionId = metadata.transactionId || crypto.randomUUID();

  try {
    await client.query('BEGIN');

    const existing = await findLedgerTransaction(client, reference);

    if (existing) {
      await client.query('ROLLBACK');
      return {
        duplicate: true,
        transactionId: existing.id,
        reference,
      };
    }

    const walletInfo = await client.query(
      `
      SELECT *
      FROM wallets
      WHERE user_address = $1
      LIMIT 1
      `,
      [address]
    );

    if (walletInfo.rowCount === 0) {
      await client.query('ROLLBACK');
      console.error(`❌ Wallet no encontrada para depósito: ${address}`);
      return null;
    }

    const walletTenantId =
      metadata.tenantId ||
      walletInfo.rows[0].tenant_id ||
      walletInfo.rows[0].tenantId;

    if (!walletTenantId) {
      await client.query('ROLLBACK');
      console.error('❌ tenantId no disponible para la wallet');
      return null;
    }

    const walletResult = await client.query(
      `
      UPDATE wallets
      SET usdc_balance =
        (CAST(usdc_balance AS NUMERIC) + $2)::TEXT
      WHERE user_address = $1
      RETURNING *
      `,
      [address, numericAmount]
    );

    if (walletResult.rowCount === 0) {
      await client.query('ROLLBACK');
      console.error(`❌ Wallet no encontrada para depósito: ${address}`);
      return null;
    }

    await client.query(
      `
      INSERT INTO ledger
        (tx_hash, user_address, amount, type)
      VALUES ($1, $2, $3, 'deposit')
      `,
      [txHash, address, numericAmount]
    );

    const ledgerResult = await postLedgerTransaction({
      client,
      transactionId,
      tenantId: walletTenantId,
      currency: 'USDC',
      referenceType: 'payment',
      referenceId: reference,
      description: 'USDC deposit',
      entries: [
        {
          accountCode: 'ASSET_WALLET',
          debit: numericAmount,
        },
        {
          accountCode: 'USER_FUNDS',
          credit: numericAmount,
        },
      ],
    });

    await client.query('COMMIT');

    return {
      ...walletResult.rows[0],
      ledgerTransaction: ledgerResult,
      reference,
      txHash,
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});

    if (error.code === '23505' && error.constraint === 'ledger_tx_hash_key') {
      const existing = await pool.query(
        `SELECT id, idempotency_key, status
         FROM ledger_transactions
         WHERE idempotency_key = $1
         LIMIT 1`,
        [reference]
      );

      if (existing.rowCount > 0) {
        return {
          duplicate: true,
          transactionId: existing.rows[0].id,
          reference,
        };
      }

      return {
        duplicate: true,
        reference,
      };
    }

    console.error('❌ Error en depósito:', error.message);
    return null;
  } finally {
    client.release();
  }
}

/**
 * Retiro simulado.
 *
 * Wallet + ledger simple + Ledger Engine
 * quedan dentro de una única transacción PostgreSQL.
 */
async function withdraw(address, amount, metadata = {}) {
  const numericAmount = Number(amount);

  if (!address || !Number.isFinite(numericAmount) || numericAmount <= 0) {
    console.error('❌ Retiro inválido');
    return null;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const reference = metadata.reference || `withdraw_${Date.now()}`;
    const txHash = metadata.txHash || `sim_${Date.now()}`;
    const transactionId = metadata.transactionId || crypto.randomUUID();

    const existing = await findLedgerTransaction(client, reference);

    if (existing) {
      await client.query('ROLLBACK');
      return {
        duplicate: true,
        transactionId: existing.id,
        reference,
      };
    }

    const walletInfo = await client.query(
      `
      SELECT *
      FROM wallets
      WHERE user_address = $1
      LIMIT 1
      `,
      [address]
    );

    if (walletInfo.rowCount === 0) {
      await client.query('ROLLBACK');
      console.log(`⚠ Wallet inexistente: ${address}`);
      return null;
    }

    const walletTenantId =
      metadata.tenantId ||
      walletInfo.rows[0].tenant_id ||
      walletInfo.rows[0].tenantId;

    if (!walletTenantId) {
      await client.query('ROLLBACK');
      console.error('❌ tenantId no disponible para la wallet');
      return null;
    }

    const walletResult = await client.query(
      `
      UPDATE wallets
      SET usdc_balance =
        (CAST(usdc_balance AS NUMERIC) - $2)::TEXT
      WHERE user_address = $1
        AND CAST(usdc_balance AS NUMERIC) >= $2
      RETURNING *
      `,
      [address, numericAmount]
    );

    if (walletResult.rowCount === 0) {
      await client.query('ROLLBACK');
      console.log(
        `⚠ Fondos insuficientes o wallet inexistente: ${address}`
      );
      return null;
    }

    await client.query(
      `
      INSERT INTO ledger
        (tx_hash, user_address, amount, type)
      VALUES ($1, $2, $3, 'withdraw')
      `,
      [txHash, address, numericAmount]
    );

    const ledgerResult = await postLedgerTransaction({
      client,
      transactionId,
      tenantId: walletTenantId,
      currency: 'USDC',
      referenceType: 'payment',
      referenceId: reference,
      description: 'USDC withdrawal',
      entries: [
        {
          accountCode: 'USER_FUNDS',
          debit: numericAmount,
        },
        {
          accountCode: 'ASSET_WALLET',
          credit: numericAmount,
        },
      ],
    });

    await client.query('COMMIT');

    return {
      ...walletResult.rows[0],
      ledgerTransaction: ledgerResult,
      reference,
      txHash,
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Error en retiro:', error.message);
    return null;
  } finally {
    client.release();
  }
}

module.exports = {
  deposit,
  withdraw,
};

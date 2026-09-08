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
 * Serializa operaciones que comparten la misma referencia.
 *
 * El lock vive únicamente durante la transacción PostgreSQL:
 * - misma referencia -> ejecución serializada;
 * - referencias diferentes -> no se bloquean entre sí.
 */
async function lockReference(client, reference) {
  await client.query(
    'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
    [reference]
  );
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

    await lockReference(client, reference);

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

      console.error(
        `❌ Colisión de tx_hash sin coincidencia de referencia: ${txHash}`
      );
      return null;
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

    await lockReference(client, reference);
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


/**
 * Crea una solicitud de retiro PENDING.
 *
 * Reserva el saldo de la wallet y registra la operación de ledger
 * dentro de una única transacción PostgreSQL.
 *
 * La transferencia on-chain se ejecuta DESPUÉS del COMMIT.
 */
async function createPendingWithdrawal({
  userId,
  tenantId,
  address,
  toAddress,
  amount,
  reference,
}) {
  const numericAmount = Number(amount);

  if (!userId || !tenantId || !address || !toAddress || !reference) {
    throw new Error('Datos de retiro incompletos');
  }

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error('Monto de retiro inválido');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await lockReference(client, reference);

    const existing = await findLedgerTransaction(client, reference);

    if (existing) {
      await client.query('ROLLBACK');

      return {
        duplicate: true,
        transactionId: existing.id,
        reference,
        status: existing.status,
      };
    }

    const walletResult = await client.query(
      `
      SELECT id, user_id, tenant_id, user_address, usdc_balance
      FROM wallets
      WHERE user_id = $1
        AND user_address = $2
        AND tenant_id = $3
      FOR UPDATE
      `,
      [userId, address, tenantId]
    );

    if (walletResult.rowCount === 0) {
      await client.query('ROLLBACK');
      throw new Error('Wallet no encontrada');
    }

    const wallet = walletResult.rows[0];

    const balanceResult = await client.query(
      `
      UPDATE wallets
      SET usdc_balance =
        (CAST(usdc_balance AS NUMERIC) - $2)::TEXT
      WHERE id = $1
        AND CAST(usdc_balance AS NUMERIC) >= $2
      RETURNING usdc_balance
      `,
      [wallet.id, numericAmount]
    );

    if (balanceResult.rowCount === 0) {
      await client.query('ROLLBACK');
      throw new Error('Fondos insuficientes');
    }

    const ledgerResult = await client.query(
      `
      INSERT INTO ledger_transactions
        (tenant_id, user_id, operation_type, idempotency_key, status)
      VALUES
        ($1, $2, 'WITHDRAWAL', $3, 'PENDING')
      RETURNING id, tenant_id, user_id, operation_type, idempotency_key, status
      `,
      [tenantId, userId, reference]
    );

    const ledgerTransaction = ledgerResult.rows[0];

    await client.query(
      `
      INSERT INTO ledger_entries
        (transaction_id, account_id, debit, credit)
      VALUES
        ($1, 4, $2, 0),
        ($1, 5, 0, $2)
      `,
      [ledgerTransaction.id, numericAmount]
    );

    await client.query(
      `
      INSERT INTO blockchain_transactions
        (tx_hash, status, operation_type, operation_id,
         to_address, amount, asset, network)
      VALUES
        (NULL, 'PENDING', 'WITHDRAWAL', $1,
         $2, $3, 'MUSD', 'sepolia')
      `,
      [ledgerTransaction.id, toAddress, numericAmount]
    );

    await client.query('COMMIT');

    return {
      duplicate: false,
      transactionId: ledgerTransaction.id,
      reference,
      status: 'PENDING',
      walletBalance: balanceResult.rows[0].usdc_balance,
      toAddress,
      amount: String(amount),
      asset: 'MUSD',
      network: 'sepolia',
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}


async function confirmPendingWithdrawal({
  transactionId,
  txHash,
  userId,
  tenantId,
  blockNumber = null,
  confirmations = 0,
}) {
  if (!transactionId || !txHash || !userId || !tenantId) {
    throw new Error('transactionId, txHash, userId y tenantId son obligatorios');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const txResult = await client.query(
      `
      SELECT id, tenant_id, user_id, operation_type, status
      FROM ledger_transactions
      WHERE id = $1
      AND user_id = $2
      AND tenant_id = $3
      FOR UPDATE
      `,
      [transactionId, userId, tenantId]
    );

    if (txResult.rowCount === 0) {
      throw new Error('Transacción de ledger no encontrada');
    }

    const ledgerTx = txResult.rows[0];

    if (ledgerTx.operation_type !== 'WITHDRAWAL') {
      throw new Error('La transacción no es un WITHDRAWAL');
    }

    if (ledgerTx.status === 'CONFIRMED') {
      await client.query('ROLLBACK');

      return {
        duplicate: true,
        transactionId: ledgerTx.id,
        status: 'CONFIRMED',
        txHash,
      };
    }

    if (ledgerTx.status !== 'PENDING') {
      throw new Error(
        `Estado de ledger inválido para confirmación: ${ledgerTx.status}`
      );
    }

    const blockchainResult = await client.query(
      `
      UPDATE blockchain_transactions
      SET
        tx_hash = $1,
        status = 'CONFIRMED',
        block_number = $2,
        confirmations = $3
      WHERE operation_id = $4
        AND status = 'PENDING'
      RETURNING *
      `,
      [txHash, blockNumber, confirmations, transactionId]
    );

    if (blockchainResult.rowCount === 0) {
      throw new Error(
        'Registro blockchain PENDING no encontrado para el retiro'
      );
    }

    const ledgerUpdate = await client.query(
      `
      UPDATE ledger_transactions
      SET status = 'CONFIRMED'
      WHERE id = $1
        AND status = 'PENDING'
      RETURNING id, status
      `,
      [transactionId]
    );

    if (ledgerUpdate.rowCount === 0) {
      throw new Error('No se pudo confirmar la transacción de ledger');
    }

    await client.query('COMMIT');

    return {
      duplicate: false,
      transactionId,
      status: 'CONFIRMED',
      txHash,
      blockchain: blockchainResult.rows[0],
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}


async function failPendingWithdrawal({
  transactionId,
  userId,
  tenantId,
  address,
}) {
  if (!transactionId || !userId || !tenantId || !address) {
    throw new Error('Datos insuficientes para cancelar el retiro');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const txResult = await client.query(
      `
      SELECT id, tenant_id, operation_type, status
      FROM ledger_transactions
      WHERE id = $1
      FOR UPDATE
      `,
      [transactionId]
    );

    if (txResult.rowCount === 0) {
      throw new Error('Transacción de ledger no encontrada');
    }

    const ledgerTx = txResult.rows[0];

    if (ledgerTx.operation_type !== 'WITHDRAWAL') {
      throw new Error('La transacción no es un WITHDRAWAL');
    }

    if (String(ledgerTx.tenant_id) !== String(tenantId)) {
      throw new Error('La transacción no pertenece al tenant');
    }

    if (ledgerTx.status === 'FAILED') {
      await client.query('ROLLBACK');
      return {
        duplicate: true,
        transactionId,
        status: 'FAILED',
      };
    }

    if (ledgerTx.status !== 'PENDING') {
      throw new Error(
        `Estado de ledger inválido para fallo: ${ledgerTx.status}`
      );
    }

    const blockchainResult = await client.query(
      `
      SELECT id, amount, status
      FROM blockchain_transactions
      WHERE operation_id = $1
      FOR UPDATE
      `,
      [transactionId]
    );

    if (blockchainResult.rowCount === 0) {
      throw new Error('Registro blockchain no encontrado para el retiro');
    }

    const blockchainTx = blockchainResult.rows[0];

    if (blockchainTx.status !== 'PENDING') {
      throw new Error(
        `Estado blockchain inválido para fallo: ${blockchainTx.status}`
      );
    }

    const amount = Number(blockchainTx.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Monto de reversión inválido');
    }

    const walletResult = await client.query(
      `
      SELECT id, usdc_balance
      FROM wallets
      WHERE user_id = $1
        AND tenant_id = $2
        AND user_address = $3
      FOR UPDATE
      `,
      [userId, tenantId, address]
    );

    if (walletResult.rowCount === 0) {
      throw new Error('Wallet no encontrada para reversión');
    }

    const balanceResult = await client.query(
      `
      UPDATE wallets
      SET usdc_balance =
        (CAST(usdc_balance AS NUMERIC) + $2)::TEXT
      WHERE id = $1
      RETURNING usdc_balance
      `,
      [walletResult.rows[0].id, amount]
    );

    await client.query(
      `
      UPDATE blockchain_transactions
      SET status = 'FAILED'
      WHERE id = $1
        AND status = 'PENDING'
      `,
      [blockchainTx.id]
    );

    const ledgerUpdate = await client.query(
      `
      UPDATE ledger_transactions
      SET status = 'FAILED'
      WHERE id = $1
        AND status = 'PENDING'
      RETURNING id, status
      `,
      [transactionId]
    );

    if (ledgerUpdate.rowCount === 0) {
      throw new Error('No se pudo marcar el ledger como FAILED');
    }

    await client.query('COMMIT');

    return {
      duplicate: false,
      transactionId,
      status: 'FAILED',
      restoredAmount: String(amount),
      walletBalance: balanceResult.rows[0].usdc_balance,
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  deposit,
  withdraw,
  createPendingWithdrawal,
  confirmPendingWithdrawal,
  failPendingWithdrawal,
};

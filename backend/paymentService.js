const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Simula un depósito de USDC.
// La actualización de wallet y el ledger son una sola transacción.
async function deposit(address, amount) {
  const numericAmount = Number(amount);

  if (!address || !Number.isFinite(numericAmount) || numericAmount <= 0) {
    console.error('❌ Depósito inválido');
    return null;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE wallets
       SET usdc_balance =
         (CAST(usdc_balance AS NUMERIC) + $2)::TEXT
       WHERE user_address = $1
       RETURNING *`,
      [address, numericAmount]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      console.error(`❌ Wallet no encontrada para depósito: ${address}`);
      return null;
    }

    await client.query(
      `INSERT INTO ledger (tx_hash, user_address, amount, type)
       VALUES ($1, $2, $3, 'deposit')`,
      [`sim_${Date.now()}`, address, numericAmount]
    );

    await client.query('COMMIT');

    console.log(
      `✅ Depósito simulado de ${numericAmount} USDC para ${address}`
    );

    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Error en depósito:', error.message);
    return null;
  } finally {
    client.release();
  }
}

// Simula un retiro de USDC.
// La actualización de wallet y el ledger son una sola transacción.
async function withdraw(address, amount) {
  const numericAmount = Number(amount);

  if (!address || !Number.isFinite(numericAmount) || numericAmount <= 0) {
    console.error('❌ Retiro inválido');
    return null;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE wallets
       SET usdc_balance =
         (CAST(usdc_balance AS NUMERIC) - $2)::TEXT
       WHERE user_address = $1
         AND CAST(usdc_balance AS NUMERIC) >= $2
       RETURNING *`,
      [address, numericAmount]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      console.log(
        `⚠ Fondos insuficientes o wallet inexistente: ${address}`
      );
      return null;
    }

    await client.query(
      `INSERT INTO ledger (tx_hash, user_address, amount, type)
       VALUES ($1, $2, $3, 'withdraw')`,
      [`sim_${Date.now()}`, address, numericAmount]
    );

    await client.query('COMMIT');

    console.log(
      `✅ Retiro simulado de ${numericAmount} USDC para ${address}`
    );

    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Error en retiro:', error.message);
    return null;
  } finally {
    client.release();
  }
}

module.exports = { deposit, withdraw };

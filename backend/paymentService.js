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
// IMPORTANTE: nunca crea una wallet nueva.
// La wallet debe existir previamente.
async function deposit(address, amount) {
  try {
    const result = await pool.query(
      `UPDATE wallets
       SET usdc_balance =
         (CAST(usdc_balance AS NUMERIC) + CAST($2 AS NUMERIC))::TEXT
       WHERE user_address = $1
       RETURNING *`,
      [address, amount]
    );

    if (result.rowCount === 0) {
      console.error(`❌ Wallet no encontrada para depósito: ${address}`);
      return null;
    }

    await pool.query(
      `INSERT INTO ledger (tx_hash, user_address, amount, type)
       VALUES ($1, $2, $3, 'deposit')`,
      [`sim_${Date.now()}`, address, amount]
    );

    console.log(`✅ Depósito simulado de ${amount} USDC para ${address}`);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error en depósito:', error.message);
    return null;
  }
}

// Simula un retiro de USDC.
async function withdraw(address, amount) {
  try {
    const result = await pool.query(
      `UPDATE wallets
       SET usdc_balance =
         (CAST(usdc_balance AS NUMERIC) - CAST($2 AS NUMERIC))::TEXT
       WHERE user_address = $1
         AND CAST(usdc_balance AS NUMERIC) >= CAST($2 AS NUMERIC)
       RETURNING *`,
      [address, amount]
    );

    if (result.rowCount === 0) {
      console.log(`⚠ Fondos insuficientes o wallet inexistente: ${address}`);
      return null;
    }

    await pool.query(
      `INSERT INTO ledger (tx_hash, user_address, amount, type)
       VALUES ($1, $2, $3, 'withdraw')`,
      [`sim_${Date.now()}`, address, amount]
    );

    console.log(`✅ Retiro simulado de ${amount} USDC para ${address}`);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error en retiro:', error.message);
    return null;
  }
}

module.exports = { deposit, withdraw };

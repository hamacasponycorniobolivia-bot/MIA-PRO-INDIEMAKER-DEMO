const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function init() {
  console.log('Creando tablas de pagos...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS wallets (
      id SERIAL PRIMARY KEY,
      user_address VARCHAR(255) UNIQUE NOT NULL,
      usdc_balance VARCHAR(255) DEFAULT '0',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ledger (
      id SERIAL PRIMARY KEY,
      tx_hash VARCHAR(255) UNIQUE NOT NULL,
      user_address VARCHAR(255) NOT NULL,
      amount VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('Tablas de pagos creadas correctamente.');
  process.exit(0);
}

init().catch((err) => {
  console.error('Error creando tablas de pagos:', err);
  process.exit(1);
});

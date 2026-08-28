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
  console.log('Creando tablas...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS assets (
      id SERIAL PRIMARY KEY,
      token_id VARCHAR(255) UNIQUE NOT NULL,
      owner_address VARCHAR(255) NOT NULL,
      metadata_uri TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS listings (
      id SERIAL PRIMARY KEY,
      token_id VARCHAR(255) NOT NULL,
      seller_address VARCHAR(255) NOT NULL,
      price_wei VARCHAR(255) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (token_id) REFERENCES assets(token_id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      tx_hash VARCHAR(255) UNIQUE NOT NULL,
      event_type VARCHAR(100) NOT NULL,
      from_address VARCHAR(255),
      to_address VARCHAR(255),
      token_id VARCHAR(255),
      amount VARCHAR(255),
      block_number BIGINT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('Tablas creadas correctamente.');
  process.exit(0);
}

init().catch((err) => {
  console.error('Error creando tablas:', err);
  process.exit(1);
});

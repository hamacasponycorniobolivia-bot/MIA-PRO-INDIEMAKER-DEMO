const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');
const { authenticate } = require('./middleware');

dotenv.config({ path: path.join(__dirname, '.env') });

const router = express.Router();

const REQUIRED_ENV = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'DB_NAME', 'JWT_SECRET'];

for (const name of REQUIRED_ENV) {
  if (!process.env[name]) {
    throw new Error(`${name} is required`);
  }
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'mia-pro',
      audience: 'mia-pro-client'
    }
  );
}

// Registrar usuario
router.post('/register', async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Faltan email o password'
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      error: 'La contraseña debe tener al menos 8 caracteres'
    });
  }

  if (email.length > 254) {
    return res.status(400).json({
      error: 'Email inválido'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const hashedPassword = await bcrypt.hash(password, 12);

    const userResult = await client.query(
      `INSERT INTO users
        (email, password_hash, role, tenant_id)
       VALUES ($1, $2, 'USER', 1)
       RETURNING id, email, role, tenant_id`,
      [email, hashedPassword]
    );

    const user = userResult.rows[0];

    const walletAddress = `0xMIA_USER_${user.id}_${Date.now()}`;

    await client.query(
      `INSERT INTO wallets
        (user_address, usdc_balance, user_id, tenant_id)
       VALUES ($1, '0', $2, $3)`,
      [walletAddress, user.id, user.tenant_id]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      user,
      wallet: {
        user_address: walletAddress,
        usdc_balance: '0',
        tenant_id: user.tenant_id
      }
    });

  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});

    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Email ya registrado'
      });
    }

    console.error('REGISTER ERROR:', error.message);

    return res.status(500).json({
      error: 'Error al registrar'
    });

  } finally {
    client.release();
  }
});

// Iniciar sesión
router.post('/login', async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Faltan email o password'
    });
  }

  try {
    const result = await pool.query(
      `SELECT id, email, password_hash, role, tenant_id
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    const token = createToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id
      }
    });

  } catch (error) {
    console.error('LOGIN ERROR:', error.message);

    return res.status(500).json({
      error: 'Error al iniciar sesión'
    });
  }
});

// Sesión actual
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, role, tenant_id
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        error: 'Usuario no encontrado'
      });
    }

    return res.json({
      user: result.rows[0]
    });

  } catch (error) {
    console.error('AUTH ME ERROR:', error.message);

    return res.status(500).json({
      error: 'Error al obtener sesión'
    });
  }
});

// Estado de la sesión autenticada
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, role, tenant_id
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        error: 'Usuario no encontrado'
      });
    }

    const user = result.rows[0];

    return res.json({
      sessions: [
        {
          user_id: user.id,
          email: user.email,
          role: user.role,
          tenant_id: user.tenant_id,
          authenticated: true
        }
      ]
    });

  } catch (error) {
    console.error('AUTH SESSIONS ERROR:', error.message);

    return res.status(500).json({
      error: 'Error al obtener sesiones'
    });
  }
});

module.exports = router;

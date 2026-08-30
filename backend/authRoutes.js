const { authenticate } = require('./middleware');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const router = express.Router();
const pool = new Pool({
  connectionString: `postgresql://${encodeURIComponent(process.env.DB_USER || 'mia')}:${encodeURIComponent(process.env.DB_PASSWORD || '')}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${encodeURIComponent(process.env.DB_NAME || 'mia')}?schema=public`
});

const JWT_SECRET = process.env.JWT_SECRET;

// Registrar usuario
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan email o password' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, role, tenant_id)
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

    res.status(201).json({
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
      return res.status(409).json({ error: 'Email ya registrado' });
    }

    console.error('REGISTER ERROR:', error);
    res.status(500).json({ error: 'Error al registrar' });

  } finally {
    client.release();
  }
});
// Iniciar sesión
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan email o password' });
  }

  try {
    const result = await pool.query(
      `SELECT id, email, password_hash, role FROM users WHERE email = $1`,
      [email]
    );
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Sesión actual
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('AUTH ME ERROR:', error);
    res.status(500).json({ error: 'Error al obtener sesión' });
  }
});

module.exports = router;

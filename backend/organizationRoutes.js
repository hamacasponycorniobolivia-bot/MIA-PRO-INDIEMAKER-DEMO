const express = require('express');
const { Pool } = require('pg');
const { authenticate, requireRole } = require('./middleware');
require('dotenv').config();

const router = express.Router();
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Crear organización (PROTEGIDO)
router.post('/', authenticate, requireRole('SUPER_ADMIN', 'TENANT_OWNER', 'ADMIN'), async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Faltan name' });
  }

  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    const result = await pool.query(
      `INSERT INTO organizations (name, slug)
       VALUES ($1, $2)
       RETURNING id, name, slug`,
      [name, slug]
    );
    res.status(201).json({ organization: result.rows[0] });
  } catch (error) {
    console.error('ORGANIZATION CREATE ERROR:', error);
    res.status(500).json({ error: 'Error al crear organización' });
  }
});

// Obtener organizaciones (PROTEGIDO)
router.get('/', authenticate, requireRole('SUPER_ADMIN', 'TENANT_OWNER', 'ADMIN'), async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, slug, created_at FROM organizations ORDER BY id DESC');
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Error al obtener organizaciones' });
  }
});

module.exports = router;

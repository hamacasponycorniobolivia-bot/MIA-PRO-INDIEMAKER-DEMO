const express = require('express');
const { Pool } = require('pg');
const { authenticate, requireRole } = require('./middleware');
require('dotenv').config();

const router = express.Router();

// ===== SSRF PROTECTION =====
const dns = require('dns').promises;
const net = require('net');

function isPrivateIPv4(ip) {
  const parts = ip.split('.').map(Number);

  if (parts.length !== 4 || parts.some(Number.isNaN)) {
    return false;
  }

  const [a, b] = parts;

  return (
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a === 0
  );
}

function isPrivateIPv6(ip) {
  const normalized = ip.toLowerCase();

  return (
    normalized === '::' ||
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe80:')
  );
}

async function validateWebhookCreationUrl(rawUrl) {
  let parsed;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('URL de webhook invalida');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('El webhook debe utilizar HTTP o HTTPS');
  }

  if (parsed.username || parsed.password) {
    throw new Error('Las credenciales dentro de la URL no estan permitidas');
  }

  const hostname = parsed.hostname.toLowerCase();

  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname === 'ip6-localhost' ||
    hostname === 'ip6-loopback'
  ) {
    throw new Error('La URL del webhook apunta a un host local');
  }

  if (net.isIP(hostname)) {
    if (net.isIP(hostname) === 4 && isPrivateIPv4(hostname)) {
      throw new Error('La URL del webhook apunta a una IP privada o local');
    }

    if (net.isIP(hostname) === 6 && isPrivateIPv6(hostname)) {
      throw new Error('La URL del webhook apunta a una IP privada o local');
    }

    return parsed.toString();
  }

  let addresses;

  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch {
    throw new Error('No se pudo resolver el host del webhook');
  }

  if (!addresses.length) {
    throw new Error('El host del webhook no tiene direccion resoluble');
  }

  for (const address of addresses) {
    const ip = address.address;

    if (net.isIP(ip) === 4 && isPrivateIPv4(ip)) {
      throw new Error('El host del webhook resuelve a una IP privada o local');
    }

    if (net.isIP(ip) === 6 && isPrivateIPv6(ip)) {
      throw new Error('El host del webhook resuelve a una IP privada o local');
    }
  }

  return parsed.toString();
}


const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Crear webhook (Protegido)
router.post('/', authenticate, requireRole('SUPER_ADMIN', 'TENANT_OWNER', 'ADMIN'), async (req, res) => {
  const { url, event_type } = req.body;

    if (!url || !event_type) {
      return res.status(400).json({ error: 'Faltan url o event_type' });
    }

    let safeWebhookUrl;

    try {
      safeWebhookUrl = await validateWebhookCreationUrl(url);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  if (!url || !event_type) {
    return res.status(400).json({ error: 'Faltan url o event_type' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO webhooks (url, event_type)
       VALUES ($1, $2)
       RETURNING id, url, event_type`,
      [safeWebhookUrl, event_type]
    );
    res.status(201).json({ webhook: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear webhook' });
  }
});

// Obtener webhooks (Protegido)
router.get('/', authenticate, requireRole('SUPER_ADMIN', 'TENANT_OWNER', 'ADMIN'), async (req, res) => {
  try {
    const result = await pool.query('SELECT id, url, event_type, created_at FROM webhooks ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener webhooks' });
  }
});

module.exports = router;

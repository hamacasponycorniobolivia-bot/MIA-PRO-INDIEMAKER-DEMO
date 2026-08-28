const { Pool } = require('pg');
const axios = require('axios');

const dns = require('dns').promises;
const net = require('net');

async function validateWebhookUrl(rawUrl) {
  let parsed;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid webhook URL');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Webhook URL must use HTTP or HTTPS');
  }

  if (parsed.username || parsed.password) {
    throw new Error('Webhook URL credentials are not allowed');
  }

  const hostname = parsed.hostname.toLowerCase();

  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname === 'ip6-localhost' ||
    hostname === 'ip6-loopback'
  ) {
    throw new Error('Webhook URL points to a local host');
  }

  if (net.isIP(hostname)) {
    if (net.isIP(hostname) === 4) {
      const [a, b] = hostname.split('.').map(Number);

      if (
        a === 10 ||
        a === 127 ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        a === 0
      ) {
        throw new Error('Webhook URL points to a private or local IPv4 address');
      }
    } else {
      const normalized = hostname.replace(/^\[|\]$/g, '');

      if (
        normalized === '::1' ||
        normalized === '::' ||
        normalized.startsWith('fc') ||
        normalized.startsWith('fd') ||
        normalized.startsWith('fe80:')
      ) {
        throw new Error('Webhook URL points to a private or local IPv6 address');
      }
    }

    return parsed.toString();
  }

  const addresses = await dns.lookup(hostname, { all: true });

  for (const address of addresses) {
    const ip = address.address;

    if (net.isIP(ip) === 4) {
      const [a, b] = ip.split('.').map(Number);

      if (
        a === 10 ||
        a === 127 ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        a === 0
      ) {
        throw new Error('Webhook hostname resolves to a private or local IPv4 address');
      }
    }

    if (net.isIP(ip) === 6) {
      const normalized = ip.toLowerCase();

      if (
        normalized === '::1' ||
        normalized === '::' ||
        normalized.startsWith('fc') ||
        normalized.startsWith('fd') ||
        normalized.startsWith('fe80:')
      ) {
        throw new Error('Webhook hostname resolves to a private or local IPv6 address');
      }
    }
  }

  return parsed.toString();
}


require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const MAX_ATTEMPTS = 5;
const RETRY_DELAYS_SECONDS = [10, 30, 60, 120];

async function processWebhookDeliveries() {
  const result = await pool.query(`
    SELECT d.id, d.webhook_id, d.payload, d.attempts, w.url
    FROM webhook_deliveries d
    JOIN webhooks w ON w.id = d.webhook_id
    WHERE d.status = 'PENDING'
      AND (d.next_attempt_at IS NULL OR d.next_attempt_at <= NOW())
    ORDER BY d.id ASC
    LIMIT 10
  `);

  for (const delivery of result.rows) {
    try {
      const safeWebhookUrl = await validateWebhookUrl(delivery.url);

      await axios.post(safeWebhookUrl, delivery.payload, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await pool.query(
        `
        UPDATE webhook_deliveries
        SET status = 'SENT',
            attempts = attempts + 1,
            next_attempt_at = NULL
        WHERE id = $1
        `,
        [delivery.id]
      );

      console.log(`Webhook ${delivery.id}: SENT`);
    } catch (error) {
      const nextAttempt = delivery.attempts + 1;

      if (nextAttempt >= MAX_ATTEMPTS) {
        await pool.query(
          `
          UPDATE webhook_deliveries
          SET status = 'FAILED',
              attempts = $2,
              next_attempt_at = NULL
          WHERE id = $1
          `,
          [delivery.id, nextAttempt]
        );

        console.error(
          `Webhook ${delivery.id}: FAILED permanently after ${nextAttempt} attempts - ${error.message}`
        );
      } else {
        const delaySeconds =
          RETRY_DELAYS_SECONDS[Math.min(nextAttempt - 1, RETRY_DELAYS_SECONDS.length - 1)];

        await pool.query(
          `
          UPDATE webhook_deliveries
          SET status = 'PENDING',
              attempts = $2,
              next_attempt_at = NOW() + ($3 * INTERVAL '1 second')
          WHERE id = $1
          `,
          [delivery.id, nextAttempt, delaySeconds]
        );

        console.error(
          `Webhook ${delivery.id}: FAILED - ${error.message}. Retry in ${delaySeconds}s`
        );
      }
    }
  }

  return result.rows.length;
}

module.exports = { processWebhookDeliveries };

const crypto = require('crypto');
const express = require('express');
const pool = require('./db');

const router = express.Router();

const MAX_TIMESTAMP_AGE_SECONDS = 300;

function getAppSumoApiKey() {
  return process.env.APPSUMO_API_KEY;
}

function verifyAppSumoSignature(req) {
  const apiKey = getAppSumoApiKey();
  const signature = req.get('X-Appsumo-Signature');
  const timestamp = req.get('X-Appsumo-Timestamp');

  if (!apiKey || !signature || !timestamp || !req.rawBody) {
    return false;
  }

  const timestampNumber = Number(timestamp);

  if (!Number.isInteger(timestampNumber)) {
    return false;
  }

  const age = Math.abs(
    Math.floor(Date.now() / 1000) - timestampNumber
  );

  if (age > MAX_TIMESTAMP_AGE_SECONDS) {
    return false;
  }

  const payload = `${timestamp}${req.rawBody.toString('utf8')}`;

  const expected = crypto
    .createHmac('sha256', apiKey)
    .update(payload)
    .digest('hex');

  const provided = signature.startsWith('sha256=')
    ? signature.slice(7)
    : signature;

  if (!/^[a-f0-9]{64}$/i.test(provided)) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(provided, 'hex')
  );
}

router.post('/webhook', async (req, res) => {
  if (req.body && req.body.test === true) {
    return res.status(200).json({
      event: req.body.event,
      success: true
    });
  }

  if (!verifyAppSumoSignature(req)) {
    return res.status(401).json({
      success: false,
      error: 'Invalid AppSumo signature'
    });
  }

  const {
    event,
    license_key: licenseKey,
    license_status: licenseStatus,
    event_timestamp: eventTimestamp,
    test
  } = req.body || {};

  if (!event) {
    return res.status(400).json({
      success: false,
      error: 'Missing event'
    });
  }

  if (!licenseKey) {
    return res.status(400).json({
      success: false,
      error: 'Missing license_key'
    });
  }

  if (test === true) {
    console.log(`AppSumo webhook de prueba recibido: ${event}`);

    return res.status(200).json({
      event,
      success: true
    });
  }

  try {
    await pool.query(
      `INSERT INTO appsumo_licenses
        (
          license_key,
          event,
          license_status,
          event_timestamp,
          raw_payload,
          updated_at
        )
       VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
       ON CONFLICT (license_key)
       DO UPDATE SET
         event = EXCLUDED.event,
         license_status = EXCLUDED.license_status,
         event_timestamp = EXCLUDED.event_timestamp,
         raw_payload = EXCLUDED.raw_payload,
         updated_at = NOW()`,
      [
        licenseKey,
        event,
        licenseStatus || null,
        eventTimestamp || null,
        JSON.stringify(req.body)
      ]
    );

    console.log(
      `AppSumo webhook procesado: ${event} - ${licenseKey}`
    );

    return res.status(200).json({
      event,
      success: true
    });
  } catch (error) {
    console.error(
      'AppSumo webhook DB error:',
      error.message
    );

    return res.status(500).json({
      success: false,
      error: 'Failed to persist AppSumo webhook'
    });
  }
});

router.get('/oauth/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).json({
      success: false,
      error: 'AppSumo OAuth authorization failed',
      details: error
    });
  }

  if (!code) {
    return res.status(200).json({
      success: true
    });
  }

  const clientId = process.env.APPSUMO_CLIENT_ID;
  const clientSecret = process.env.APPSUMO_CLIENT_SECRET;
  const redirectUri = process.env.APPSUMO_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(500).json({
      success: false,
      error: 'AppSumo OAuth configuration is incomplete'
    });
  }

  try {
    const response = await fetch(
      'https://appsumo.com/openid/token/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      }
    );

    const tokenData = await response.json();

    if (!response.ok || !tokenData.access_token) {
      console.error(
        'AppSumo OAuth token error:',
        tokenData
      );

      return res.status(502).json({
        success: false,
        error: 'AppSumo OAuth token exchange failed'
      });
    }

    return res.status(200).json({
      success: true,
      access_token_received: true,
      expires_in: tokenData.expires_in || null
    });
  } catch (error) {
    console.error(
      'AppSumo OAuth request error:',
      error.message
    );

    return res.status(502).json({
      success: false,
      error: 'Failed to connect to AppSumo OAuth'
    });
  }
});

module.exports = router;

const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');
const { authenticate } = require('./middleware');
const { generateSecret, generateURI, verify } = require('otplib');
const QRCode = require('qrcode');
const { encryptSecret, decryptSecret } = require('./totpCrypto');

const RECOVERY_CODE_COUNT = 10;
const RECOVERY_CODE_BYTES = 16;

function generateRecoveryCode() {
  const raw = crypto.randomBytes(RECOVERY_CODE_BYTES).toString('hex').toUpperCase();
  return raw.match(/.{1,4}/g).join('-');
}

function hashRecoveryCode(code) {
  return crypto
    .createHash('sha256')
    .update(String(code).replace(/-/g, '').toUpperCase(), 'utf8')
    .digest('hex');
}

function generateRecoveryCodes() {
  return Array.from(
    { length: RECOVERY_CODE_COUNT },
    generateRecoveryCode
  );
}

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
      `SELECT id, email, password_hash, role, tenant_id,
              two_factor_enabled, two_factor_secret, two_factor_last_used_step
       FROM users
       WHERE LOWER(email) = LOWER($1)
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

  if (user.two_factor_enabled) {
    const twoFactorCode = String(req.body.twoFactorCode || '').trim();
    const recoveryCode = String(req.body.recoveryCode || '').trim();

    if (twoFactorCode) {
      if (!/^\d{6}$/.test(twoFactorCode)) {
        return res.status(401).json({
          error: 'Código 2FA inválido',
          two_factor_required: true
        });
      }

      if (!user.two_factor_secret) {
        console.error('LOGIN 2FA ERROR: secreto 2FA ausente');
        return res.status(500).json({
          error: 'Configuración 2FA inválida'
        });
      }

      const secret = decryptSecret(user.two_factor_secret);
      const verification = await verify({
        secret,
        token: twoFactorCode
      });

      if (!verification.valid) {
        return res.status(401).json({
          error: 'Código 2FA inválido o expirado',
          two_factor_required: true
        });
      }
        const currentTotpStep = Math.floor(Date.now() / 30000);

    const replayResult = await pool.query(
      `UPDATE users
       SET two_factor_last_used_step = $1
       WHERE id = $2
         AND two_factor_last_used_step IS DISTINCT FROM $1
       RETURNING id`,
      [currentTotpStep, user.id]
    );

    if (replayResult.rowCount !== 1) {
      return res.status(401).json({
        error: 'Código 2FA ya utilizado',
        two_factor_required: true
      });
    }

} else if (recoveryCode) {
      const normalizedRecoveryCode = recoveryCode
        .replace(/-/g, '')
        .toUpperCase();

      if (!/^[A-F0-9]{32}$/.test(normalizedRecoveryCode)) {
        return res.status(401).json({
          error: 'Código de recuperación inválido',
          two_factor_required: true
        });
      }

      const recoveryCodeHash = hashRecoveryCode(recoveryCode);
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        const recoveryResult = await client.query(
          `SELECT id
           FROM two_factor_recovery_codes
           WHERE user_id = $1
             AND code_hash = $2
             AND used_at IS NULL
           FOR UPDATE`,
          [user.id, recoveryCodeHash]
        );

        if (recoveryResult.rowCount !== 1) {
          await client.query('ROLLBACK');

          return res.status(401).json({
            error: 'Código de recuperación inválido o ya utilizado',
            two_factor_required: true
          });
        }

        await client.query(
          `UPDATE two_factor_recovery_codes
           SET used_at = CURRENT_TIMESTAMP
           WHERE id = $1
             AND used_at IS NULL`,
          [recoveryResult.rows[0].id]
        );

        await client.query('COMMIT');
      } catch (recoveryError) {
        await client.query('ROLLBACK');
        throw recoveryError;
      } finally {
        client.release();
      }
    } else {
      return res.status(401).json({
        error: 'Se requiere un código 2FA o un código de recuperación',
        two_factor_required: true
      });
    }
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

// Cambiar contraseña del usuario autenticado
router.post('/change-password', authenticate, async (req, res) => {
  const currentPassword = String(req.body.currentPassword || '');
  const newPassword = String(req.body.newPassword || '');
  const confirmPassword = String(req.body.confirmPassword || '');

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      error: 'Faltan currentPassword, newPassword o confirmPassword'
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      error: 'La nueva contraseña debe tener al menos 8 caracteres'
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      error: 'Las nuevas contraseñas no coinciden'
    });
  }

  try {
    const result = await pool.query(
      `SELECT password_hash
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

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      result.rows[0].password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: 'La contraseña actual es incorrecta'
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        error: 'La nueva contraseña debe ser diferente de la actual'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await pool.query(
      `UPDATE users
       SET password_hash = $1
       WHERE id = $2`,
      [hashedPassword, req.user.id]
    );

    return res.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('CHANGE PASSWORD ERROR:', error.message);

    return res.status(500).json({
      error: 'Error al cambiar la contraseña'
    });
  }
});


// Iniciar configuración de autenticación 2FA mediante TOTP
router.post('/2fa/setup', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT email, two_factor_enabled
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    if (user.two_factor_enabled) {
      return res.status(409).json({
        error: 'La autenticación 2FA ya está activada'
      });
    }

    const secret = generateSecret();
    const encryptedSecret = encryptSecret(secret);
    const otpauth = generateURI({
      issuer: 'MIA Pro',
      label: user.email,
      secret
    });

    const qrCode = await QRCode.toDataURL(otpauth);

    await pool.query(
      `UPDATE users
       SET two_factor_secret = $1
       WHERE id = $2`,
      [encryptedSecret, req.user.id]
    );

    return res.json({
      success: true,
      otpauth,
      qrCode
    });
  } catch (error) {
    console.error('2FA SETUP ERROR:', error.message);

    return res.status(500).json({
      error: 'Error al iniciar configuración 2FA'
    });
  }
});

// Confirmar código TOTP y activar 2FA
router.post('/2fa/enable', authenticate, async (req, res) => {
  const code = String(req.body.code || '').trim();

  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({
      error: 'El código 2FA debe tener 6 dígitos'
    });
  }

  try {
    const result = await pool.query(
      `SELECT two_factor_enabled, two_factor_secret
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    if (user.two_factor_enabled) {
      return res.status(409).json({
        error: 'La autenticación 2FA ya está activada'
      });
    }

    if (!user.two_factor_secret) {
      return res.status(400).json({
        error: 'Primero debe iniciarse la configuración 2FA'
      });
    }

    const secret = decryptSecret(user.two_factor_secret);
    const verification = await verify({
      secret,
      token: code
    });

    if (!verification.valid) {
      return res.status(401).json({
        error: 'Código 2FA inválido o expirado'
      });
    }

    const recoveryCodes = generateRecoveryCodes();
  const recoveryCodeHashes = recoveryCodes.map(hashRecoveryCode);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      `DELETE FROM two_factor_recovery_codes
       WHERE user_id = $1`,
      [req.user.id]
    );

    for (const codeHash of recoveryCodeHashes) {
      await client.query(
        `INSERT INTO two_factor_recovery_codes (user_id, code_hash)
         VALUES ($1, $2)`,
        [req.user.id, codeHash]
      );
    }

    await client.query(
      `UPDATE users
       SET two_factor_enabled = TRUE
       WHERE id = $1`,
      [req.user.id]
    );

    await client.query('COMMIT');
  } catch (transactionError) {
    await client.query('ROLLBACK');
    throw transactionError;
  } finally {
    client.release();
  }

  return res.json({
    success: true,
    message: 'Autenticación 2FA activada correctamente',
    recoveryCodes
  });
  } catch (error) {
    console.error('2FA ENABLE ERROR:', error.message);

    return res.status(500).json({
      error: 'Error al activar 2FA'
    });
  }
});

// Desactivar 2FA: requiere password actual y código TOTP válido
router.post('/2fa/disable', authenticate, async (req, res) => {
  const password = String(req.body.password || '');
  const code = String(req.body.code || '').trim();

  if (!password) {
    return res.status(400).json({
      error: 'Se requiere la contraseña actual'
    });
  }

  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({
      error: 'El código 2FA debe tener 6 dígitos'
    });
  }

  try {
    const result = await pool.query(
      `SELECT password_hash, two_factor_enabled, two_factor_secret
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

    if (!user.two_factor_enabled || !user.two_factor_secret) {
      return res.status(409).json({
        error: 'La autenticación 2FA no está activada'
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: 'Contraseña inválida'
      });
    }

    const secret = decryptSecret(user.two_factor_secret);
    const verification = await verify({
      secret,
      token: code
    });

    if (!verification.valid) {
      return res.status(401).json({
        error: 'Código 2FA inválido o expirado'
      });
    }

    await pool.query(
      `UPDATE users
       SET two_factor_enabled = FALSE,
           two_factor_secret = NULL
       WHERE id = $1`,
      [req.user.id]
    );

    return res.json({
      success: true,
      message: 'Autenticación 2FA desactivada correctamente'
    });
  } catch (error) {
    console.error('2FA DISABLE ERROR:', error.message);

    return res.status(500).json({
      error: 'Error al desactivar 2FA'
    });
  }
});

// Estado de la autenticación 2FA
router.get('/2fa/status', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT two_factor_enabled
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    return res.json({
      enabled: Boolean(result.rows[0].two_factor_enabled)
    });
  } catch (error) {
    console.error('2FA STATUS ERROR:', error.message);

    return res.status(500).json({
      error: 'Error al consultar estado 2FA'
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

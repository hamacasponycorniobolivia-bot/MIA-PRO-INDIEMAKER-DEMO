require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const { createClient } = require('redis');
const { deposit, withdraw } = require('./paymentService');
const authRoutes = require('./authRoutes');
const organizationRoutes = require('./organizationRoutes');
const webhookRoutes = require('./webhookRoutes');
const { authenticate, requireRole } = require('./middleware');
const { logAudit } = require('./auditService');
const { createOutboxEvent, processOutbox } = require('./outboxService');
const { register, httpRequestsTotal, httpRequestDuration } = require('./metrics');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
require('dotenv').config();

const app = express();

const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT || 6380)
  }
});

redis.on('error', (err) => {
  console.error('Redis error:', err.message);
});

redis.connect().catch((err) => {
  console.error('Redis connection failed:', err.message);
});
app.use(helmet());
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const API_KEY = process.env.API_KEY;
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:4173,http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS origin not allowed'));
  },
  credentials: true
}));
app.use(express.json());
app.use(limiter);

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    httpRequestsTotal.inc({ method: req.method, route: req.path });
    httpRequestDuration.observe({ method: req.method, route: req.path }, (Date.now() - start) / 1000);
  });
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/webhooks', webhookRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/health', (req, res) => res.json({ status: 'online' }));

app.get('/api/inventory/:address', async (req, res) => {
  try {
    const result = await pool.query('SELECT token_id, owner_address, created_at FROM assets WHERE owner_address ILIKE $1', [`%${req.params.address}%`]);
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: 'Error al obtener inventario' }); }
});

app.get('/api/listings', async (req, res) => {
  const cacheKey = 'mia:listings';

  try {
    if (redis.isReady) {
      const cached = await redis.get(cacheKey);

      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }
  } catch (error) {
    console.error('Redis cache read failed:', error.message);
  }

  try {
    const result = await pool.query(
      'SELECT token_id, seller_address, price_wei FROM listings WHERE is_active = TRUE'
    );

    try {
      if (redis.isReady) {
        await redis.set(cacheKey, JSON.stringify(result.rows), { EX: 60 });
      }
    } catch (error) {
      console.error('Redis cache write failed:', error);
    }

    res.json(result.rows);
  } catch (error) {
    console.error('LISTINGS ERROR:', error); res.status(500).json({ error: 'Error al obtener listings' });
  }
});


app.get('/api/wallet/me', authenticate, async (req, res) => {
  try {
    const walletResult = await pool.query(
      `SELECT user_address, usdc_balance
       FROM wallets
       WHERE user_id = $1`,
      [req.user.id]
    );

    if (walletResult.rowCount === 0) {
      return res.status(404).json({ error: 'Wallet no encontrada' });
    }

    const wallet = walletResult.rows[0];

    const ledgerResult = await pool.query(
      `SELECT id, tx_hash, user_address, amount, type, created_at
       FROM ledger
       WHERE user_address = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [wallet.user_address]
    );

    res.json({
      wallet,
      transactions: ledgerResult.rows
    });
  } catch (error) {
    console.error('WALLET ME ERROR:', error);
    res.status(500).json({ error: 'Error al obtener wallet' });
  }
});

app.get('/api/wallet/:address', async (req, res) => {
  try {
    const result = await pool.query('SELECT user_address, usdc_balance FROM wallets WHERE user_address = $1', [req.params.address]);
    if (result.rowCount === 0) return res.json({ user_address: req.params.address, usdc_balance: '0' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: 'Error al consultar wallet' }); }
});

// ===== WALLET: AUTENTICADO POR JWT =====
app.post('/api/wallet/deposit', authenticate, async (req, res) => {
  const { amount } = req.body;
  if (!amount) return res.status(400).json({ error: 'Falta amount' });

  try {
    const wallet = await pool.query(
      'SELECT user_address FROM wallets WHERE user_id = $1',
      [req.user.id]
    );

    if (wallet.rowCount === 0)
      return res.status(404).json({ error: 'Wallet no encontrada' });

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Monto de depósito inválido' });
    }

    const result = await deposit(wallet.rows[0].user_address, numericAmount);
    if (!result)
      return res.status(500).json({ error: 'Error en depósito' });

    res.json({ success: true, wallet: result });
  } catch (error) {
    res.status(500).json({ error: 'Error en depósito' });
  }
});

app.post('/api/wallet/withdraw', authenticate, async (req, res) => {
  const { amount } = req.body;
  if (!amount) return res.status(400).json({ error: 'Falta amount' });

  try {
    const wallet = await pool.query(
      'SELECT user_address FROM wallets WHERE user_id = $1',
      [req.user.id]
    );

    if (wallet.rowCount === 0)
      return res.status(404).json({ error: 'Wallet no encontrada' });

    const result = await withdraw(wallet.rows[0].user_address, amount);

    if (!result)
      return res.status(400).json({
        success: false,
        error: 'Fondos insuficientes'
      });

    res.json({ success: true, wallet: result });
  } catch (error) {
    res.status(500).json({ error: 'Error en retiro' });
  }
});


app.post('/api/marketplace/list', authenticate, async (req, res) => {
  const { tokenId, price } = req.body;

  if (!tokenId || price === undefined) {
    return res.status(400).json({ error: 'Faltan tokenId o price' });
  }

  const amount = Number(price);

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Precio inválido' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const walletResult = await client.query(
      'SELECT user_address, tenant_id FROM wallets WHERE user_id = $1 FOR UPDATE',
      [req.user.id]
    );

    if (walletResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Wallet no encontrada' });
    }

    const seller = walletResult.rows[0].user_address;
    const tenantId = walletResult.rows[0].tenant_id;

    if (!tenantId) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Usuario sin tenant' });
    }

    const assetResult = await client.query(
      'SELECT owner_address, tenant_id FROM assets WHERE token_id = $1 FOR UPDATE',
      [tokenId]
    );

    if (assetResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Asset no encontrado' });
    }

    if (assetResult.rows[0].owner_address !== seller) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'No eres dueño de este asset' });
    }

    if (assetResult.rows[0].tenant_id !== tenantId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Asset pertenece a otro tenant' });
    }

    const existing = await client.query(
      'SELECT id FROM listings WHERE token_id = $1 AND is_active = TRUE FOR UPDATE',
      [tokenId]
    );

    if (existing.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'El asset ya tiene un listing activo' });
    }

    const result = await client.query(
      `INSERT INTO listings
       (token_id, seller_address, price_wei, is_active, tenant_id)
       VALUES ($1, $2, $3, TRUE, $4)
       RETURNING id, token_id, seller_address, price_wei, is_active, tenant_id`,
      [tokenId, seller, amount, tenantId]
    );

    await createOutboxEvent(client, 'LISTING_CREATED', {
    listing_id: result.rows[0].id,
    token_id: result.rows[0].token_id,
    seller_address: result.rows[0].seller_address,
    price_wei: result.rows[0].price_wei,
    tenant_id: result.rows[0].tenant_id
  });

  await client.query('COMMIT');

  try {
    if (redis.isReady) await redis.del('mia:listings');
  } catch (error) {
    console.error('Redis cache invalidation failed:', error.message);
  }


    res.status(201).json({
      success: true,
      listing: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Marketplace list error:', error);
    res.status(500).json({ error: 'Error creando listing' });
  } finally {
    client.release();
  }
});

app.post('/api/marketplace/buy', authenticate, async (req, res) => {
  const { tokenId } = req.body;

  if (!tokenId) {
    return res.status(400).json({ error: 'Falta tokenId' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const buyerResult = await client.query(
      'SELECT user_address, usdc_balance, tenant_id FROM wallets WHERE user_id = $1 FOR UPDATE',
      [req.user.id]
    );

    if (buyerResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Wallet del comprador no encontrada' });
    }

    const buyer = buyerResult.rows[0].user_address;
    const buyerTenantId = buyerResult.rows[0].tenant_id;
    const balance = Number(buyerResult.rows[0].usdc_balance || 0);

    const listingResult = await client.query(
      `SELECT seller_address, price_wei, tenant_id
       FROM listings
       WHERE token_id = $1
         AND is_active = TRUE
       FOR UPDATE`,
      [tokenId]
    );

    if (listingResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Listing activo no encontrado' });
    }

    const seller = listingResult.rows[0].seller_address;
    const amount = Number(listingResult.rows[0].price_wei);
    const listingTenantId = listingResult.rows[0].tenant_id;

    if (!Number.isFinite(amount) || amount <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Precio del listing inválido' });
    }

    if (!listingTenantId || listingTenantId !== buyerTenantId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Listing pertenece a otro tenant' });
    }

    if (!buyerTenantId) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El comprador no tiene tenant asignado' });
    }

    if (balance < amount) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Fondos insuficientes para comprar'
      });
    }

    const assetResult = await client.query(
      'SELECT owner_address, tenant_id FROM assets WHERE token_id = $1 FOR UPDATE',
      [tokenId]
    );

    if (assetResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Asset no encontrado' });
    }

    if (assetResult.rows[0].owner_address !== seller) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El vendedor no posee este asset' });
    }

    const assetTenantId = assetResult.rows[0].tenant_id;

    if (!assetTenantId || assetTenantId !== buyerTenantId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Asset pertenece a otro tenant' });
    }

    if (buyer === seller) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No puedes comprar tu propio asset' });
    }

    const sellerWalletResult = await client.query(
      'SELECT user_id, tenant_id FROM wallets WHERE user_address = $1 FOR UPDATE',
      [seller]
    );

    if (sellerWalletResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Wallet del vendedor no encontrada' });
    }

    const sellerTenantId = sellerWalletResult.rows[0].tenant_id;

    if (!sellerTenantId || sellerTenantId !== buyerTenantId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Vendedor pertenece a otro tenant' });
    }

    await client.query(
      'UPDATE wallets SET usdc_balance = (CAST(usdc_balance AS NUMERIC) - $2)::TEXT WHERE user_address = $1',
      [buyer, amount]
    );

    await client.query(
      'UPDATE wallets SET usdc_balance = (CAST(usdc_balance AS NUMERIC) + $2)::TEXT WHERE user_address = $1',
      [seller, amount]
    );

    await client.query(
      'INSERT INTO ledger (tx_hash, user_address, amount, type) VALUES ($1, $2, $3, $4)',
      [`sim_${Date.now()}`, buyer, amount, 'purchase']
    );

    await client.query(
      'UPDATE assets SET owner_address = $1, tenant_id = $3 WHERE token_id = $2',
      [buyer, tokenId, buyerTenantId]
    );

    await client.query(
      'UPDATE listings SET is_active = FALSE WHERE token_id = $1 AND is_active = TRUE',
      [tokenId]
    );

    await client.query('COMMIT');

  try {
    if (redis.isReady) await redis.del('mia:listings');
  } catch (error) {
    console.error('Redis cache invalidation failed:', error.message);
  }


    res.json({
      success: true,
      message: 'Compra realizada con USDC'
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Marketplace buy error:', error);
    res.status(500).json({ error: 'Error procesando compra' });
  } finally {
    client.release();
  }
});

app.post('/api/game/entitlements', authenticate, async (req, res) => {
  try {
    const wallet = await pool.query(
      'SELECT user_address FROM wallets WHERE user_id = $1',
      [req.user.id]
    );

    if (wallet.rowCount === 0) {
      return res.status(404).json({ error: 'Wallet no encontrada' });
    }

    const address = wallet.rows[0].user_address;

    const inventory = await pool.query(
      'SELECT token_id FROM assets WHERE owner_address = $1',
      [address]
    );
  const cosmetics = inventory.rows.map(row => row.token_id === '1' ? { name: 'MIA Mask - Shadow', type: 'cosmetic', rarity: 'rare' } : { name: 'Common Item', type: 'cosmetic', rarity: 'common' });
  res.json({ address, cosmetics });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener entitlements" });
  }
});

// ===== AUTH SESSION =====
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, role, tenant_id, created_at
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      user: result.rows[0]
    });
  } catch (error) {
    console.error('AUTH ME ERROR:', error);

    res.status(500).json({
      error: 'Error al recuperar la sesión'
    });
  }
});

// ===== RUTAS DE USUARIOS (SIN AUTH - SOLO API KEY) =====
app.post('/api/users', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  const { email, password, role = 'USER' } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email y contraseña son obligatorios'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: 'La contraseña debe tener al menos 6 caracteres'
    });
  }

  const allowedRoles = ['USER', 'ADMIN', 'SUPER_ADMIN'];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      error: 'Rol inválido'
    });
  }

  try {
    const bcrypt = require('bcrypt');
    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users
       (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id, email, role, tenant_id, created_at`,
      [email, password_hash, role]
    );

    res.status(201).json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('CREATE USER ERROR:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Email ya registrado'
      });
    }

    res.status(500).json({
      error: 'Error al crear usuario'
    });
  }
});

app.get('/api/users', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, role, created_at FROM users ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: 'Error al obtener usuarios' }); }
});

app.delete('/api/users/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  const { id } = req.params;
  try {
    const target = await pool.query('SELECT id, role FROM users WHERE id = $1', [id]);

    if (!target.rows.length) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (target.rows[0].role === 'SUPER_ADMIN') {
      return res.status(403).json({
        error: 'El SUPER_ADMIN está protegido y no puede ser eliminado.'
      });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('DELETE USER ERROR:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});


// ===== ADMIN API =====
// Endpoints administrativos protegidos por SUPER_ADMIN / ADMIN.

app.get('/api/admin/stats', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const users = await pool.query('SELECT COUNT(*)::int AS total FROM users');
    const organizations = await pool.query('SELECT COUNT(*)::int AS total FROM organizations');
    const assets = await pool.query('SELECT COUNT(*)::int AS total FROM assets');
    const listings = await pool.query('SELECT COUNT(*)::int AS total FROM listings');

    res.json({
      users: users.rows[0].total,
      organizations: organizations.rows[0].total,
      assets: assets.rows[0].total,
      listings: listings.rows[0].total
    });
  } catch (error) {
    console.error('ADMIN STATS ERROR:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

app.get('/api/admin/users', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, tenant_id, created_at FROM users ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('ADMIN USERS ERROR:', error);
    res.status(500).json({ error: 'Error al obtener usuarios administrativos' });
  }
});

app.get('/api/admin/audit-logs', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('ADMIN AUDIT LOGS ERROR:', error);
    res.status(500).json({ error: 'Error al obtener audit logs' });
  }
});

app.get('/api/admin/super-user', authenticate, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, tenant_id, created_at FROM users WHERE role = $1 ORDER BY id',
      ['SUPER_ADMIN']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('ADMIN SUPER USER ERROR:', error);
    res.status(500).json({ error: 'Error al obtener super users' });
  }
});


// ===== ADMIN BACKUPS =====
// Backup y restore protegidos por autenticación administrativa.

const { execFile } = require('child_process');
const path = require('path');

app.post(
  '/api/admin/backups',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  async (req, res) => {
    try {
      const backupPath = req.body?.path?.trim();

      if (!backupPath) {
        return res.status(400).json({
          error: 'Debes indicar la ruta donde guardar el backup'
        });
      }

      const backupScript = path.join(__dirname, 'backup.sh');

      execFile(
        backupScript,
        [backupPath],
        { timeout: 120000 },
        (error, stdout, stderr) => {
          if (error) {
            console.error('ADMIN BACKUP ERROR:', stderr || error.message);
            return res.status(500).json({
              error: 'No se pudo crear el backup'
            });
          }

          res.json({
            success: true,
            message: 'Backup creado correctamente',
            file: backupPath,
            output: stdout
          });
        }
      );
    } catch (error) {
      console.error('ADMIN BACKUP ERROR:', error);
      res.status(500).json({
        error: 'Error al ejecutar el backup'
      });
    }
  }
);

app.post(
  '/api/admin/backups/restore',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  async (req, res) => {
    try {
      const backupPath = req.body?.path?.trim();

      if (!backupPath) {
        return res.status(400).json({
          error: 'Debes indicar la ruta del backup'
        });
      }

      const restoreScript = path.join(__dirname, 'restore.sh');

      execFile(
        restoreScript,
        [backupPath],
        { timeout: 120000 },
        (error, stdout, stderr) => {
          if (error) {
            console.error('ADMIN RESTORE ERROR:', stderr || error.message);
            return res.status(500).json({
              error: 'No se pudo restaurar el backup'
            });
          }

          res.json({
            success: true,
            message: 'Backup restaurado correctamente',
            output: stdout
          });
        }
      );
    } catch (error) {
      console.error('ADMIN RESTORE ERROR:', error);
      res.status(500).json({
        error: 'Error al ejecutar el restore'
      });
    }
  }
);

const PORT = process.env.PORT || 3000;

// Procesador del Outbox: convierte eventos pendientes
// en entregas de webhook.
setInterval(async () => {
  try {
    const processed = await processOutbox();
    if (processed > 0) {
      console.log(`Outbox: ${processed} evento(s) procesado(s)`);
    }
  } catch (error) {
    console.error('Outbox worker error:', error.message);
  }
}, 5000);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 API de MIA corriendo en el puerto ${PORT}`);
});

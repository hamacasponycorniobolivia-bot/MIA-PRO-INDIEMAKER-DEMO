require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const pool = require('./db');

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const { rows } = await pool.query(
      'SELECT id, email, role, tenant_id, deleted_at FROM users WHERE id = $1 LIMIT 1',
      [decoded.id]
    );

    const user = rows[0];

    if (!user || user.deleted_at !== null) {
      return res.status(401).json({ error: 'User account is inactive' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id
    };

    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    const userRole = String(req.user?.role || '').toUpperCase();
    const allowedRoles = roles.map(role => String(role).toUpperCase());

    if (!req.user || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };

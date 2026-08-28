const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

// Registrar nuevo usuario
async function registerUser(email, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email, created_at`,
    [email, hashedPassword]
  );
  return result.rows[0];
}

// Iniciar sesión
async function loginUser(email, password) {
  const result = await pool.query(
    `SELECT id, email, password_hash FROM users WHERE email = $1`,
    [email]
  );
  if (result.rowCount === 0) {
    throw new Error('Usuario no encontrado');
  }
  const user = result.rows[0];
  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new Error('Contraseña incorrecta');
  }
  // Crear el token
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
  return { token, user: { id: user.id, email: user.email } };
}

// Verificar token
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { registerUser, loginUser, verifyToken };

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Función mejorada para registrar una acción con todos los detalles
async function logAudit(data) {
  try {
    const {
      actor_email,
      action,
      target,
      tenant_id = null,
      user_id = null,
      ip_address = null,
      user_agent = null,
      old_values = null,
      new_values = null,
      table_name = null,
      record_id = null
    } = data;

    await pool.query(
      `INSERT INTO audit_logs
       (actor_email, action, target, tenant_id, user_id, ip_address, user_agent, old_values, new_values, table_name, record_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [actor_email, action, target, tenant_id, user_id, ip_address, user_agent,
       old_values ? JSON.stringify(old_values) : null,
       new_values ? JSON.stringify(new_values) : null,
       table_name, record_id]
    );
    console.log(`📝 Audit: ${actor_email} - ${action} - ${target} (IP: ${ip_address || 'N/A'})`);
  } catch (error) {
    console.error('❌ Error al registrar auditoría:', error.message);
  }
}

module.exports = { logAudit };

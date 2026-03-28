import pg from 'pg';
const { Pool } = pg;

// If no DATABASE_URL, pool is null and the app runs in-memory only (local dev)
export const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : null;

export async function initSchema() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id VARCHAR(6) PRIMARY KEY,
      movies JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

import { Pool } from 'pg';

let pool;

if (!pool) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
}

export const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS predictions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        prediction TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS match_status (
        id SERIAL PRIMARY KEY,
        status TEXT NOT NULL,
        result TEXT
      );
      INSERT INTO match_status (id, status, result) 
      VALUES (1, 'pending', NULL) 
      ON CONFLICT (id) DO NOTHING;
    `);
  } finally {
    client.release();
  }
};

export default pool;

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
        prediction TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE predictions ADD COLUMN IF NOT EXISTS prediction_outcome TEXT;
      ALTER TABLE predictions ADD COLUMN IF NOT EXISTS exact_score TEXT;

      CREATE TABLE IF NOT EXISTS match_status (
        id SERIAL PRIMARY KEY,
        status TEXT NOT NULL,
        result TEXT
      );
      ALTER TABLE match_status ADD COLUMN IF NOT EXISTS period TEXT;
      ALTER TABLE match_status ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP;
      ALTER TABLE match_status ADD COLUMN IF NOT EXISTS timer_status TEXT DEFAULT 'stopped';
      ALTER TABLE match_status ADD COLUMN IF NOT EXISTS timer_start TIMESTAMP;
      ALTER TABLE match_status ADD COLUMN IF NOT EXISTS base_minutes INTEGER DEFAULT 0;
      
      INSERT INTO match_status (id, status, result, period, last_updated, timer_status, base_minutes) 
      VALUES (1, 'pending', NULL, NULL, NULL, 'stopped', 0) 
      ON CONFLICT (id) DO NOTHING;

      CREATE TABLE IF NOT EXISTS match_config (
        id SERIAL PRIMARY KEY,
        team_a_name TEXT NOT NULL,
        team_a_flag TEXT NOT NULL,
        team_b_name TEXT NOT NULL,
        team_b_flag TEXT NOT NULL,
        match_date TIMESTAMP NOT NULL,
        description TEXT,
        fixture_id TEXT
      );

      ALTER TABLE match_config ADD COLUMN IF NOT EXISTS fixture_id TEXT;

      INSERT INTO match_config (id, team_a_name, team_a_flag, team_b_name, team_b_flag, match_date, description, fixture_id)
      VALUES (1, 'Ecuador', 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Flag_of_Ecuador.svg', 'Marruecos', 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Flag_of_Morocco.svg', '2026-03-27T15:15:00-05:00', '⚽ Amistoso Internacional', '')
      ON CONFLICT (id) DO NOTHING;

      CREATE TABLE IF NOT EXISTS past_winners (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        exact_score TEXT NOT NULL,
        match_desc TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } finally {
    client.release();
  }
};

export default pool;

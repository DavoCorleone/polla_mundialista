import { NextResponse } from 'next/server';
import pool, { initDb } from '@/lib/db';

export async function GET() {
  try {
    await initDb();
    const result = await pool.query('SELECT status, result, period FROM match_status WHERE id = 1');
    const configResult = await pool.query('SELECT * FROM match_config WHERE id = 1');
    return NextResponse.json({ ...result.rows[0], matchConfig: configResult.rows[0] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

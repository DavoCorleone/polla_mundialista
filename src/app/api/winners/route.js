import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const statusQuery = await pool.query('SELECT status, result FROM match_status WHERE id = 1');
    const { status, result } = statusQuery.rows[0];
    
    if (status !== 'finished') {
      return NextResponse.json({ error: 'Match not finished' }, { status: 400 });
    }

    const winners = await pool.query(
      'SELECT name FROM predictions WHERE prediction = $1 ORDER BY created_at ASC',
      [result]
    );
    return NextResponse.json(winners.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req) {
  try {
    const { name, prediction } = await req.json();
    if (!name || !prediction) return NextResponse.json({ error: 'Missing name or prediction' }, { status: 400 });

    const statusQuery = await pool.query('SELECT status FROM match_status WHERE id = 1');
    if (statusQuery.rows[0].status === 'finished') {
      return NextResponse.json({ error: 'Match already finished' }, { status: 400 });
    }

    const result = await pool.query(
      'INSERT INTO predictions (name, prediction) VALUES ($1, $2) RETURNING *',
      [name, prediction]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

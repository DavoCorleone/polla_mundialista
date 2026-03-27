import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req) {
  try {
    const { result } = await req.json();
    if (!result) return NextResponse.json({ error: 'Missing results' }, { status: 400 });

    await pool.query('UPDATE match_status SET status = $1, result = $2 WHERE id = 1', ['finished', result]);
    return NextResponse.json({ message: 'Resultado actualizado' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

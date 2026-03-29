import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const participants = await pool.query(
      'SELECT name, prediction_outcome, created_at FROM predictions ORDER BY created_at DESC'
    );
    return NextResponse.json(participants.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req) {
  try {
    const { clearPredictions, adminPassword } = await req.json();
    
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await pool.query("UPDATE match_status SET status = 'pending', result = NULL WHERE id = 1");
    if (clearPredictions) {
      await pool.query('DELETE FROM predictions');
    }
    return NextResponse.json({ message: 'Polla reiniciada con éxito' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

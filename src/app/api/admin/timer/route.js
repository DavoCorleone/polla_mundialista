import { NextResponse } from 'next/server';
import pool, { initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await initDb();
    const payload = await req.json();
    const adminPassword = payload.adminPassword;
    
    if (!adminPassword || adminPassword.trim() !== process.env.ADMIN_PASSWORD?.trim()) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { action, baseMinutes } = payload;

    if (action === 'start') {
      await pool.query(
        "UPDATE match_status SET timer_status = 'running', base_minutes = $1, timer_start = NOW() WHERE id = 1",
        [baseMinutes || 0]
      );
    } else if (action === 'stop') {
      await pool.query(
        "UPDATE match_status SET timer_status = 'stopped', base_minutes = $1 WHERE id = 1",
        [baseMinutes || 0]
      );
    } else {
      return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
    }
    
    return NextResponse.json({ message: 'Temporizador actualizado' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

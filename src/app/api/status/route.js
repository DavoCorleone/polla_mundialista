import { NextResponse } from 'next/server';
import pool, { initDb } from '@/lib/db';

export async function GET() {
  try {
    await initDb();
    const result = await pool.query('SELECT status, result, period, timer_status, timer_start, base_minutes FROM match_status WHERE id = 1');
    const configResult = await pool.query('SELECT * FROM match_config WHERE id = 1');
    
    const currentStatus = result.rows[0];
    const config = configResult.rows[0];

    // Calcular minutos exactos desde el servidor para evitar que se desincronice
    let calculatedElapsed = currentStatus.base_minutes || 0;
    if (currentStatus.timer_status === 'running' && currentStatus.timer_start) {
      const startMs = new Date(currentStatus.timer_start).getTime();
      const nowMs = Date.now();
      const diffMinutes = Math.floor((nowMs - startMs) / 60000);
      calculatedElapsed += diffMinutes;
    }

    return NextResponse.json({ 
      ...currentStatus, 
      matchConfig: config,
      calculatedElapsed
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

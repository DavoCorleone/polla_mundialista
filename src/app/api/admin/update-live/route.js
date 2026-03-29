import { NextResponse } from 'next/server';
import pool, { initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await initDb();
    const { scoreEcuador, scoreMorocco, period, adminPassword } = await req.json();

    if (adminPassword?.trim() !== process.env.ADMIN_PASSWORD?.trim()) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (scoreEcuador === undefined || scoreMorocco === undefined) {
      return NextResponse.json({ error: 'Faltan resultados' }, { status: 400 });
    }

    const exactScore = `${scoreEcuador}-${scoreMorocco}`;
    const matchPeriod = period || '1er Tiempo';

    await pool.query('UPDATE match_status SET status = $1, result = $2, period = $3 WHERE id = 1', ['live', exactScore, matchPeriod]);
    return NextResponse.json({ message: 'Marcador en vivo actualizado' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const payload = await req.json();
    const adminPassword = payload.adminPassword;
    
    if (!adminPassword || adminPassword.trim() !== process.env.ADMIN_PASSWORD?.trim()) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { scoreEcuador, scoreMorocco } = payload;

    if (scoreEcuador === undefined || scoreMorocco === undefined) {
      return NextResponse.json({ error: 'Faltan resultados' }, { status: 400 });
    }

    const exactScore = `${scoreEcuador}-${scoreMorocco}`;

    await pool.query('UPDATE match_status SET status = $1, result = $2 WHERE id = 1', ['finished', exactScore]);
    return NextResponse.json({ message: 'Resultado actualizado' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

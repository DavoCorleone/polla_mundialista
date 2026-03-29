import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const adminPassword = authHeader ? authHeader.replace('Bearer ', '') : '';
    
    if (adminPassword?.trim() !== process.env.ADMIN_PASSWORD?.trim()) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { scoreEcuador, scoreMorocco } = await req.json();

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

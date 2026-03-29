import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req) {
  try {
    const { name, scoreEcuador, scoreMorocco } = await req.json();
    if (!name || scoreEcuador === undefined || scoreMorocco === undefined) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const sE = parseInt(scoreEcuador, 10);
    const sM = parseInt(scoreMorocco, 10);

    let outcome = 'Empate';
    if (sE > sM) outcome = 'Ecuador';
    if (sE < sM) outcome = 'Marruecos';

    const exactScore = `${sE}-${sM}`;

    // Validar hora de inicio
    const configQuery = await pool.query('SELECT match_date FROM match_config WHERE id = 1');
    const matchStartTime = new Date(configQuery.rows[0].match_date);
    if (new Date() >= matchStartTime) {
      return NextResponse.json({ error: 'El partido ya ha comenzado. No se aceptan más pronósticos.' }, { status: 400 });
    }

    const statusQuery = await pool.query('SELECT status FROM match_status WHERE id = 1');
    if (statusQuery.rows[0].status === 'finished') {
      return NextResponse.json({ error: 'El partido ha finalizado.' }, { status: 400 });
    }

    const result = await pool.query(
      'INSERT INTO predictions (name, prediction_outcome, exact_score) VALUES ($1, $2, $3) RETURNING *',
      [name, outcome, exactScore]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

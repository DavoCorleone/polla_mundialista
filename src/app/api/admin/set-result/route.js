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

    const { scoreEcuador, scoreMorocco } = payload;

    if (scoreEcuador === undefined || scoreMorocco === undefined) {
      return NextResponse.json({ error: 'Faltan resultados' }, { status: 400 });
    }

    const sE = parseInt(scoreEcuador, 10);
    const sM = parseInt(scoreMorocco, 10);
    if (Number.isNaN(sE) || Number.isNaN(sM)) {
      return NextResponse.json({ error: 'Resultados no válidos' }, { status: 400 });
    }

    const exactScore = `${sE}-${sM}`;

    await pool.query('UPDATE match_status SET status = $1, result = $2 WHERE id = 1', ['finished', exactScore]);

    // Archivo de ganadores: se hace aquí para que match_desc corresponda al partido
    // del momento en que se confirma el resultado (no al momento de "reset").
    const configRes = await pool.query(
      'SELECT team_a_name, team_b_name FROM match_config WHERE id = 1'
    );
    const { team_a_name: teamAName, team_b_name: teamBName } = configRes.rows[0] || {};
    const matchDesc = teamAName && teamBName ? `${teamAName} vs ${teamBName}` : null;

    const winners = await pool.query(
      'SELECT name, exact_score FROM predictions WHERE exact_score = $1',
      [exactScore]
    );

    // Importante: no borremos el historial si no hay acertantes.
    // Así evitamos que un "match sin ganadores" elimine los ganadores anteriores
    // (o que un mismatch de exact_score deje la tabla vacía).
    if (matchDesc && winners.rows.length > 0) {
      await pool.query('TRUNCATE TABLE past_winners');
      for (const row of winners.rows) {
        await pool.query(
          'INSERT INTO past_winners (name, exact_score, match_desc) VALUES ($1, $2, $3)',
          [row.name, row.exact_score, matchDesc]
        );
      }
    }

    return NextResponse.json({
      message: 'Resultado actualizado',
      exactScore,
      winnersCount: winners.rows.length,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

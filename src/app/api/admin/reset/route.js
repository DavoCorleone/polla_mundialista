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

    const { clearPredictions } = payload;

    // Normalmente, el histórico se archiva en /api/admin/set-result cuando se confirma el marcador.
    // Si past_winners ya tiene datos, evitamos sobrescribir match_desc con una config que pudo cambiar.
    const pastWinnersCountRes = await pool.query('SELECT COUNT(*)::int AS cnt FROM past_winners');
    const pastWinnersCount = pastWinnersCountRes.rows[0]?.cnt || 0;

    if (pastWinnersCount === 0) {
      const statusRes = await pool.query('SELECT status, result FROM match_status WHERE id = 1');
      const configRes = await pool.query('SELECT team_a_name, team_b_name FROM match_config WHERE id = 1');
      const { result } = statusRes.rows[0] || {};

      if (result) {
        const { team_a_name: teamAName, team_b_name: teamBName } = configRes.rows[0] || {};
        const matchDesc = teamAName && teamBName ? `${teamAName} vs ${teamBName}` : null;

        if (matchDesc) {
          const winners = await pool.query(
            'SELECT name, exact_score FROM predictions WHERE exact_score = $1',
            [result]
          );

          await pool.query('TRUNCATE TABLE past_winners');
          for (const row of winners.rows) {
            await pool.query(
              'INSERT INTO past_winners (name, exact_score, match_desc) VALUES ($1, $2, $3)',
              [row.name, row.exact_score, matchDesc]
            );
          }
        }
      }
    }

    if (clearPredictions) {
      await pool.query('DELETE FROM predictions');
    }
    
    await pool.query("UPDATE match_status SET status = 'pending', result = NULL, period = NULL, last_updated = NOW() WHERE id = 1");
    
    return NextResponse.json({ message: 'Polla reiniciada con éxito' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

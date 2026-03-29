import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req) {
  try {
    const { clearPredictions, adminPassword } = await req.json();
    
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (clearPredictions) {
      // Guardar ganadores actuales antes de limpiar todo
      const statusRes = await pool.query('SELECT status, result FROM match_status WHERE id = 1');
      const configRes = await pool.query('SELECT team_a_name, team_b_name FROM match_config WHERE id = 1');
      const { status, result } = statusRes.rows[0] || {};
      
      if (status === 'finished' && result) {
        const { team_a_name, team_b_name } = configRes.rows[0] || {};
        const matchDesc = `${team_a_name} vs ${team_b_name}`;
        
        const winners = await pool.query('SELECT name, exact_score FROM predictions WHERE exact_score = $1', [result]);
        
        // Limpiar archivo anterior y agregar los nuevos
        await pool.query('TRUNCATE TABLE past_winners');
        
        for (const row of winners.rows) {
          await pool.query(
            'INSERT INTO past_winners (name, exact_score, match_desc) VALUES ($1, $2, $3)',
            [row.name, row.exact_score, matchDesc]
          );
        }
      }

      await pool.query('DELETE FROM predictions');
    }
    
    await pool.query("UPDATE match_status SET status = 'pending', result = NULL, period = NULL, last_updated = NOW() WHERE id = 1");
    
    return NextResponse.json({ message: 'Polla reiniciada con éxito' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

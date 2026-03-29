import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const statusQuery = await pool.query('SELECT status, result FROM match_status WHERE id = 1');
    const { status, result } = statusQuery.rows[0];
    
    if (status === 'pending') {
      return NextResponse.json({ error: 'Match not started' }, { status: 400 });
    }

    const allPredictions = await pool.query(
      'SELECT name, prediction_outcome, exact_score FROM predictions ORDER BY created_at ASC'
    );
    
    const winners = allPredictions.rows.filter(p => p.exact_score === result);
    // Hide exact scores of losers if the match is still live
    const losers = allPredictions.rows.filter(p => p.exact_score !== result).map(p => ({
      name: p.name,
      prediction_outcome: p.prediction_outcome,
      exact_score: status === 'finished' ? p.exact_score : null
    }));

    return NextResponse.json({ winners, losers, officialScore: result, status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

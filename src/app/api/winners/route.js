import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const statusQuery = await pool.query('SELECT status, result FROM match_status WHERE id = 1');
    const { status, result: exactScore } = statusQuery.rows[0];

    const pastWinnersData = await pool.query('SELECT name, exact_score, match_desc FROM past_winners');
    const pastWinners = pastWinnersData.rows;

    const allPredictions = await pool.query(
      'SELECT name, prediction_outcome, exact_score FROM predictions ORDER BY created_at ASC'
    );
    
    let winners = [];
    let losers = [];

    if (exactScore) {
      winners = allPredictions.rows.filter(p => p.exact_score === exactScore);
      losers = allPredictions.rows.filter(p => p.exact_score !== exactScore).map(p => ({
        name: p.name,
        prediction_outcome: p.prediction_outcome,
        exact_score: status === 'finished' ? p.exact_score : null
      }));
    } else {
      losers = allPredictions.rows.map(p => ({
        name: p.name,
        prediction_outcome: p.prediction_outcome,
        exact_score: null
      }));
    }

    return NextResponse.json({ 
      winners, 
      pastWinners,
      losers, 
      officialScore: exactScore, 
      status 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

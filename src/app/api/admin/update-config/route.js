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

    const payload = await req.json();
    const { 
      teamAName, teamAFlag, 
      teamBName, teamBFlag, 
      matchDate, description, 
      fixtureId 
    } = payload;

    if (!teamAName || !teamBName || !matchDate) {
      return NextResponse.json({ error: 'Faltan datos de configuración' }, { status: 400 });
    }

    await pool.query(
      `UPDATE match_config SET 
        team_a_name = $1, team_a_flag = $2, 
        team_b_name = $3, team_b_flag = $4, 
        match_date = $5, description = $6,
        fixture_id = $7
       WHERE id = 1`, 
      [teamAName, teamAFlag, teamBName, teamBFlag, matchDate, description, fixtureId || '']
    );

    return NextResponse.json({ message: 'Configuración de partido guardada exitosamente' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

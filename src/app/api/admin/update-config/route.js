import { NextResponse } from 'next/server';
import pool, { initDb } from '@/lib/db';
import { isValidFlagImageUrl, FLAG_URL_REQUIREMENTS } from '@/lib/flag-url';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await initDb();
    const payload = await req.json();
    const adminPassword = payload.adminPassword;

    if (!adminPassword || adminPassword.trim() !== process.env.ADMIN_PASSWORD?.trim()) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { 
      teamAName, teamAFlag, 
      teamBName, teamBFlag, 
      matchDate, description, 
      fixtureId 
    } = payload;

    if (!teamAName || !teamBName || !matchDate) {
      return NextResponse.json({ error: 'Faltan datos de configuración' }, { status: 400 });
    }

    if (!isValidFlagImageUrl(teamAFlag) || !isValidFlagImageUrl(teamBFlag)) {
      return NextResponse.json(
        { error: `URL de bandera no válida. ${FLAG_URL_REQUIREMENTS}` },
        { status: 400 }
      );
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

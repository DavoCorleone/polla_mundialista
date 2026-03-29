export async function fetchLiveMatchData(fixtureId) {
  if (!process.env.API_FOOTBALL_KEY || !fixtureId) return null;

  try {
    const res = await fetch(`https://v3.football.api-sports.io/fixtures?id=${fixtureId}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': process.env.API_FOOTBALL_KEY
      }
    });
    
    const data = await res.json();
    if (!data.response || data.response.length === 0) return null;
    
    const fixture = data.response[0];
    const statusShort = fixture.fixture.status.short; 
    const elapsed = fixture.fixture.status.elapsed;
    const goalsHome = fixture.goals.home;
    const goalsAway = fixture.goals.away;
    
    let ourStatus = 'live';
    if (statusShort === 'FT' || statusShort === 'PEN' || statusShort === 'AET') {
      ourStatus = 'finished';
    } else if (statusShort === 'NS') {
      ourStatus = 'pending';
    }

    let exactScore = null;
    if (goalsHome !== null && goalsAway !== null) {
      exactScore = `${goalsHome}-${goalsAway}`;
    }

    let period = `${elapsed}'`;
    if (statusShort === 'HT') period = 'Medio Tiempo';
    if (statusShort === 'FT') period = 'Finalizado';

    return {
      status: ourStatus,
      result: exactScore,
      period: period
    };
  } catch(e) {
    console.error('API Football Error:', e);
    return null;
  }
}

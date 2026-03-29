"use client";

import { useState, useEffect } from 'react';

const API_URL = '/api';

export default function Home() {
  const [name, setName] = useState('');
  const [scoreEcuador, setScoreEcuador] = useState('');
  const [scoreMorocco, setScoreMorocco] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [matchStatus, setMatchStatus] = useState('pending');
  const [matchElapsed, setMatchElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [winners, setWinners] = useState([]);
  const [pastWinners, setPastWinners] = useState([]);
  const [losers, setLosers] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [matchPeriod, setMatchPeriod] = useState('');
  const [matchConfig, setMatchConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMatchLive, setIsMatchLive] = useState(false);

  const getTrends = () => {
    if (participants.length === 0 || !matchConfig) return null;
    let teamA = 0;
    let teamB = 0;
    let draw = 0;
    participants.forEach(p => {
      // Assuming prediction_outcome matches team names or 'Empate'
      if (p.prediction_outcome === matchConfig.team_a_name || p.prediction_outcome === 'Ecuador') teamA++; // Backup logic for old data
      else if (p.prediction_outcome === matchConfig.team_b_name || p.prediction_outcome === 'Marruecos') teamB++;
      else draw++;
    });
    const total = participants.length;
    return {
      teamA: Math.round((teamA/total)*100),
      teamB: Math.round((teamB/total)*100),
      draw: Math.round((draw/total)*100),
      total
    };
  };

  const trends = matchConfig ? getTrends() : null;

  const filteredParticipants = participants.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleShare = async () => {
    if (!matchConfig) return;
    const text = `¡Únete a la Polla Mundialista: ${matchConfig.team_a_name} vs ${matchConfig.team_b_name}! ⚽🏆\n\nDemuestra tu conocimiento y pronostica el marcador exacto.\n\nParticipa aquí: ${window.location.origin}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Polla Mundialista',
          text: text,
          url: window.location.origin,
        });
      } catch (err) {
        console.log('Compartir cancelado o con error', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      setMessage({ text: '¡Texto copiado para compartir!', type: 'success' });
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchParticipants();

    const timer = setInterval(() => {
      if (!matchConfig) return;
      const matchStartTime = new Date(matchConfig.match_date);
      const now = new Date();
      const difference = matchStartTime - now;

      if (difference <= 0) {
        setIsMatchLive(true);
        clearInterval(timer);
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);

    const pollTimer = setInterval(() => {
      fetchStatus();
    }, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(pollTimer);
    };
  }, []);

  const fetchParticipants = async () => {
    try {
      const res = await fetch(`${API_URL}/participants`);
      const data = await res.json();
      setParticipants(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/status`);
      const data = await res.json();
      setMatchStatus(data.status);
      setMatchResult(data.result);
      setMatchPeriod(data.period);
      setMatchElapsed(data.calculatedElapsed || 0);
      setTimerRunning(data.timer_status === 'running');
      if (data.matchConfig) {
        setMatchConfig(data.matchConfig);
      }
      if (data.status === 'finished' || data.status === 'live') {
        fetchWinners();
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const fetchWinners = async () => {
    try {
      const res = await fetch(`${API_URL}/winners`);
      const data = await res.json();
      setWinners(data.winners || []);
      setPastWinners(data.pastWinners || []);
      setLosers(data.losers || []);
    } catch (error) {
      console.error('Error fetching winners:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ text: 'Por favor, ingresa tu nombre.', type: 'error' });
      return;
    }
    if (scoreEcuador === '' || scoreMorocco === '') {
      setMessage({ text: 'Por favor, ingresa ambos goles para tu pronóstico.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, scoreEcuador, scoreMorocco }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar el pronóstico');
      }

      setMessage({ text: '¡Pronóstico guardado con éxito! Buena suerte.', type: 'success' });
      setName('');
      setScoreEcuador('');
      setScoreMorocco('');
      fetchParticipants();
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (matchStatus === 'finished' || matchStatus === 'live') {
    return (
      <div className="card">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}} />
        {matchStatus === 'live' ? (
           <div style={{ display: 'inline-block', background: 'var(--primary-red)', color: 'white', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '1rem', animation: 'pulse 2s infinite' }}>
             🔴 {timerRunning ? matchElapsed + '+' : matchElapsed}&apos; EN VIVO {matchPeriod ? `- ${matchPeriod.toUpperCase()}` : ''}
           </div>
        ) : (
           <div className="trophy-icon">🏆</div>
        )}
        
        <h2>{matchStatus === 'live' ? 'Marcador Actual' : '¡El partido ha finalizado!'}</h2>
        <p style={{ marginTop: '1rem', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
          {matchStatus === 'live' ? 'Resultado al momento:' : 'Resultado Oficial:'} <strong style={{ color: 'var(--primary-red)', fontSize: '2rem', display: 'block', marginTop: '10px' }}>{matchResult ? matchResult.replace('-', ' - ') : '0 - 0'}</strong>
        </p>
        
        <div style={{ marginTop: '3rem' }}>
          <h3 style={{ marginBottom: '1.5rem', background: 'linear-gradient(90deg, #fde047, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.8rem' }}>🌟 Ganadores Inmortales 🌟</h3>
          {winners.length > 0 ? (
            <div className="winners-list">
              {winners.map((winner, idx) => (
                <div key={idx} className="winner-item winner-vip">
                  <span style={{ fontSize: '1.5rem' }}>👑</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: '800' }}>{winner.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
              <p style={{ fontSize: '1.3rem', color: 'var(--text-secondary)' }}>
                {matchStatus === 'live' ? 'Nadie está acertando este marcador exacto por ahora. Haz magia.' : 'No hubo acertantes en esta ocasión. Corona vacante. 😢'}
              </p>
            </div>
          )}
        </div>

        {losers.length > 0 && (
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--card-border)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>😅 ¡Suerte para la próxima!</h3>
            <div className="winners-list" style={{ opacity: 0.85 }}>
              {losers.map((loser, idx) => (
                <div key={idx} className="winner-item" style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'transparent', flexDirection: 'column', gap: '4px', padding: '1rem 0.5rem' }}>
                  <span style={{ fontWeight: '600' }}>{loser.name}</span>
                  <span style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: 'normal' }}>
                    {loser.exact_score && loser.exact_score !== 'N/A' ? 
                      `Apostó: Ecuador ${loser.exact_score.split('-')[0]} - ${loser.exact_score.split('-')[1]} Marruecos`
                      : `Apostó: Gana ${loser.prediction_outcome === 'Empate' ? 'Empate' : loser.prediction_outcome}`
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <h1 style={{ marginBottom: '0.5rem' }}>{matchConfig ? `${matchConfig.team_a_name} vs ${matchConfig.team_b_name}` : 'Cargando...'}</h1>
      <p style={{ marginBottom: '2.5rem', color: 'var(--text-secondary)' }}>
        {matchConfig ? matchConfig.description : ''}<br/>
        Demuestra tu conocimiento. Ingresa tu nombre y selecciona el ganador.
      </p>

      {!isMatchLive && matchStatus !== 'finished' && (
        <div className="countdown-container" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '2.5rem' }}>
          <div className="time-box" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', textAlign: 'center', width: '70px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-red)' }}>{timeLeft.days}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>DÍAS</div>
          </div>
          <div className="time-box" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', textAlign: 'center', width: '70px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{timeLeft.hours}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>HRS</div>
          </div>
          <div className="time-box" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', textAlign: 'center', width: '70px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{timeLeft.minutes}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MIN</div>
          </div>
          <div className="time-box" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', textAlign: 'center', width: '70px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--secondary-blue)' }}>{timeLeft.seconds}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SEG</div>
          </div>
        </div>
      )}

      {trends && !isMatchLive && matchStatus !== 'finished' && (
        <div style={{ marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)', textAlign: 'center', fontWeight: '600' }}>
            Tendencias de Pronósticos ({trends.total} participantes)
          </h3>
          <div style={{ display: 'flex', height: '14px', borderRadius: '7px', overflow: 'hidden', marginBottom: '0.8rem', opacity: 0.9 }}>
            <div style={{ width: `${trends.teamA}%`, background: 'var(--primary-red)', transition: 'width 1s ease-out' }} title={`${matchConfig.team_a_name}: ${trends.teamA}%`}></div>
            <div style={{ width: `${trends.draw}%`, background: '#64748b', transition: 'width 1s ease-out' }} title={`Empate: ${trends.draw}%`}></div>
            <div style={{ width: `${trends.teamB}%`, background: 'var(--secondary-blue)', transition: 'width 1s ease-out' }} title={`${matchConfig.team_b_name}: ${trends.teamB}%`}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold' }}>
            <span style={{ color: '#fca5a5' }}>{matchConfig.team_a_name} {trends.teamA}%</span>
            <span style={{ color: '#cbd5e1' }}>Empate {trends.draw}%</span>
            <span style={{ color: '#93c5fd' }}>{matchConfig.team_b_name} {trends.teamB}%</span>
          </div>
        </div>
      )}

      {isMatchLive && matchStatus !== 'finished' && (
        <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(243, 1, 7, 0.1)', border: '1px solid var(--primary-red)', borderRadius: '12px', marginBottom: '2.5rem' }}>
          <strong style={{ color: 'var(--primary-red)', fontSize: '1.2rem', display: 'block', marginBottom: '0.5rem' }}>🔴 EL PARTIDO ESTÁ EN JUEGO</strong>
          <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Los pronósticos se han cerrado. ¡Disfruta el partido!</span>
        </div>
      )}

      {!isMatchLive && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">TU NOMBRE Y APELLIDO</label>
          <input
            type="text"
            id="name"
            className="form-input"
            placeholder="Ej. Juan Pérez"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-label" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>¿CUÁL SERÁ EL MARCADOR EXACTO?</div>
        <div className="options-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '2.5rem' }}>
          <div className="option-card" style={{ padding: '2rem 1rem', cursor: 'default' }}>
            {matchConfig && <img src={matchConfig.team_a_flag} alt={matchConfig.team_a_name} className="option-logo" />}
            <div className="option-text" style={{ marginBottom: '1rem' }}>{matchConfig ? matchConfig.team_a_name : 'Equipo 1'}</div>
            <input type="number" className="form-input" min="0" placeholder="0" value={scoreEcuador} onChange={(e) => setScoreEcuador(e.target.value)} style={{ textAlign: 'center', fontSize: '2rem', padding: '1rem', fontWeight: 'bold' }} />
          </div>
          
          <div className="option-card" style={{ padding: '2rem 1rem', cursor: 'default' }}>
            {matchConfig && <img src={matchConfig.team_b_flag} alt={matchConfig.team_b_name} className="option-logo" />}
            <div className="option-text" style={{ marginBottom: '1rem' }}>{matchConfig ? matchConfig.team_b_name : 'Equipo 2'}</div>
            <input type="number" className="form-input" min="0" placeholder="0" value={scoreMorocco} onChange={(e) => setScoreMorocco(e.target.value)} style={{ textAlign: 'center', fontSize: '2rem', padding: '1rem', fontWeight: 'bold' }} />
          </div>
        </div>

        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? 'Procesando...' : '🎯 Enviar Pronóstico'}
        </button>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.type === 'success' ? '🎉' : '⚠️'} {message.text}
          </div>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={handleShare} style={{ padding: '0.8rem', fontSize: '1rem', background: 'rgba(255,255,255,0.1)', boxShadow: 'none' }}>
            📤 Compartir con Amigos
          </button>
        </div>
      </form>
      )}

      {pastWinners.length > 0 && (
        <div className="winners-list" style={{ marginTop: '2.5rem', marginBottom: '1rem' }}>
          <h2 style={{ background: 'linear-gradient(90deg, #fde047, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', borderBottom: '1px solid rgba(250, 204, 21, 0.2)', paddingBottom: '0.8rem', marginBottom: '2rem', textAlign: 'center', fontSize: '1.8rem', fontWeight: '800' }}>
            🎖️ Campeones de la última Polla ({pastWinners[0].match_desc})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {pastWinners.map((w, idx) => (
              <div key={idx} className="winner-item winner-vip">
                <span style={{ fontSize: '1.5rem' }}>🏆</span>
                <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{w.name}</span>
                <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginLeft: 'auto' }}>{w.exact_score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isMatchLive && pastWinners.length > 0 && (
        <div className="cta-banner">
          <h3 style={{ fontSize: '1.3rem', color: 'white', marginBottom: '0.5rem' }}>¡El próximo campeón puedes ser TÚ! 👑</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Demuestra cuánto sabes de fútbol y deja tu pronóstico aquí abajo. 👇</p>
        </div>
      )}

      {participants.length > 0 && (
        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0, textAlign: 'center', flex: '1 1 100%' }}>👥 Participantes Actuales</h3>
            <div style={{ flex: '1 1 100%', display: 'flex', justifyContent: 'center' }}>
              <input 
                type="text" 
                placeholder="🔍 Buscar participante..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '0.8rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.2)',
                  color: 'white',
                  width: '100%',
                  maxWidth: '300px'
                }}
              />
            </div>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Los marcadores exactos se mantienen en secreto hasta el final del partido.
          </p>
          {filteredParticipants.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No se encontraron participantes con ese nombre.</p>
          ) : (
            <div className="winners-list" style={{ opacity: 0.9 }}>
              {filteredParticipants.map((p, idx) => (
              <div key={idx} className="winner-item" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', flexDirection: 'column', gap: '6px', padding: '1rem' }}>
                <span style={{ fontWeight: 'bold' }}>{p.name}</span>
                <span style={{ fontSize: '0.9rem', color: p.prediction_outcome === 'Ecuador' ? '#fde047' : p.prediction_outcome === 'Empate' ? '#94a3b8' : '#f87171' }}>
                  Pronosticó: {p.prediction_outcome === 'Empate' ? 'Empate' : `Gana ${p.prediction_outcome}`}
                </span>
              </div>
            ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

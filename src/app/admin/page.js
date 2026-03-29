"use client";

import { useState, useEffect } from 'react';

const API_URL = '/api';

export default function AdminPage() {
  const [scoreEcuador, setScoreEcuador] = useState('');
  const [scoreMorocco, setScoreMorocco] = useState('');
  const [period, setPeriod] = useState('1er Tiempo');
  const [password, setPassword] = useState('');
  const [configPassword, setConfigPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [matchConfig, setMatchConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [configForm, setConfigForm] = useState({
    teamAName: '', teamAFlag: '', teamBName: '', teamBFlag: '', matchDate: '', description: ''
  });
  const [timerStatus, setTimerStatus] = useState('stopped');
  const [timerElapsed, setTimerElapsed] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/status`)
      .then(res => res.json())
      .then(data => {
        if (data.matchConfig) {
          setMatchConfig(data.matchConfig);
          try {
            const d = new Date(data.matchConfig.match_date);
            const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            setConfigForm({
              teamAName: data.matchConfig.team_a_name || '',
              teamAFlag: data.matchConfig.team_a_flag || '',
              teamBName: data.matchConfig.team_b_name || '',
              teamBFlag: data.matchConfig.team_b_flag || '',
              matchDate: localIso,
              matchDate: localIso,
              description: data.matchConfig.description || ''
            });
          } catch(e) {}
        }
        if (data.timer_status) setTimerStatus(data.timer_status);
        if (data.calculatedElapsed !== undefined) setTimerElapsed(data.calculatedElapsed);
      })
      .catch(console.error);
  }, []);

  const checkPassword = () => {
    if (!password) {
      setMessage({ text: 'Por favor, ingresa la clave de administración.', type: 'error' });
      return false;
    }
    return true;
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!checkPassword()) return;
    if (!confirm('¿Seguro quieres reiniciar la polla? Se reabrirán los pronósticos.')) return;
    
    const clearPredictions = confirm('¿Deseas ELIMINAR todos los participantes actuales? (Presiona Cancelar para conservarlos)');
    
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch(`${API_URL}/admin/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearPredictions, adminPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al reiniciar');
      setMessage({ text: data.message, type: 'success' });
      setResult('');
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLive = async (e) => {
    e.preventDefault();
    if (!checkPassword()) return;
    if (scoreEcuador === '' || scoreMorocco === '') {
      setMessage({ text: 'Por favor, ingresa los goles para actualizar en vivo.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch(`${API_URL}/admin/update-live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scoreEcuador, scoreMorocco, period, adminPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ text: 'Marcador en vivo actualizado 🔴', type: 'success' });
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimerAction = async (action, minutes) => {
    if (!checkPassword()) return;
    setIsLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await fetch(`${API_URL}/admin/timer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, baseMinutes: minutes, adminPassword: password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ text: `Reloj ${action === 'start' ? 'iniciado' : 'detenido'} ⏱️`, type: 'success' });
      setTimerStatus(action === 'start' ? 'running' : 'stopped');
      setTimerElapsed(minutes);
    } catch (e) {
      setMessage({ text: e.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetResult = async (e) => {
    e.preventDefault();
    if (!checkPassword()) return;
    if (scoreEcuador === '' || scoreMorocco === '') {
      setMessage({ text: 'Por favor, ingresa los goles para ambos equipos.', type: 'error' });
      return;
    }

    if (!confirm('¿Estás seguro de finalizar el partido con este resultado? Esta acción no se puede deshacer y bloqueará nuevos pronósticos.')) {
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch(`${API_URL}/admin/set-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scoreEcuador, scoreMorocco, adminPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar el resultado');
      }

      setMessage({ text: 'Partido finalizado correctamente.', type: 'success' });
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (!configPassword) {
      setMessage({ text: '⚠️ Ingresa la clave en el panel de configuración para guardar.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch(`${API_URL}/admin/update-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...configForm, adminPassword: configPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ text: 'Configuración general guardada exitosamente ✅', type: 'success' });
      setMatchConfig({
        ...matchConfig,
        team_a_name: configForm.teamAName,
        team_a_flag: configForm.teamAFlag,
        team_b_name: configForm.teamBName,
        team_b_flag: configForm.teamBFlag,
        match_date: configForm.matchDate,
        description: configForm.description
      });
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-red)' }}>Administración del Partido</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
        Inicia el reloj del partido, actualiza el marcador en vivo y, cuando termine, selecciona el resultado oficial para cerrar las predicciones y generar a los ganadores.
      </p>

      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center' }}>
        <h3 style={{ color: '#fcd34d', marginBottom: '1rem', fontSize: '1.2rem' }}>⏱️ Reloj del Partido: <span style={{ color: 'white', fontWeight: 'bold' }}>{timerStatus === 'running' ? timerElapsed + '+' : timerElapsed}&apos;</span></h3>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button type="button" onClick={() => handleTimerAction('start', 0)} className="btn" style={{ background: '#10b981', padding: '0.8rem', flex: '1 1 auto', border: 'none' }} disabled={isLoading || timerStatus === 'running'}>▶ Iniciar 1er Tpo (0&apos;)</button>
          <button type="button" onClick={() => handleTimerAction('stop', timerElapsed)} className="btn" style={{ background: '#f59e0b', padding: '0.8rem', flex: '1 1 auto', border: 'none' }} disabled={isLoading || timerStatus === 'stopped'}>⏸ Pausar Reloj</button>
          <button type="button" onClick={() => handleTimerAction('start', 45)} className="btn" style={{ background: '#3b82f6', padding: '0.8rem', flex: '1 1 auto', border: 'none' }} disabled={isLoading || timerStatus === 'running'}>▶ Iniciar 2do Tpo (45&apos;)</button>
        </div>
      </div>

      <form onSubmit={handleSetResult}>
        <div className="options-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '2rem' }}>
          <div className="option-card" style={{ padding: '1.5rem', cursor: 'default' }}>
            {matchConfig && <img src={matchConfig.team_a_flag} alt={matchConfig.team_a_name} className="option-logo" style={{ width: '60px', height: '60px' }} />}
            <div className="option-text" style={{ marginBottom: '1rem', fontSize: '1rem' }}>{matchConfig ? matchConfig.team_a_name : 'Equipo 1'}</div>
            <input type="number" className="form-input" min="0" placeholder="0" value={scoreEcuador} onChange={(e) => setScoreEcuador(e.target.value)} style={{ textAlign: 'center', fontSize: '2rem', padding: '0.5rem', fontWeight: 'bold' }} />
          </div>
          <div className="option-card" style={{ padding: '1.5rem', cursor: 'default' }}>
            {matchConfig && <img src={matchConfig.team_b_flag} alt={matchConfig.team_b_name} className="option-logo" style={{ width: '60px', height: '60px' }} />}
            <div className="option-text" style={{ marginBottom: '1rem', fontSize: '1rem' }}>{matchConfig ? matchConfig.team_b_name : 'Equipo 2'}</div>
            <input type="number" className="form-input" min="0" placeholder="0" value={scoreMorocco} onChange={(e) => setScoreMorocco(e.target.value)} style={{ textAlign: 'center', fontSize: '2rem', padding: '0.5rem', fontWeight: 'bold' }} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="period" className="form-label">Minuto / Periodo (Solo para En Vivo)</label>
          <input 
            type="text"
            id="period"
            className="form-input"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="Ej. 1er Tiempo, Min. 25..."
            maxLength="30"
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="password" className="form-label">Clave de Administración</label>
          <input 
            type="password"
            id="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Introduce la clave"
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="button" onClick={handleUpdateLive} className="btn" style={{ background: 'var(--primary-red)', flex: 1 }} disabled={isLoading}>
            {isLoading ? '...' : '🔴 Actualizar en Vivo'}
          </button>
          <button type="submit" className="btn btn-secondary" style={{ flex: 1 }} disabled={isLoading}>
            {isLoading ? '...' : '🏁 Finalizar Partido'}
          </button>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.type === 'success' ? '✅' : '❌'} {message.text}
          </div>
        )}
      </form>

      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--card-border)', textAlign: 'left' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary-blue)' }}>⚙️ Configuración del Partido</h3>
        <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Equipo 1 (Nombre)</label>
              <input type="text" className="form-input" style={{ padding: '0.8rem' }} value={configForm.teamAName} onChange={e => setConfigForm({...configForm, teamAName: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Bandera (URL)</label>
              <input type="text" className="form-input" style={{ padding: '0.8rem' }} value={configForm.teamAFlag} onChange={e => setConfigForm({...configForm, teamAFlag: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Equipo 2 (Nombre)</label>
              <input type="text" className="form-input" style={{ padding: '0.8rem' }} value={configForm.teamBName} onChange={e => setConfigForm({...configForm, teamBName: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Bandera (URL)</label>
              <input type="text" className="form-input" style={{ padding: '0.8rem' }} value={configForm.teamBFlag} onChange={e => setConfigForm({...configForm, teamBFlag: e.target.value})} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Fecha del Partido</label>
            <input type="datetime-local" className="form-input" style={{ padding: '0.8rem' }} value={configForm.matchDate} onChange={e => setConfigForm({...configForm, matchDate: e.target.value})} />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Descripción / Torneo</label>
            <input type="text" className="form-input" style={{ padding: '0.8rem' }} value={configForm.description} onChange={e => setConfigForm({...configForm, description: e.target.value})} />
          </div>

          <div className="form-group" style={{ marginBottom: 0, marginTop: '1rem' }}>
            <label className="form-label" style={{ color: '#f87171' }}>Clave de Administración (Requerida)</label>
            <input type="password" className="form-input" style={{ padding: '0.8rem', borderColor: 'rgba(248,113,113,0.5)' }} placeholder="Tu clave segura" value={configPassword} onChange={e => setConfigPassword(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-secondary" style={{ marginTop: '1rem' }} disabled={isLoading}>
            {isLoading ? '...' : '💾 Guardar Equipos y Fecha'}
          </button>
        </form>
      </div>

      <div className="reset-section">
        <h3 style={{ marginBottom: '1rem', color: '#f87171' }}>Zona de Peligro</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Utiliza esta opción si necesitas reabrir la polla porque el partido aún no termina o te equivocaste de resultado.
        </p>
        <button onClick={handleReset} className="btn" style={{ background: 'linear-gradient(135deg, #7f1d1d, #991b1b)' }} disabled={isLoading}>
          🔄 Reiniciar Polla
        </button>
      </div>

      <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--card-border)' }}>
        <a href="/" style={{ color: 'var(--secondary-blue)', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          &larr; Volver a la Polla Pública
        </a>
      </div>
    </div>
  );
}

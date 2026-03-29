"use client";

import { useState, useEffect } from 'react';

const API_URL = '/api';

export default function AdminPage() {
  const [scoreEcuador, setScoreEcuador] = useState('');
  const [scoreMorocco, setScoreMorocco] = useState('');
  const [period, setPeriod] = useState('1er Tiempo');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [matchConfig, setMatchConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);



  useEffect(() => {
    fetch(`${API_URL}/status`)
      .then(res => res.json())
      .then(data => {
        if (data.matchConfig) setMatchConfig(data.matchConfig);
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

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-red)' }}>Administración del Partido</h2>
      <p style={{ marginBottom: '2rem' }}>
        Selecciona el resultado final para cerrar las predicciones y mostrar los ganadores.
      </p>

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

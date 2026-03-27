"use client";

import { useState, useEffect } from 'react';

const API_URL = '/api';

export default function Home() {
  const [name, setName] = useState('');
  const [prediction, setPrediction] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [matchStatus, setMatchStatus] = useState('pending');
  const [winners, setWinners] = useState([]);
  const [matchResult, setMatchResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/status`);
      const data = await res.json();
      setMatchStatus(data.status);
      setMatchResult(data.result);
      if (data.status === 'finished') {
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
      setWinners(data);
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
    if (!prediction) {
      setMessage({ text: 'Por favor, selecciona un pronóstico.', type: 'error' });
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
        body: JSON.stringify({ name, prediction }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar el pronóstico');
      }

      setMessage({ text: '¡Pronóstico guardado con éxito! Buena suerte.', type: 'success' });
      setName('');
      setPrediction('');
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (matchStatus === 'finished') {
    return (
      <div className="card">
        <div className="trophy-icon">🏆</div>
        <h2>¡El partido ha finalizado!</h2>
        <p style={{ marginTop: '1rem', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
          Resultado Oficial: <strong style={{ color: 'var(--primary-red)', fontSize: '1.6rem', display: 'block', marginTop: '10px' }}>{matchResult}</strong>
        </p>
        
        <div style={{ marginTop: '3rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>🌟 Ganadores 🌟</h3>
          {winners.length > 0 ? (
            <div className="winners-list">
              {winners.map((winner, idx) => (
                <div key={idx} className="winner-item">
                  🏅 {winner.name}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>No hubo acertantes en esta ocasión. 😢</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h1 style={{ marginBottom: '0.5rem' }}>Ecuador vs Marruecos</h1>
      <p style={{ marginBottom: '2.5rem', color: 'var(--text-secondary)' }}>
        ⚽ Amistoso Internacional - 27 de Marzo 2026<br/>
        Demuestra tu conocimiento. Ingresa tu nombre y selecciona el ganador.
      </p>

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

        <div className="form-label" style={{ marginBottom: '1.5rem' }}>SELECCIONA TU PRONÓSTICO</div>
        <div className="options-grid">
          <div 
            className={`option-card ${prediction === 'Ecuador' ? 'selected' : ''}`}
            onClick={() => setPrediction('Ecuador')}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e8/Flag_of_Ecuador.svg" alt="Ecuador" className="option-logo" />
            <div className="option-text">Gana Ecuador</div>
          </div>
          
          <div 
            className={`option-card ${prediction === 'Empate' ? 'selected' : ''}`}
            onClick={() => setPrediction('Empate')}
          >
            <div className="option-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>
              VS
            </div>
            <div className="option-text">Empate</div>
          </div>
          
          <div 
            className={`option-card ${prediction === 'Marruecos' ? 'selected' : ''}`}
            onClick={() => setPrediction('Marruecos')}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2c/Flag_of_Morocco.svg" alt="Marruecos" className="option-logo" />
            <div className="option-text">Gana Marruecos</div>
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
      </form>
    </div>
  );
}

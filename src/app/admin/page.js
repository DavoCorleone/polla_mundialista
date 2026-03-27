"use client";

import { useState } from 'react';

const API_URL = '/api';

export default function AdminPage() {
  const [result, setResult] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  const checkPassword = () => {
    if (password !== '032520543') {
      setMessage({ text: 'Clave de administración incorrecta.', type: 'error' });
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
        body: JSON.stringify({ clearPredictions }),
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

  const handleSetResult = async (e) => {
    e.preventDefault();
    if (!checkPassword()) return;
    if (!result) {
      setMessage({ text: 'Por favor, selecciona un resultado.', type: 'error' });
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
        body: JSON.stringify({ result }),
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
        <div className="form-group">
          <label htmlFor="result" className="form-label">Resultado Oficial</label>
          <select 
            id="result" 
            className="form-input"
            value={result}
            onChange={(e) => setResult(e.target.value)}
          >
            <option value="">-- Seleccionar Resultado --</option>
            <option value="Ecuador">Ganó Ecuador</option>
            <option value="Empate">Empate</option>
            <option value="Marruecos">Ganó Marruecos</option>
          </select>
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

        <button type="submit" className="btn btn-secondary" disabled={isLoading}>
          {isLoading ? 'Procesando...' : 'Finalizar Partido'}
        </button>

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

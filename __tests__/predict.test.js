import { describe, it, expect, vi } from 'vitest';
import { POST as PredictPOST } from '../src/app/api/predict/route';
import pool from '../src/lib/db';

vi.mock('../src/lib/db', () => ({
  default: {
    query: vi.fn(),
  },
}));

describe('Predict API Route', () => {
  it('debería fallar si faltan datos', async () => {
    const req = {
      json: async () => ({ name: 'Test' }), // Falta scoreEcuador y scoreMorocco
    };
    
    const response = await PredictPOST(req);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.error).toBe('Faltan datos');
  });

  it('debería guardar la predicción si los datos están correctos', async () => {
    // Mock the date query and the status query
    pool.query.mockImplementation(async (query) => {
      if (query.includes('match_date')) {
        return { rows: [{ match_date: '2099-01-01T00:00:00Z' }] }; // Future date
      }
      if (query.includes('match_status')) {
        return { rows: [{ status: 'pending' }] };
      }
      if (query.includes('INSERT')) {
        return { rows: [{ id: 1, name: 'Test', prediction_outcome: 'Ecuador', exact_score: '2-1' }] };
      }
      return { rows: [] };
    });

    const req = {
      json: async () => ({ name: 'Test User', scoreEcuador: 2, scoreMorocco: 1 }),
    };

    const response = await PredictPOST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.name).toBe('Test');
    expect(data.exact_score).toBe('2-1');
  });
});

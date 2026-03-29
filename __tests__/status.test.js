import { describe, it, expect, vi } from 'vitest';
import { GET as StatusGET } from '../src/app/api/status/route';
import pool from '../src/lib/db';

vi.mock('../src/lib/db', () => ({
  default: {
    query: vi.fn(),
  },
  initDb: vi.fn()
}));

describe('Status API Route', () => {
  it('debería retornar el estado y la configuración', async () => {
    pool.query.mockImplementation(async (query) => {
      if (query.includes('match_status')) {
        return { rows: [{ status: 'live', result: '1-0', period: '1er Tiempo' }] };
      }
      if (query.includes('match_config')) {
        return { rows: [{ team_a_name: 'Ecuador', team_b_name: 'Marruecos' }] };
      }
      return { rows: [] };
    });

    const response = await StatusGET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('live');
    expect(data.matchConfig.team_a_name).toBe('Ecuador');
  });
});

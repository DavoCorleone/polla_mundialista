import { describe, it, expect, vi } from 'vitest';
import { GET as ParticipantsGET } from '../src/app/api/participants/route';
import pool from '../src/lib/db';

vi.mock('../src/lib/db', () => ({
  default: {
    query: vi.fn(),
  },
}));

describe('Participants API Route', () => {
  it('debería retornar la lista de participantes', async () => {
    pool.query.mockResolvedValue({
      rows: [
        { name: 'Alice', prediction_outcome: 'Ecuador', created_at: '2026-03-20T10:00:00Z' },
        { name: 'Bob', prediction_outcome: 'Marruecos', created_at: '2026-03-21T10:00:00Z' }
      ]
    });

    const response = await ParticipantsGET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.length).toBe(2);
    expect(data[0].name).toBe('Alice');
  });
});

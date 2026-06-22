import request from 'supertest';
import { app } from '../app';

describe('US-000-TASK-06: GET /api/health', () => {
  it('returns 200 with ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('returns a valid ISO 8601 timestamp', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.timestamp).toBeDefined();
    const date = new Date(res.body.timestamp);
    expect(date.getTime()).not.toBeNaN();
  });

  it('does not expose internal server details', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body).not.toHaveProperty('stack');
    expect(res.body).not.toHaveProperty('version');
    expect(res.body).not.toHaveProperty('pid');
  });
});

describe('health controller unit', () => {
  it('calls res.status(200).json with correct shape', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getHealth } = require('./health.controller');
    const req = {} as ReturnType<typeof request>;
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    const res = { status: statusMock } as unknown as ReturnType<typeof request>;

    getHealth(req, res);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ok',
        timestamp: expect.any(String),
      })
    );
  });
});

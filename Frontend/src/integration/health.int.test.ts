/** @jest-environment node */
import axios from 'axios';

const base = process.env.VITE_API_BASE_URL || 'http://localhost:8081';
async function getToken() {
  const params = new URLSearchParams();
  params.set('grant_type', 'password');
  params.set('client_id', 'covoituraje-frontend');
  params.set('username', 'test.user');
  params.set('password', 'password123');
  const res = await axios.post('http://localhost:8080/realms/covoituraje/protocol/openid-connect/token', params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 5000,
  });
  return res.data.access_token as string;
}

const itIf = (cond: boolean) => (cond ? it : it.skip);

describe('Integration: health endpoints', () => {
  itIf(!!process.env.RUN_INT)('trips-service /health responds 200', async () => {
    const token = await getToken();
    const res = await axios.get(`${base}/health`, { timeout: 3000, headers: { Authorization: `Bearer ${token}` } });
    expect(res.status).toBe(200);
  });
});



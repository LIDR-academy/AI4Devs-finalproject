/** @jest-environment node */
import axios from 'axios';

const API = process.env.VITE_API_BASE_URL || 'http://localhost:8081';
const itIf = (cond: boolean) => (cond ? it : it.skip);

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

describe('Integration: domain happy paths (requires backend running)', () => {
  itIf(!!process.env.RUN_INT)('Trips list returns array', async () => {
    const token = await getToken();
    const res = await axios.get(`${API}/api/trips`, { timeout: 5000, headers: { Authorization: `Bearer ${token}` } });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });

  itIf(!!process.env.RUN_INT)('Matches search with destination returns array', async () => {
    const token = await getToken();
    const res = await axios.get(`${API.replace('8081', '8084')}/api/matches?destinationSedeId=SEDE-1`, {
      timeout: 30000,
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  }, 35000);
});



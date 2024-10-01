import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://ikigoo-backend.onrender.com';

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const sessionId = Cookies.get('sessionId');

  try {
    if (!sessionId) {
      console.error('No sessionId found');
      return;
    }

    const response = await axios({
      url: `${BASE_URL}${url}`,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId || ''
      },
      data: options.body,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error en la solicitud a la API', error);
    throw new Error('Error en la solicitud a la API');
  }
};
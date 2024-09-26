import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = 'http://localhost:3000';

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const sessionId = Cookies.get('sessionId');

  try {
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
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';
import { apiFetch } from '../utils/api';
import { removeCurrentTripId } from '../utils/sessionUtils';

export function useSession() {
  useEffect(() => {
    let sessionId = Cookies.get('sessionId');
    if (!sessionId) {
      sessionId = uuidv4();
      Cookies.set('sessionId', sessionId, { expires: 365, secure: true, sameSite: 'Strict' });

      apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
      })
      .then()
      .catch((error) => {
        console.error('Error al crear el usuario:', error);
      });
    }

    removeCurrentTripId();
  }, []);
}
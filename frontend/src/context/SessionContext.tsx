import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';
import { apiFetch } from '../utils/api';
interface SessionContextProps {
  sessionId: string;
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    let id = Cookies.get('sessionId');
    if (!id) {
      id = uuidv4();
      Cookies.set('sessionId', id, { expires: 7, secure: true, sameSite: 'Strict' });

      apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({ sessionId: id }),
      })
      .then()
      .catch((error) => {
        console.error('Error al crear el usuario:', error);
      });
    }
    setSessionId(id);
  }, []);

  return (
    <SessionContext.Provider value={{ sessionId }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession debe ser usado dentro de SessionProvider');
  }
  return context;
};
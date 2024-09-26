import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useChat } from '../hooks/useChat';
import { apiFetch } from '../utils/api';

interface ChatContextType extends ReturnType<typeof useChat> {
  trips: any[];
  fetchTrips: () => void;
  setTripDetails: (tripDetails: any) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<any[]>([]);

  const fetchTrips = useCallback(async () => {
    try {
      const data = await apiFetch('/trips/recent', {
        method: 'GET',
      });
      setTrips(data || []);
    } catch (error) {
      console.error('Error al recuperar los viajes:', error);
      setTrips([]);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const chat = useChat(fetchTrips);

  return (
    <ChatContext.Provider value={{ ...chat, trips, fetchTrips }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext debe ser usado dentro de ChatProvider');
  }
  return context;
};
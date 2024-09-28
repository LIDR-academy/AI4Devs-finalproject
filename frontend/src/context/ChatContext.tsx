import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useChat } from '../hooks/useChat';
import { getRecentTrips } from '../services/tripService';

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
      const data = await getRecentTrips();
      setTrips(data || []);
    } catch (error) {
      console.error('Error al recuperar los viajes:', error);
      setTrips([]);
    }
  }, []);

  const chat = useChat(fetchTrips);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  return (
    <ChatContext.Provider
      value={{
        ...chat,
        trips,
        fetchTrips,
      }}
    >
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
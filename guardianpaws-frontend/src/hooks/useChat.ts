import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, push, set, query, orderByChild, equalTo, get, DataSnapshot, Database } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Message, ChatChannel } from '@/types/chat';

export const useChat = (currentUserEmail: string) => {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load chat channels
  useEffect(() => {
    if (!currentUserEmail) {
      return;
    }

    const channelsRef = ref(database, 'channels');

    const unsubscribe = onValue(channelsRef, 
      (snapshot: DataSnapshot) => {
        const channelsData: ChatChannel[] = [];
        snapshot.forEach((childSnapshot: DataSnapshot) => {
          const channelData = childSnapshot.val();
          const channelId = childSnapshot.key!;
          
          if (channelData.participants && Array.isArray(channelData.participants)) {
            if (channelData.participants.includes(currentUserEmail)) {
              channelsData.push({
                id: channelId,
                participants: channelData.participants,
                lastMessage: channelData.lastMessage,
                lastMessageTimestamp: channelData.lastMessageTimestamp,
                createdAt: channelData.createdAt
              });
            }
          }
        });
        setChannels(channelsData);
      },
      (error) => {
        console.error('Error al cargar canales:', error);
        setError(error.message);
      }
    );

    return () => unsubscribe();
  }, [currentUserEmail]);

  // Load messages for active chat
  useEffect(() => {
    if (!activeChat) {
      return;
    }

    const messagesRef = ref(database, 'messages');
    const messagesQuery = query(
      messagesRef,
      orderByChild('channelId'),
      equalTo(activeChat)
    );

    const unsubscribe = onValue(messagesQuery, 
      (snapshot: DataSnapshot) => {
        const messagesData: Message[] = [];
        snapshot.forEach((childSnapshot: DataSnapshot) => {
          messagesData.push({
            id: childSnapshot.key!,
            ...childSnapshot.val(),
          });
        });
        setMessages(messagesData.sort((a, b) => a.timestamp - b.timestamp));
      },
      (error) => {
        console.error('Error al cargar mensajes:', error);
        setError(error.message);
      }
    );

    return () => unsubscribe();
  }, [activeChat]);

  const createOrGetChannel = useCallback(async (otherUserEmail: string) => {
    if (!currentUserEmail) {
      throw new Error('El correo electrónico del usuario actual es requerido');
    }

    if (!otherUserEmail) {
      throw new Error('El correo electrónico del otro usuario es requerido');
    }

    try {
      // Codificar los correos electrónicos para que sean rutas válidas
      const encodedCurrentEmail = currentUserEmail.replace(/[.#$[\]]/g, '_');
      const encodedOtherEmail = otherUserEmail.replace(/[.#$[\]]/g, '_');
      
      const channelId = [encodedCurrentEmail, encodedOtherEmail].sort().join('_');
      const channelRef = ref(database, `channels/${channelId}`);
      const channelSnapshot = await get(channelRef);
      
      if (!channelSnapshot.exists()) {
        const channelData = {
          participants: [currentUserEmail, otherUserEmail],
          lastMessageTimestamp: Date.now(),
          createdAt: Date.now(),
        };
        
        await set(channelRef, channelData);
      }

      setActiveChat(channelId);
      return channelId;
    } catch (error) {
      console.error('Error en createOrGetChannel:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      throw error;
    }
  }, [currentUserEmail]);

  const sendMessage = useCallback(async (content: string) => {
    if (!activeChat) {
      throw new Error('No hay chat activo');
    }

    try {
      const messageRef = push(ref(database, 'messages'));
      const newMessage: Omit<Message, 'id'> = {
        sender: currentUserEmail,
        receiver: channels.find(c => c.id === activeChat)?.participants.find(p => p !== currentUserEmail) || '',
        content,
        timestamp: Date.now(),
        channelId: activeChat,
      };

      await set(messageRef, newMessage);

      const channelRef = ref(database, `channels/${activeChat}`);
      const channelSnapshot = await get(channelRef);
      const channelData = channelSnapshot.val() || {};

      await set(channelRef, {
        ...channelData,
        lastMessage: { ...newMessage, id: messageRef.key! },
        lastMessageTimestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      throw error;
    }
  }, [activeChat, channels, currentUserEmail]);

  return {
    channels,
    messages,
    activeChat,
    setActiveChat,
    createOrGetChannel,
    sendMessage,
    error,
  };
}; 
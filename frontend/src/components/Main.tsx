import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import Chat from './Chat';
import ItinerarySection from './ItinerarySection';
import { useChatContext } from '../context/ChatContext';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';
import { apiFetch } from '../utils/api';

export default function MainPage() {
  const chat = useChatContext();

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
  }, []);

  return (
    <div className="flex h-screen bg-white text-black">
      <Sidebar />
      <div className="flex-grow flex">
        <Chat 
          messages={chat.messages}
          inputValue={chat.inputValue}
          setInputValue={chat.setInputValue}
          handleSend={chat.handleSend}
          tripTitle={chat.tripTitle}
          clearMessages={chat.clearMessages} // Pasar clearMessages como prop
          isLoading={chat.isLoading} // Pasar isLoading como prop
        />
        <ItinerarySection 
          tripProperties={chat.tripProperties} 
          tripItinerary={chat.tripItinerary} 
        />
      </div>
    </div>
  );
}
import React from 'react';
import Sidebar from './Sidebar';
import Chat from './Chat';
import ItinerarySection from './ItinerarySection';
import { LanguageProvider } from '../context/LanguageContext';
import { useChat } from '../hooks/useChat';

export default function MainPage() {
  const chat = useChat();

  return (
    <LanguageProvider>
      <div className="flex h-screen bg-white text-black">
        <Sidebar />
        <div className="flex-grow flex">
          <Chat 
            messages={chat.messages}
            inputValue={chat.inputValue}
            setInputValue={chat.setInputValue}
            handleSend={chat.handleSend}
            tripTitle={chat.tripTitle}
          />
          <ItinerarySection 
            tripProperties={chat.tripProperties} 
            tripItinerary={chat.tripItinerary} 
          />
        </div>
      </div>
    </LanguageProvider>
  );
}
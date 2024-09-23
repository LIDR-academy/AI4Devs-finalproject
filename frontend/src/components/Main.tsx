import React from 'react';
import Sidebar from './Sidebar';
import Chat from './Chat';
import ItinerarySection from './ItinerarySection';
import { LanguageProvider } from '../context/LanguageContext';

export default function MainPage() {
  return (
    <LanguageProvider>
      <div className="flex h-screen bg-white text-black">
        <Sidebar />
        <div className="flex-grow flex">
          <Chat />
          <ItinerarySection />
        </div>
      </div>
    </LanguageProvider>
  );
}
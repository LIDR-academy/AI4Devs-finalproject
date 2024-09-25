import React from 'react';
import { RocketLaunchIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { useLanguage } from '../context/LanguageContext';
import { clearSession, getRecentTrips, saveCurrentTripId, saveCurrentThreadId } from '../utils/sessionUtils';
import { useChatContext } from '../context/ChatContext';

export default function Sidebar() {
    const { language, setLanguage, translator } = useLanguage();
    const { trips, fetchTrips, clearMessages, setCurrentThreadId, handleSend } = useChatContext();

    const toggleLanguage = () => {
        setLanguage(language === 'EN' ? 'ES' : 'EN');
    };

    const handleNewChat = () => {
        clearSession();
        clearMessages();
        fetchTrips();
        window.location.reload();
    };

    const handleTripClick = (tripId: string) => {
        const recentTrips = getRecentTrips();
        const trip = recentTrips.find((t: any) => t.tripId === tripId);

        if (trip) {
            saveCurrentTripId(trip.tripId);
            saveCurrentThreadId(trip.threadId);
            setCurrentThreadId(trip.threadId);
            handleSend(translator('recover-itinerary'));
        }
    };

    return (
        <div className="w-64 p-4 flex flex-col border-r-2 border-gray-100 flex-shrink-0">
            <div className="flex flex-col items-center">
                <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-Z3vqK1WAdvhcavo10sL6QxLv3IdVRd.png"
                    alt="IkiGoo Logo"
                />
            </div>
            <nav className="space-y-4 flex-grow">
                <div className="flex justify-center pb-4">
                    <button
                        onClick={toggleLanguage}
                        className="mt-2 bg-violet-500 rounded-full py-1 px-2 flex items-center hover:bg-violet-600 transition-colors text-white text-sm"
                    >
                        <GlobeAltIcon className="size-4 text-gray-600 mr-1 text-white" />
                        {language === 'EN' ? 'Español' : 'English'}
                    </button>
                </div>
                {trips.length > 0 ? (
                    <div className="flex flex-col space-y-2 pt-4">
                        <div className="flex items-center space-x-1 pb-2">
                            <RocketLaunchIcon className="size-6 text-gray-600" />
                            <span className="font-semibold">{translator('trips')}</span>
                        </div>
                        <div className="space-y-2">
                            {trips.map((trip: any) => (
                                <div 
                                    key={trip.id} 
                                    className="text-gray-800 pb-2 hover:text-violet-500 cursor-pointer"
                                    onClick={() => handleTripClick(trip.id)}
                                >
                                    <div>{trip.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-600 pt-4">
                        {translator('no-itineraries')}
                    </div>
                )}
            </nav>

            {trips.length === 3 ? (
                <button onClick={() => {
                    window.open('https://i.kym-cdn.com/entries/icons/original/000/005/574/takemymoney.jpg', '_blank');
                }} className="bg-violet-500 rounded-full py-2 px-4 mt-4 hover:bg-violet-600 transition-colors text-white">
                    {translator('upgrade-to-pro')}
                </button>
            ) : (
                <button 
                    onClick={handleNewChat} 
                    className="bg-gray-200 rounded-full py-2 px-4 mt-4 hover:bg-gray-300 transition-colors"
                >
                    {translator('btn-new-chat')}
                </button>
            )}

        </div>
    );
}
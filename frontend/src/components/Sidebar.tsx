import React, { useState } from 'react';
import { ChatBubbleLeftEllipsisIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar() {
    const [chats] = useState([]);
    const { language, setLanguage, translator } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'EN' ? 'ES' : 'EN');
    };

    return (
        <div className="w-64 p-4 flex flex-col border-r-2 border-gray-100">
            <div className="flex flex-col items-center mb-4">
                <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-Z3vqK1WAdvhcavo10sL6QxLv3IdVRd.png"
                    alt="IkiGoo Logo"
                    className="mb-2"
                />
            </div>
            <nav className="space-y-4 flex-grow border-t-2 border-gray-100 pt-4">
                <div className="flex justify-center">
                    <button
                        onClick={toggleLanguage}
                        className="mt-2 bg-gray-200 rounded-full py-1 px-2 flex items-center hover:bg-gray-300 transition-colors"
                    >
                        <GlobeAltIcon className="size-6 text-gray-600 mr-1" />
                        {language === 'EN' ? 'ES' : 'EN'}
                    </button>
                </div>
                {chats.length > 0 ? (
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-1">
                            <ChatBubbleLeftEllipsisIcon className="size-6 text-gray-600" />
                            <span className="font-semibold">{translator('chats')}</span>
                        </div>
                        <div className="pl-8 space-y-2">
                            {/* Aquí puedes agregar los elementos de la lista de chats */}
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-600">
                        {translator('no-chats')}
                    </div>
                )}
            </nav>
            <button className="bg-gray-200 rounded-full py-2 px-4 mt-4 hover:bg-gray-300 transition-colors">{translator('btn-new-chat')}</button>
        </div>
    );
}

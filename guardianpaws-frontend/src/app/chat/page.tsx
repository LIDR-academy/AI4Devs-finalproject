'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatList } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useChat } from '@/hooks/useChat';
import Navigation from '@/components/Navigation';

export default function ChatPage() {
  const router = useRouter();
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [newChatEmail, setNewChatEmail] = useState('');
  const [showChatList, setShowChatList] = useState(true);
  const {
    channels,
    messages,
    activeChat,
    setActiveChat,
    createOrGetChannel,
    sendMessage,
    error,
  } = useChat(currentUserEmail);

  useEffect(() => {
    const email = localStorage.getItem('currentUserEmail');
    const searchParams = new URLSearchParams(window.location.search);
    const reportEmail = searchParams.get('reportEmail');
    
    if (!email) {
      router.push('/');
      return;
    }
    setCurrentUserEmail(email);
  }, [router]);

  const handleStartNewChatWithEmail = async (email: string) => {
    if (!email) return;

    try {
      const channelId = await createOrGetChannel(email);
      setShowNewChatForm(false);
      setNewChatEmail('');
      setShowChatList(false);
    } catch (error) {
      alert(`Error al iniciar chat: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleNewChatClick = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const reportEmail = searchParams.get('reportEmail');
    
    if (reportEmail) {
      handleStartNewChatWithEmail(reportEmail);
    } else {
      setShowNewChatForm(true);
    }
  };

  if (!currentUserEmail) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="text-gray-300">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* <Navigation /> */}
      <div className="flex-1 flex relative">
        <div className="max-w-7xl mx-auto w-full h-[calc(100vh-4rem)] flex">
          {/* Botón para mostrar/ocultar lista de chats en móvil */}
          {/* <button
            onClick={() => setShowChatList(!showChatList)}
            className="lg:hidden fixed top-20 left-4 z-50 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showChatList ? '✕' : '☰'}
          </button> */}

          {/* Lista de chats */}
          <div className={`
            fixed lg:static top-16 bottom-0 z-30 w-full lg:w-80 bg-gray-900 border-r border-gray-800 flex flex-col
            transform transition-transform duration-300 ease-in-out
            ${showChatList ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white text-center">Conversaciones</h2>
              <button
                onClick={handleNewChatClick}
                className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Nueva Conversación
              </button>
            </div>

            {showNewChatForm && (
              <div className="p-4 border-b border-gray-800">
                <form onSubmit={handleStartNewChat} className="space-y-2">
                  <input
                    type="email"
                    value={newChatEmail}
                    onChange={(e) => setNewChatEmail(e.target.value)}
                    placeholder="Correo electrónico"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    required
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Iniciar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewChatForm(false);
                        setNewChatEmail('');
                      }}
                      className="flex-1 bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            <ChatList
              channels={channels}
              currentUserEmail={currentUserEmail}
              activeChat={activeChat}
              onSelectChat={(chatId) => {
                setActiveChat(chatId);
                setShowChatList(false);
              }}
            />
          </div>

          {/* Ventana de chat */}
          <div className="flex-1 flex flex-col bg-black">
            {activeChat ? (
              <ChatWindow
                messages={messages}
                currentUserEmail={currentUserEmail}
                onSendMessage={sendMessage}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-black">
                <div className="text-center p-4">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Selecciona una conversación
                  </h2>
                  <p className="text-gray-400">
                    Elige una conversación existente o inicia una nueva
                  </p>
                  <button
                    onClick={() => setShowChatList(true)}
                    className="lg:hidden mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ver conversaciones
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
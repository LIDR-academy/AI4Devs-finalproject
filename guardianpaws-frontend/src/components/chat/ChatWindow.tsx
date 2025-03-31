import { useState, useRef, useEffect } from 'react';
import { Message } from '@/types/chat';

interface ChatWindowProps {
  messages: Message[];
  currentUserEmail: string;
  onSendMessage: (content: string) => Promise<void>;
}

export const ChatWindow = ({ messages, currentUserEmail, onSendMessage }: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      alert('Error al enviar mensaje. Por favor, intenta de nuevo.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Encabezado del chat */}
      <div className="p-4 border-b border-gray-800 bg-gray-900">
        <h2 className="text-lg font-semibold text-white text-center">Chat</h2>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          return (
            <div
              key={message.id}
              className={`flex ${
                message.sender === currentUserEmail ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] sm:max-w-[70%] md:max-w-[60%] rounded-lg p-3 ${
                  message.sender === currentUserEmail
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                <div className="text-sm mb-1 opacity-75">
                  {message.sender === currentUserEmail ? 'Tú' : message.sender}
                </div>
                <div className="break-words">{message.content}</div>
                <div className="text-xs mt-1 opacity-75">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Formulario de envío de mensajes */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
}; 
import { ChatChannel } from '@/types/chat';

interface ChatListProps {
  channels: ChatChannel[];
  currentUserEmail: string;
  activeChat: string | null;
  onSelectChat: (chatId: string) => void;
}

export const ChatList = ({ channels, currentUserEmail, activeChat, onSelectChat }: ChatListProps) => {
  const getOtherParticipant = (channel: ChatChannel) => {
    if (!channel.participants || channel.participants.length === 0) {
      const [email1, email2] = channel.id.split('_').map(email => 
        email.replace(/_/g, '@').replace(/com$/, '.com')
      );
      return email1 === currentUserEmail ? email2 : email1;
    }
    
    const otherParticipant = channel.participants.find(p => p !== currentUserEmail) || '';
    return otherParticipant;
  };

  const formatLastMessage = (channel: ChatChannel) => {
    if (!channel.lastMessage) return 'No hay mensajes';
    const content = channel.lastMessage.content;
    return content.length > 30 ? `${content.substring(0, 30)}...` : content;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {channels.length === 0 ? (
        <div className="p-4 text-center text-gray-400">
          No hay conversaciones
        </div>
      ) : (
        <div className="divide-y divide-gray-800">
          {channels.map((channel) => {
            const otherParticipant = getOtherParticipant(channel);
            const isActive = channel.id === activeChat;

            return (
              <button
                key={channel.id}
                onClick={() => onSelectChat(channel.id)}
                className={`
                  w-full p-4 text-left hover:bg-gray-800 transition-colors
                  ${isActive ? 'bg-gray-800' : ''}
                `}
              >
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white truncate">
                      {otherParticipant}
                    </span>
                    {channel.lastMessage && (
                      <span className="text-xs text-gray-400">
                        {new Date(channel.lastMessage.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 truncate">
                    {formatLastMessage(channel)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}; 
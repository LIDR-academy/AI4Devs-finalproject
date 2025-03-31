export interface Message {
  id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: number;
  channelId: string;
}

export interface ChatChannel {
  id: string;
  participants: string[];
  lastMessage?: Message;
  lastMessageTimestamp?: number;
  createdAt?: number;
}

export interface ChatState {
  currentUserEmail: string;
  activeChat: string | null;
  messages: Message[];
  channels: ChatChannel[];
} 
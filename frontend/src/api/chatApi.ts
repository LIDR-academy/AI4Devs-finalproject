import { ChatApiResponse, SendMessageParams } from '@/types/dto';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';
const CHAT_ENDPOINT = API_URL ? `${API_URL}/api/chat` : '/api/chat';

// Get authentication token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const chatApi = {
  // Send a message to the chat API
  async sendMessage(params: SendMessageParams) {
    try {
      const response = await axios.post(CHAT_ENDPOINT, params, getAuthHeader());
      return response.data as ChatApiResponse;
    } catch (error) {
      console.error('Chat API error:', error);
      throw error;
    }
  }
}; 
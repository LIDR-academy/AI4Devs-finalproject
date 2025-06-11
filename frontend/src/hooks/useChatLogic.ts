import { useCallback, useRef, useState } from 'react';
import { chatApi, ChatApiResponse, SimpleChatMessage } from '../api/chatApi';
import { faqApi } from '../api/faqApi';
import { ChatMessage } from '../types/chat';
import { FAQ } from '../types/faq';
import { useApiCall } from './useApiCall';

interface UseChatLogicReturn {
  messages: ChatMessage[];
  loading: boolean;
  relatedFaqs: FAQ[];
  sendMessage: (content: string) => Promise<void>;
  scrollToBottom: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "Hi there! I'm your virtual assistant. How can I help you today?",
  timestamp: new Date().toISOString(),
};

export const useChatLogic = (): UseChatLogicReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [relatedFaqs, setRelatedFaqs] = useState<FAQ[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // API call for chat with retry logic
  const {
    loading,
    execute: executeChatMessage
  } = useApiCall(chatApi.sendMessage, {
    retries: 2,
    retryDelay: 1500,
    onError: (error) => {
      console.error("Chat API error:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  // API call for FAQ search with retry logic
  const {
    execute: executeFAQSearch
  } = useApiCall(faqApi.searchFAQSemanticly, {
    retries: 1,
    onSuccess: (results) => {
      setRelatedFaqs(results);
    },
    onError: (error) => {
      console.error("Error searching FAQs:", error);
      setRelatedFaqs([]);
    }
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const formatMessagesForAPI = useCallback((messages: ChatMessage[]): SimpleChatMessage[] => {
    const validRoles = ['user', 'assistant', 'system', 'function', 'tool'];
    
    return messages
      .map(msg => {
        const formattedMsg: SimpleChatMessage = {
          role: msg.role,
          content: msg.content
        };
        
        // Add optional fields if present
        if (msg.imageUrl) formattedMsg.imageUrl = msg.imageUrl;
        if (msg.imageCaption) formattedMsg.imageCaption = msg.imageCaption;
        if (msg.name) formattedMsg.name = msg.name;
        if (msg.function_call) formattedMsg.function_call = msg.function_call;
        if (msg.tool_calls) formattedMsg.tool_calls = msg.tool_calls;
        if (msg.tool_call_id) formattedMsg.tool_call_id = msg.tool_call_id;
        
        return formattedMsg;
      })
      .filter(msg => {
        const isValid = validRoles.includes(msg.role);
        if (!isValid) {
          console.warn(`Message with invalid role filtered:`, msg);
        }
        return isValid;
      });
  }, []);

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);

    try {
      // Search for related FAQs (for display purposes) - non-blocking
      executeFAQSearch(content).catch(() => {
        // FAQ search failure is not critical, just log it
        console.warn('FAQ search failed, continuing with chat');
      });

      // Prepare messages for API
      const currentMessages = [...messages, userMessage];
      const apiMessages = formatMessagesForAPI(currentMessages);

      // Send to chat API with retry logic
      const response: ChatApiResponse = await executeChatMessage({ 
        messages: apiMessages 
      });

      // Create assistant message from response
      let assistantMessage: ChatMessage;
      
      if (response?.message) {
        assistantMessage = {
          role: "assistant",
          content: response.message.content || "I'm sorry, I couldn't generate a response.",
          timestamp: new Date().toISOString(),
          ...(response.message.function_call && { function_call: response.message.function_call }),
          ...(response.message.tool_calls && { tool_calls: response.message.tool_calls })
        };
      } else {
        assistantMessage = {
          role: "assistant",
          content: "I'm sorry, I couldn't generate a response.",
          timestamp: new Date().toISOString(),
        };
      }

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      // Error handling is done in the useApiCall hook
      console.error("Failed to send message:", error);
    }
  }, [messages, formatMessagesForAPI, executeChatMessage, executeFAQSearch]);

  return {
    messages,
    loading,
    relatedFaqs,
    sendMessage,
    scrollToBottom,
    messagesEndRef,
  };
}; 
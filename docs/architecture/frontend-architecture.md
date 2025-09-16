# 🎨 Frontend Architecture - Nura System

## 🏗️ Architecture Overview

**MVP Strategy**: Streamlit ultra-minimalista para validación rápida de hipótesis, con **evolution path** a React para escalabilidad empresarial.

**Design Principles**:
- **Conversation-First**: Chat interface como primary interaction pattern
- **Progressive Enhancement**: Streamlit MVP → React SPA evolution
- **Real-time Communication**: WebSocket integration para live conversations
- **Responsive Design**: Mobile-first approach para developer accessibility
- **Component Reusability**: Modular design patterns across both platforms

---

## Phase 1: Streamlit MVP Architecture

### Component Organization

```text
src/frontend/streamlit/
├── app.py                          # Main Streamlit app entry point
├── components/                     # Reusable UI components
│   ├── __init__.py
│   ├── chat/
│   │   ├── __init__.py
│   │   ├── chat_interface.py       # Main chat component
│   │   ├── message_bubble.py       # Individual message display
│   │   └── conversation_history.py  # Chat history management
│   ├── sidebar/
│   │   ├── __init__.py
│   │   ├── user_preferences.py     # User settings sidebar
│   │   ├── conversation_list.py    # Previous conversations
│   │   └── agent_status.py         # Agent availability status
│   └── common/
│       ├── __init__.py
│       ├── loading_spinner.py      # Loading states
│       ├── error_display.py        # Error handling UI
│       └── metrics_display.py      # Usage metrics
├── services/                       # Frontend service layer
│   ├── __init__.py
│   ├── api_client.py              # HTTP client for backend APIs
│   ├── websocket_client.py        # WebSocket client for real-time
│   ├── conversation_service.py     # Conversation management
│   └── user_service.py            # User management
├── utils/                         # Utility functions
│   ├── __init__.py
│   ├── session_state.py           # Streamlit session management
│   ├── formatting.py              # Message formatting utilities
│   └── validation.py              # Input validation
├── config/
│   ├── __init__.py
│   ├── settings.py                # App configuration
│   └── api_endpoints.py           # Backend endpoints configuration
└── assets/                       # Static assets
    ├── styles.css                 # Custom styling
    ├── icons/                     # UI icons
    └── images/                    # App images
```

### Main App Architecture

```python
# src/frontend/streamlit/app.py
import streamlit as st
from components.chat.chat_interface import ChatInterface
from components.sidebar.user_preferences import UserPreferences
from components.sidebar.conversation_list import ConversationList
from services.api_client import APIClient
from services.websocket_client import WebSocketClient
from config.settings import Settings

class NuraStreamlitApp:
    def __init__(self):
        self.settings = Settings()
        self.api_client = APIClient(base_url=self.settings.API_BASE_URL)
        self.ws_client = WebSocketClient(ws_url=self.settings.WS_BASE_URL)
        self.chat_interface = ChatInterface(
            api_client=self.api_client,
            ws_client=self.ws_client
        )
    
    def setup_page_config(self):
        st.set_page_config(
            page_title="Nura - AI Developer Assistant",
            page_icon="🤖",
            layout="wide",
            initial_sidebar_state="expanded"
        )
    
    def render_sidebar(self):
        with st.sidebar:
            st.title("🤖 Nura")
            
            # User preferences
            user_prefs = UserPreferences()
            user_prefs.render()
            
            # Conversation history
            conv_list = ConversationList(api_client=self.api_client)
            conv_list.render()
            
            # Agent status
            self.render_agent_status()
    
    def render_main_content(self):
        # Main chat interface
        self.chat_interface.render()
        
        # Usage metrics (collapsible)
        with st.expander("📊 Usage Metrics", expanded=False):
            self.render_usage_metrics()
    
    def render_agent_status(self):
        st.subheader("Agent Status")
        agents = ["Dev Agent", "PM Agent", "Architect Agent"]
        
        for agent in agents:
            status = self.get_agent_status(agent)
            if status == "online":
                st.success(f"✅ {agent}")
            elif status == "busy":
                st.warning(f"⚡ {agent} (busy)")
            else:
                st.error(f"❌ {agent} (offline)")
    
    def get_agent_status(self, agent: str) -> str:
        # Check agent availability via API
        try:
            response = self.api_client.get(f"/orchestration/agent-status/{agent.lower().replace(' ', '_')}")
            return response.get("status", "offline")
        except:
            return "offline"
    
    def render_usage_metrics(self):
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Messages Today", "24", "+12")
        with col2:
            st.metric("LLM Calls", "18", "+8")
        with col3:
            st.metric("Cost (USD)", "$2.34", "+$1.12")
    
    def run(self):
        self.setup_page_config()
        self.render_sidebar()
        self.render_main_content()

# App entry point
if __name__ == "__main__":
    app = NuraStreamlitApp()
    app.run()
```

### Chat Interface Component

```python
# src/frontend/streamlit/components/chat/chat_interface.py
import streamlit as st
from typing import List, Dict, Any
from services.api_client import APIClient
from services.websocket_client import WebSocketClient
from utils.session_state import SessionStateManager
import asyncio
import time

class ChatInterface:
    def __init__(self, api_client: APIClient, ws_client: WebSocketClient):
        self.api_client = api_client
        self.ws_client = ws_client
        self.session_manager = SessionStateManager()
        
        # Initialize session state
        if 'messages' not in st.session_state:
            st.session_state.messages = []
        if 'conversation_id' not in st.session_state:
            st.session_state.conversation_id = None
    
    def render(self):
        # Chat messages container
        self.render_chat_history()
        
        # Message input
        self.render_message_input()
        
        # Real-time updates
        self.handle_websocket_updates()
    
    def render_chat_history(self):
        # Chat messages container with auto-scroll
        chat_container = st.container()
        
        with chat_container:
            for message in st.session_state.messages:
                self.render_message(message)
    
    def render_message(self, message: Dict[str, Any]):
        is_user = message['role'] == 'user'
        
        # Message alignment
        col1, col2, col3 = st.columns([1, 6, 1] if is_user else [1, 6, 1])
        
        with col2:
            if is_user:
                # User message (right aligned)
                st.markdown(f"""
                <div style="
                    background-color: #0066cc;
                    color: white;
                    padding: 10px;
                    border-radius: 10px;
                    margin: 5px 0;
                    text-align: right;
                ">
                    {message['content']}
                </div>
                """, unsafe_allow_html=True)
            else:
                # Assistant message (left aligned)
                agent_type = message.get('agent_type', 'assistant')
                agent_emoji = self.get_agent_emoji(agent_type)
                
                st.markdown(f"""
                <div style="
                    background-color: #f0f2f6;
                    color: #262730;
                    padding: 10px;
                    border-radius: 10px;
                    margin: 5px 0;
                    border-left: 4px solid #0066cc;
                ">
                    <strong>{agent_emoji} {agent_type.title()}</strong><br>
                    {message['content']}
                </div>
                """, unsafe_allow_html=True)
                
                # LLM metadata (collapsible)
                if message.get('llm_model'):
                    with st.expander("🔍 Response Details", expanded=False):
                        col1, col2, col3 = st.columns(3)
                        with col1:
                            st.text(f"Model: {message['llm_model']}")
                        with col2:
                            st.text(f"Tokens: {message.get('tokens_total', 'N/A')}")
                        with col3:
                            st.text(f"Cost: ${message.get('cost_usd', 0):.4f}")
    
    def get_agent_emoji(self, agent_type: str) -> str:
        agent_emojis = {
            'dev': '👨‍💻',
            'pm': '📋',
            'architect': '🏗️',
            'assistant': '🤖'
        }
        return agent_emojis.get(agent_type, '🤖')
    
    def render_message_input(self):
        # Message input form
        with st.form("chat_form", clear_on_submit=True):
            col1, col2 = st.columns([6, 1])
            
            with col1:
                user_input = st.text_area(
                    "Ask Nura anything about code, architecture, or business context:",
                    height=100,
                    placeholder="e.g., ¿Por qué usamos este patrón de autenticación?",
                    key="user_message_input"
                )
            
            with col2:
                st.write("")  # Spacing
                submitted = st.form_submit_button("Send 🚀", use_container_width=True)
        
        if submitted and user_input.strip():
            self.handle_user_message(user_input.strip())
    
    def handle_user_message(self, message: str):
        # Add user message to chat
        user_message = {
            'role': 'user',
            'content': message,
            'timestamp': time.time()
        }
        st.session_state.messages.append(user_message)
        
        # Show processing indicator
        with st.spinner("Nura is thinking..."):
            try:
                # Send message to backend
                response = self.send_message_to_backend(message)
                
                # Add assistant response
                assistant_message = {
                    'role': 'assistant',
                    'content': response['content'],
                    'agent_type': response.get('agent_type', 'assistant'),
                    'llm_model': response.get('llm_model'),
                    'tokens_total': response.get('tokens_total'),
                    'cost_usd': response.get('cost_usd'),
                    'timestamp': time.time()
                }
                st.session_state.messages.append(assistant_message)
                
            except Exception as e:
                # Error handling
                error_message = {
                    'role': 'assistant',
                    'content': f"Sorry, I encountered an error: {str(e)}",
                    'agent_type': 'system',
                    'timestamp': time.time()
                }
                st.session_state.messages.append(error_message)
        
        # Rerun to update the chat
        st.rerun()
    
    def send_message_to_backend(self, message: str) -> Dict[str, Any]:
        # Create or continue conversation
        if not st.session_state.conversation_id:
            conversation_response = self.api_client.post('/conversations', {
                'title': f"Chat - {time.strftime('%Y-%m-%d %H:%M')}",
                'conversation_type': 'general'
            })
            st.session_state.conversation_id = conversation_response['id']
        
        # Send message
        response = self.api_client.post('/chat/message', {
            'conversation_id': st.session_state.conversation_id,
            'content': message
        })
        
        return response
    
    def handle_websocket_updates(self):
        # WebSocket connection for real-time updates
        if 'ws_connected' not in st.session_state:
            st.session_state.ws_connected = False
        
        # Connection status indicator
        if st.session_state.ws_connected:
            st.success("🟢 Real-time connected")
        else:
            st.warning("🟡 Connecting...")
            # Attempt WebSocket connection
            # (Implementation would depend on Streamlit's WebSocket capabilities)
```

### State Management

```python
# src/frontend/streamlit/utils/session_state.py
import streamlit as st
from typing import Any, Dict, Optional
import json

class SessionStateManager:
    """Manages Streamlit session state with persistence"""
    
    def __init__(self):
        self.init_default_state()
    
    def init_default_state(self):
        """Initialize default session state values"""
        defaults = {
            'user_id': None,
            'user_preferences': {
                'role': 'junior',
                'domain': 'backend',
                'language': 'en'
            },
            'current_conversation_id': None,
            'conversations': [],
            'messages': [],
            'agent_statuses': {},
            'usage_metrics': {
                'messages_today': 0,
                'llm_calls_today': 0,
                'cost_today_usd': 0.0
            }
        }
        
        for key, value in defaults.items():
            if key not in st.session_state:
                st.session_state[key] = value
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get value from session state"""
        return st.session_state.get(key, default)
    
    def set(self, key: str, value: Any):
        """Set value in session state"""
        st.session_state[key] = value
    
    def update_user_preferences(self, preferences: Dict[str, Any]):
        """Update user preferences"""
        current_prefs = st.session_state.user_preferences
        current_prefs.update(preferences)
        st.session_state.user_preferences = current_prefs
    
    def add_message(self, message: Dict[str, Any]):
        """Add message to current conversation"""
        st.session_state.messages.append(message)
    
    def clear_current_conversation(self):
        """Clear current conversation messages"""
        st.session_state.messages = []
        st.session_state.current_conversation_id = None
    
    def update_usage_metrics(self, metrics: Dict[str, Any]):
        """Update usage metrics"""
        current_metrics = st.session_state.usage_metrics
        current_metrics.update(metrics)
        st.session_state.usage_metrics = current_metrics
```

### API Client Service

```python
# src/frontend/streamlit/services/api_client.py
import requests
import streamlit as st
from typing import Dict, Any, Optional
import json
from urllib.parse import urljoin

class APIClient:
    """HTTP client for backend API communication"""
    
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        
        # Set default headers
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make HTTP request with error handling"""
        url = urljoin(self.base_url, endpoint.lstrip('/'))
        
        try:
            response = self.session.request(method, url, **kwargs)
            response.raise_for_status()
            
            if response.content:
                return response.json()
            return {}
            
        except requests.exceptions.RequestException as e:
            st.error(f"API request failed: {str(e)}")
            raise
        except json.JSONDecodeError as e:
            st.error(f"Invalid JSON response: {str(e)}")
            raise
    
    def get(self, endpoint: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        """GET request"""
        return self._make_request('GET', endpoint, params=params)
    
    def post(self, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """POST request"""
        return self._make_request('POST', endpoint, json=data)
    
    def put(self, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """PUT request"""
        return self._make_request('PUT', endpoint, json=data)
    
    def delete(self, endpoint: str) -> Dict[str, Any]:
        """DELETE request"""
        return self._make_request('DELETE', endpoint)
    
    # Convenience methods for common API calls
    
    def send_chat_message(self, conversation_id: str, message: str) -> Dict[str, Any]:
        """Send chat message"""
        return self.post('/chat/message', {
            'conversation_id': conversation_id,
            'content': message
        })
    
    def create_conversation(self, title: str, conversation_type: str = 'general') -> Dict[str, Any]:
        """Create new conversation"""
        return self.post('/conversations', {
            'title': title,
            'conversation_type': conversation_type
        })
    
    def get_conversations(self, limit: int = 20) -> Dict[str, Any]:
        """Get user conversations"""
        return self.get('/conversations', {'limit': limit})
    
    def get_agent_status(self, agent_type: str) -> Dict[str, Any]:
        """Get agent availability status"""
        return self.get(f'/orchestration/agent-status/{agent_type}')
```

---

## Phase 2: React Evolution Architecture

### Component Organization

```text
src/frontend/react/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── favicon.ico
├── src/
│   ├── components/                  # Reusable UI components
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.module.css
│   │   │   │   └── Button.test.tsx
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   └── Loading/
│   │   ├── chat/
│   │   │   ├── ChatInterface/
│   │   │   │   ├── ChatInterface.tsx
│   │   │   │   ├── ChatInterface.module.css
│   │   │   │   └── ChatInterface.test.tsx
│   │   │   ├── MessageBubble/
│   │   │   ├── ConversationList/
│   │   │   └── TypingIndicator/
│   │   └── layout/
│   │       ├── Sidebar/
│   │       ├── Header/
│   │       └── Layout/
│   ├── hooks/                      # Custom React hooks
│   │   ├── useChat.ts
│   │   ├── useWebSocket.ts
│   │   ├── useConversations.ts
│   │   └── useAgentStatus.ts
│   ├── services/                   # Service layer
│   │   ├── api.ts
│   │   ├── websocket.ts
│   │   ├── auth.ts
│   │   └── storage.ts
│   ├── store/                      # State management (Zustand)
│   │   ├── chatStore.ts
│   │   ├── userStore.ts
│   │   ├── conversationStore.ts
│   │   └── agentStore.ts
│   ├── types/                      # TypeScript definitions
│   │   ├── chat.ts
│   │   ├── user.ts
│   │   ├── conversation.ts
│   │   └── api.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── pages/                      # Page components
│   │   ├── ChatPage/
│   │   ├── ConversationsPage/
│   │   └── SettingsPage/
│   ├── App.tsx
│   ├── App.css
│   └── index.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts                  # Build configuration
└── tailwind.config.js              # Styling configuration
```

### React Chat Interface Component

```typescript
// src/frontend/react/src/components/chat/ChatInterface/ChatInterface.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../../store/chatStore';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { MessageBubble } from '../MessageBubble/MessageBubble';
import { TypingIndicator } from '../TypingIndicator/TypingIndicator';
import { Button } from '../../common/Button/Button';
import { Input } from '../../common/Input/Input';
import styles from './ChatInterface.module.css';

interface ChatInterfaceProps {
  conversationId?: string;
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversationId,
  className
}) => {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isTyping,
    sendMessage,
    isLoading
  } = useChatStore();
  
  const { isConnected } = useWebSocket();
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || isLoading) return;
    
    const message = messageInput.trim();
    setMessageInput('');
    
    try {
      await sendMessage(message, conversationId);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Error handling UI feedback
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };
  
  return (
    <div className={`${styles.chatInterface} ${className || ''}`}>
      {/* Connection status indicator */}
      <div className={styles.statusBar}>
        <div className={`${styles.connectionStatus} ${isConnected ? styles.connected : styles.disconnected}`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>
      
      {/* Messages container */}
      <div className={styles.messagesContainer}>
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id || index}
            message={message}
            isUser={message.role === 'user'}
          />
        ))}
        
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input form */}
      <form className={styles.messageForm} onSubmit={handleSendMessage}>
        <div className={styles.inputContainer}>
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Nura about code, architecture, or business context..."
            disabled={isLoading}
            multiline
            autoFocus
          />
          <Button
            type="submit"
            disabled={!messageInput.trim() || isLoading}
            loading={isLoading}
            icon="send"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};
```

### State Management (Zustand)

```typescript
// src/frontend/react/src/store/chatStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ChatMessage, ConversationMetadata } from '../types/chat';
import { apiService } from '../services/api';

interface ChatState {
  // State
  messages: ChatMessage[];
  currentConversationId: string | null;
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  
  // Actions
  sendMessage: (content: string, conversationId?: string) => Promise<void>;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setTyping: (isTyping: boolean) => void;
  setCurrentConversation: (conversationId: string | null) => void;
  clearMessages: () => void;
  retryLastMessage: () => Promise<void>;
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        messages: [],
        currentConversationId: null,
        isLoading: false,
        isTyping: false,
        error: null,
        
        // Actions
        sendMessage: async (content: string, conversationId?: string) => {
          const state = get();
          
          try {
            set({ isLoading: true, error: null });
            
            // Add user message immediately for optimistic UI
            const userMessage: ChatMessage = {
              id: `temp-${Date.now()}`,
              role: 'user',
              content,
              timestamp: new Date().toISOString(),
              conversationId: conversationId || state.currentConversationId
            };
            
            set({ messages: [...state.messages, userMessage] });
            
            // Send to backend
            const response = await apiService.sendChatMessage({
              content,
              conversationId: conversationId || state.currentConversationId || undefined
            });
            
            // Replace temp message with real message and add response
            const updatedMessages = state.messages
              .filter(msg => msg.id !== userMessage.id)
              .concat([
                {
                  ...userMessage,
                  id: response.userMessage.id
                },
                {
                  id: response.assistantMessage.id,
                  role: 'assistant',
                  content: response.assistantMessage.content,
                  timestamp: response.assistantMessage.timestamp,
                  conversationId: response.assistantMessage.conversationId,
                  agentType: response.assistantMessage.agentType,
                  llmMetadata: response.assistantMessage.llmMetadata
                }
              ]);
            
            set({ 
              messages: updatedMessages,
              currentConversationId: response.conversationId
            });
            
          } catch (error) {
            console.error('Failed to send message:', error);
            set({ 
              error: 'Failed to send message. Please try again.',
              // Remove the optimistic user message on error
              messages: state.messages.filter(msg => msg.id !== userMessage.id)
            });
          } finally {
            set({ isLoading: false });
          }
        },
        
        setMessages: (messages) => set({ messages }),
        
        addMessage: (message) => {
          const state = get();
          set({ messages: [...state.messages, message] });
        },
        
        setTyping: (isTyping) => set({ isTyping }),
        
        setCurrentConversation: (conversationId) => set({ 
          currentConversationId: conversationId,
          messages: [] // Clear messages when switching conversations
        }),
        
        clearMessages: () => set({ messages: [], error: null }),
        
        retryLastMessage: async () => {
          const state = get();
          const lastUserMessage = [...state.messages]
            .reverse()
            .find(msg => msg.role === 'user');
            
          if (lastUserMessage) {
            // Remove failed messages and retry
            const messagesUntilLastUser = state.messages
              .slice(0, state.messages.indexOf(lastUserMessage));
            
            set({ messages: messagesUntilLastUser });
            await get().sendMessage(lastUserMessage.content, state.currentConversationId || undefined);
          }
        }
      }),
      {
        name: 'chat-storage',
        partialize: (state) => ({
          currentConversationId: state.currentConversationId,
          // Don't persist messages to avoid stale data
        }),
      }
    ),
    {
      name: 'chat-store'
    }
  )
);
```

### Custom WebSocket Hook

```typescript
// src/frontend/react/src/hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/chatStore';

interface UseWebSocketOptions {
  url: string;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export const useWebSocket = (options: UseWebSocketOptions = {
  url: process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws',
  reconnectAttempts: 5,
  reconnectInterval: 3000
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { addMessage, setTyping } = useChatStore();
  
  const connect = () => {
    try {
      wsRef.current = new WebSocket(options.url);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setReconnectCount(0);
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          switch (data.type) {
            case 'chat_message':
              addMessage(data.message);
              break;
            case 'typing_indicator':
              setTyping(data.isTyping);
              break;
            case 'agent_status':
              // Handle agent status updates
              break;
            default:
              console.log('Unknown message type:', data.type);
          }
          
          options.onMessage?.(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt reconnection
        if (reconnectCount < (options.reconnectAttempts || 5)) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectCount(prev => prev + 1);
            connect();
          }, options.reconnectInterval || 3000);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        options.onError?.(error);
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };
  
  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  };
  
  const sendMessage = (data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected');
    }
  };
  
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);
  
  return {
    isConnected,
    reconnectCount,
    sendMessage,
    disconnect
  };
};
```

---

## Routing Architecture

### Route Organization

```typescript
// src/frontend/react/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout/Layout';
import { ChatPage } from './pages/ChatPage/ChatPage';
import { ConversationsPage } from './pages/ConversationsPage/ConversationsPage';
import { SettingsPage } from './pages/SettingsPage/SettingsPage';
import { useUserStore } from './store/userStore';

const App: React.FC = () => {
  const { isAuthenticated } = useUserStore();
  
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Main chat interface */}
          <Route path="/" element={<ChatPage />} />
          <Route path="/chat" element={<Navigate to="/" replace />} />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
          
          {/* Conversations management */}
          <Route path="/conversations" element={<ConversationsPage />} />
          
          {/* User settings */}
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
```

---

## Migration Strategy: Streamlit → React

### Phase 1: Streamlit MVP (Months 1-2)
- ✅ Ultra-fast development for hypothesis validation
- ✅ Complete chat functionality with backend integration
- ✅ Real-time WebSocket communication
- ✅ Basic user preferences and conversation history

### Phase 2: React Transition (Months 3-4)
- 🔄 Component-by-component migration
- 🔄 Enhanced UX with modern React patterns
- 🔄 Advanced state management with Zustand
- 🔄 Mobile-responsive design with Tailwind CSS

### Phase 3: Enterprise Features (Months 5-6)
- 🚀 Advanced conversation management
- 🚀 Real-time collaboration features
- 🚀 Performance optimization and caching
- 🚀 Analytics dashboard and usage insights

### Migration Benefits:
1. **Fast MVP validation** con Streamlit (weeks vs months)
2. **Smooth evolution** a React enterprise-ready
3. **Shared backend APIs** facilita migration
4. **Progressive enhancement** sin disrupción de usuarios
5. **Component reusability** entre ambas versiones

Este approach permite **validar hipótesis rápidamente** con Streamlit mientras se mantiene un **clear evolution path** hacia una solución enterprise-grade con React.
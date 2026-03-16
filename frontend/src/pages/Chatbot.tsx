import { chatApi, ChatApiResponse } from '@/api/chatApi';
import { profileApi } from '@/api/profileApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { OrderModal } from '@/components/ui/OrderModal';
import { OrderToast } from '@/components/ui/OrderToast';
import { ChatMessage, Profile } from '@/types/dto';
import { Bot, Bug, MessageCircle, Send, Sparkles } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

// Initial messages to demonstrate the chat
// NOTE: Empty array to allow users to start the conversation
// Removed automatic welcome message to improve UX
const initialMessages: ChatMessage[] = [];

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // Order notification state
  const [orderNotification, setOrderNotification] = useState<{
    order: any;
    showToast: boolean;
    showModal: boolean;
  } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await profileApi.getProfile();
        setProfile(profileData);
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    loadProfile();
  }, []);

  // Function to send a message and get a response from the API
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // Call the real chat API
      const validRoles = ['user', 'assistant', 'system', 'function', 'tool'];
      
      // Format messages for the API - ensure all required fields are preserved
      const formattedMessages = [...messages, userMessage].map(msg => {
        // Base message
        const formattedMsg: any = {
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
      });
      
      // Filter out any messages with invalid roles
      const filteredMessages = formattedMessages.filter(msg => validRoles.includes(msg.role));
      
      const response: ChatApiResponse = await chatApi.sendMessage({
        messages: filteredMessages,
      });
      
      // Capture debug information if available (always capture, show only when debug mode is on)
      if (response.debug) {
        const newDebugInfo = {
          userMessage: inputMessage.trim(),
          timestamp: new Date().toISOString(),
          functionCalls: response.debug.functionCalls || [],
          processingTime: response.debug.processingTime,
          model: response.debug.model,
          temperature: response.debug.temperature
        };
        
        setDebugInfo(prev => [newDebugInfo, ...prev].slice(0, 10)); // Keep last 10 debug entries
        
        console.log('🐛 Debug Info Captured:', newDebugInfo);
      }
      
      // Check for order data in the response structure
      if (response.orderData) {
        console.log('🎉 Order detected from backend response!', response.orderData);
        
        // Show order notification
        setOrderNotification({
          order: response.orderData,
          showToast: true,
          showModal: false
        });
        
        // Auto-hide toast after 5 seconds
        setTimeout(() => {
          setOrderNotification(prev => prev ? { ...prev, showToast: false } : null);
        }, 5000);
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message.content || 'Sorry, I could not generate a response.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-shopmefy-50 to-green-50 rounded-xl p-6 border border-shopmefy-100 animate-slide-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-shopmefy-500 to-shopmefy-600 rounded-lg flex items-center justify-center shadow-lg">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Chatbot Playground</h1>
            <p className="text-gray-600">Test your AI-powered product assistant</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Interface - Takes 2/3 of the space on large screens */}
        <div className="lg:col-span-2 animate-scale-in">
          <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300">
            <CardContent className="p-0 flex flex-col h-[70vh]">
              {/* Chat header */}
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                <div className="flex items-center justify-between">
                  {/* Left side - Bot icon and company name */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-shopmefy-500 to-shopmefy-600 flex items-center justify-center text-white font-medium shadow-md">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {profile?.companyName || 'Gusto Italiano'} - Sofia
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <p className="text-xs text-gray-500">Online</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Center - WhatsApp Info */}
                  {profile?.phoneNumber && (
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200 hover:bg-green-100 transition-colors cursor-pointer group">
                      <FaWhatsapp className="w-5 h-5 text-green-600" />
                      <div className="text-center">
                        <div className="text-sm font-medium text-green-800">
                          {profile.phoneNumber}
                        </div>
                        <div className="text-xs text-green-600 group-hover:text-green-700">
                          WhatsApp Business API not implemented yet.
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Right side - Debug and sparkles */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDebugMode(!debugMode)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        debugMode 
                          ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                          : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'
                      }`}
                      title="Toggle debug mode"
                    >
                      <Bug className="w-4 h-4" />
                    </button>
                    <Sparkles className="w-5 h-5 text-shopmefy-500" />
                  </div>
                </div>
              </div>
              
              {/* Debug Panel */}
              {debugMode && (
                <div className="border-b border-gray-100 bg-orange-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Bug className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Debug Mode Active</span>
                  </div>
                  {debugInfo.length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {debugInfo.map((info, index) => (
                        <div key={index} className="text-xs bg-white rounded p-2 border border-orange-200">
                          <div className="font-medium text-orange-800">
                            Query: {info.userMessage.substring(0, 50)}...
                          </div>
                          {info.functionCalls && info.functionCalls.length > 0 && (
                            <div className="text-orange-600 mt-1">
                              <div className="font-medium">Functions called:</div>
                              {info.functionCalls.map((call: any, callIndex: number) => (
                                <div key={callIndex} className="ml-2 mt-1">
                                  <span className="font-medium">{call.name}</span>
                                  {call.arguments && (
                                    <div className="text-gray-600 text-xs">
                                      Args: {JSON.stringify(call.arguments)}
                                    </div>
                                  )}
                                  {call.result && (
                                    <div className="text-green-600 text-xs">
                                      Result: {call.result.total || 0} items found
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          {info.processingTime && (
                            <div className="text-blue-600 mt-1">
                              Processing time: {info.processingTime}ms
                            </div>
                          )}
                          <div className="text-gray-500 text-xs mt-1">
                            {new Date(info.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-orange-600">No function calls recorded yet. Ask Sofia about products, services, or FAQs!</div>
                  )}
                </div>
              )}
              
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {messages.map(message => {
                  // Debug log for each message being rendered
                  console.log(`Rendering message ${message.id}:`, { 
                    content: message.content,
                    imageUrl: message.imageUrl,
                    hasImage: !!message.imageUrl
                  });
                  
                  return (
                    <div 
                      key={message.id} 
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                    >
                      <div className={`${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'} max-w-[80%] shadow-sm`}>
                        {/* Display image if available */}
                        {message.imageUrl && (
                          <div 
                            className="chat-image mb-2"
                            data-status="loading"
                          >
                            <img 
                              src={message.imageUrl} 
                              alt={message.imageCaption || "Image"} 
                              onError={(e) => {
                                console.error("Image failed to load:", e);
                                // Set data attribute on parent for styling
                                const target = e.target as HTMLImageElement;
                                if (target.parentElement) {
                                  target.parentElement.setAttribute('data-status', 'error');
                                }
                                // Set a fallback image
                                target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                              }}
                              onLoad={(e) => {
                                console.log("Image loaded successfully:", message.imageUrl);
                                // Set data attribute on parent for styling
                                const target = e.target as HTMLImageElement;
                                if (target.parentElement) {
                                  target.parentElement.setAttribute('data-status', 'loaded');
                                }
                              }}
                              style={{ maxWidth: '100%', height: 'auto' }}
                            />
                            {message.imageCaption && (
                              <p className="chat-image-caption">{message.imageCaption}</p>
                            )}
                          </div>
                        )}
                        
                        {/* Check for missing content */}
                        {!message.content && (() => { 
                          console.warn(`Message ${message.id} is missing content property`, message);
                          return null;
                        })()}
                        
                        {/* Display text content with proper markdown rendering */}
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown
                            components={{
                              // Custom styling for markdown elements
                              h1: ({ children }) => (
                                <h1 className="text-xl font-bold mt-4 mb-2 text-gray-900">{children}</h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-lg font-semibold mt-3 mb-2 text-gray-900">{children}</h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-base font-semibold mt-3 mb-1 text-gray-900">{children}</h3>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-none space-y-1 my-2">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-inside space-y-1 my-2 ml-2">{children}</ol>
                              ),
                              li: ({ children }) => (
                                <li className="flex items-start">
                                  <span className="mr-2 text-softblue-600 mt-0.5">•</span>
                                  <span className="flex-1">{children}</span>
                                </li>
                              ),
                              p: ({ children }) => (
                                <p className="my-1 leading-relaxed">{children}</p>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-gray-900">{children}</strong>
                              ),
                              em: ({ children }) => (
                                <em className="italic text-gray-700">{children}</em>
                              ),
                              code: ({ children }) => (
                                <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-softblue-300 pl-4 my-2 italic text-gray-700">{children}</blockquote>
                              )
                            }}
                          >
                            {message.content || ''}
                          </ReactMarkdown>
                        </div>
                        <div className="text-xs mt-2 text-right text-gray-700 font-medium">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isLoading && (
                  <div className="flex justify-start animate-slide-up">
                    <div className="chat-bubble-bot shadow-sm">
                      <div className="flex space-x-2 items-center">
                        <Bot className="w-4 h-4 text-shopmefy-600" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full bg-shopmefy-500 animate-bounce" />
                          <div className="w-2 h-2 rounded-full bg-shopmefy-500 animate-bounce [animation-delay:0.2s]" />
                          <div className="w-2 h-2 rounded-full bg-shopmefy-500 animate-bounce [animation-delay:0.4s]" />
                        </div>
                        <span className="text-sm text-gray-500">Sofia is typing...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Chat input */}
              <div className="border-t border-gray-100 p-4 bg-white rounded-b-lg">
                <div className="flex gap-3">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about our Italian products..."
                    className="flex-1 border-gray-200 focus:border-shopmefy-500 focus:ring-shopmefy-500 transition-colors"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={sendMessage} 
                    className="bg-gradient-to-r from-shopmefy-500 to-shopmefy-600 hover:from-shopmefy-600 hover:to-shopmefy-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-4"
                    disabled={!inputMessage.trim() || isLoading}
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Information Panels - Takes 1/3 of the space on large screens */}
        <div className="space-y-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
          {/* About Sofia Panel */}
          <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-shopmefy-100 to-shopmefy-200 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-shopmefy-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">About Sofia</CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    Your AI Italian assistant
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-900">Sofia</strong> is your personal Italian food expert, powered by advanced AI technology.
                </p>
                <p>
                  She can search our product catalog, answer questions about services, and provide detailed information about the trasnportation law.
                </p>
                <div className="mt-4 p-3 bg-shopmefy-50 rounded-lg border border-shopmefy-100">
                  <p className="text-xs text-shopmefy-700 font-medium">
                    ✨ Features: Real-time product search, FAQ assistance, and personalized recommendations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Try Asking Panel */}
          <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-softblue-100 to-softblue-200 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-softblue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Try Asking</CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    Click on any question to start
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  "Where is your warehouse?",
                  "Do you have wine less than 20 Euro?",
                  "How long does shipping take?",
                  "What payment methods do you accept?",
                  "What's stand IMO in international transport law?"
                ].map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputMessage(question);
                      // Auto-send the message
                      setTimeout(() => {
                        const event = new KeyboardEvent('keypress', { key: 'Enter' });
                        document.dispatchEvent(event);
                        sendMessage();
                      }, 100);
                    }}
                    className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-softblue-50 border border-gray-200 hover:border-softblue-300 rounded-lg transition-all duration-200 hover:shadow-sm"
                  >
                    <span className="text-softblue-600 mr-2">💬</span>
                    <span className="text-gray-700">{question}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Functions Panel - REMOVED */}

        </div>
      </div>
      
      {/* Order Notifications */}
      {orderNotification && (
        <>
          <OrderToast
            order={orderNotification.order}
            isVisible={orderNotification.showToast}
            onClose={() => setOrderNotification(prev => prev ? { ...prev, showToast: false } : null)}
          />
          <OrderModal
            order={orderNotification.order}
            isVisible={orderNotification.showModal}
            onClose={() => setOrderNotification(null)}
          />
        </>
      )}
    </div>
  );
};

export default Chatbot;

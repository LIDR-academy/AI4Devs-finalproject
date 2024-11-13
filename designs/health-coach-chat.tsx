import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Send, User } from 'lucide-react';

const HealthCoachChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const suggestedPrompts = [
    "What's my risk for diabetes based on my health records?",
    "How can I improve my sleep quality?",
    "What exercises are best for my condition?",
    "Should I be concerned about my blood pressure?"
  ];

  const handleSendMessage = (text) => {
    const newMessages = [...messages, { type: 'user', text }];
    setMessages(newMessages);
    setInputValue('');
    
    // Simulate AI response
    setTimeout(() => {
      if (text.toLowerCase().includes('diabetes')) {
        setMessages([...newMessages, {
          type: 'ai',
          text: "Based on the health data you've shared, let me analyze your diabetes risk factors:\n\n1. Key Indicators:\n- Blood glucose levels are within normal range\n- Family history noted\n- Healthy BMI range\n\nRecommendations:\n1. Continue regular exercise (150 mins/week)\n2. Maintain a balanced diet rich in fiber\n3. Schedule annual screenings\n4. Monitor blood sugar levels\n\nWould you like more specific dietary guidelines?"
        }]);
      }
    }, 1000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex flex-col h-full p-4 gap-4">
          {/* Welcome Message */}
          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Welcome to Health Coach</h2>
            <p className="text-gray-600">Got questions? Ask our Health Coach for advice. Just type in your question or choose from suggested prompts.</p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'user' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                    {message.type === 'user' ? <User size={16} /> : <MessageCircle size={16} />}
                  </div>
                  <div className={`rounded-lg p-3 ${message.type === 'user' ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}>
                    {message.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Suggested Prompts */}
          {messages.length === 0 && (
            <div className="grid grid-cols-2 gap-2">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(prompt)}
                  className="p-2 text-left text-sm rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="border-t pt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && inputValue.trim() && handleSendMessage(inputValue)}
                placeholder="Type your health question here..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={() => inputValue.trim() && handleSendMessage(inputValue)}
                className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthCoachChat;

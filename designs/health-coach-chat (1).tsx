import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Send, User, Calendar, Clock, ArrowDown } from 'lucide-react';

const HealthCoachChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Historical conversations
  const conversationHistory = {
    "2024-11-03": [
      { type: 'user', text: "What's my risk for diabetes based on my health records?", timestamp: "09:30 AM" },
      { type: 'ai', text: "Based on the health data you've shared, let me analyze your diabetes risk factors:\n\n1. Key Indicators:\n- Blood glucose levels are within normal range\n- Family history noted\n- Healthy BMI range\n\nRecommendations:\n1. Continue regular exercise (150 mins/week)\n2. Maintain a balanced diet rich in fiber\n3. Schedule annual screenings\n4. Monitor blood sugar levels\n\nWould you like more specific dietary guidelines?", timestamp: "09:31 AM" }
    ],
    "2024-11-02": [
      { type: 'user', text: "Can you analyze my sleep patterns?", timestamp: "10:15 PM" },
      { type: 'ai', template: 'sleep-analysis', timestamp: "10:16 PM" }
    ],
    "2024-11-01": [
      { type: 'user', text: "What's my current fitness level?", timestamp: "03:45 PM" },
      { type: 'ai', template: 'fitness-assessment', timestamp: "03:46 PM" }
    ]
  };

  const responseTemplates = {
    'sleep-analysis': {
      type: 'chart',
      title: 'Sleep Pattern Analysis',
      content: {
        summary: "Based on your smart device data from the past week:",
        metrics: [
          { label: 'Average Sleep Duration', value: '7.2 hours' },
          { label: 'Sleep Quality Score', value: '85%' },
          { label: 'Deep Sleep', value: '1.8 hours' }
        ],
        recommendations: [
          "Maintain a consistent sleep schedule",
          "Reduce screen time before bed",
          "Consider room temperature adjustment (optimal: 65-68°F)"
        ]
      }
    },
    'fitness-assessment': {
      type: 'progress',
      title: 'Fitness Assessment',
      content: {
        currentLevel: "Intermediate",
        metrics: [
          { label: 'Cardio Fitness', value: 75, total: 100 },
          { label: 'Strength Training', value: 60, total: 100 },
          { label: 'Flexibility', value: 80, total: 100 }
        ],
        nextGoals: [
          "Increase running distance by 0.5 miles",
          "Add 2 strength training sessions per week",
          "Incorporate yoga for flexibility"
        ]
      }
    }
  };

  useEffect(() => {
    // Load initial messages for current date
    const initialMessages = conversationHistory[formatDate(selectedDate)] || [];
    setMessages(initialMessages);
  }, [selectedDate]);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handleSendMessage = (text) => {
    const newMessage = { type: 'user', text, timestamp: formatTime() };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setInputValue('');
    
    // Simulate AI response
    setTimeout(() => {
      let aiResponse;
      
      if (text.toLowerCase().includes('diabetes')) {
        aiResponse = {
          type: 'ai',
          text: "Based on your health records, here's a comprehensive diabetes risk assessment:\n\n" +
                "Risk Level: Low to Moderate\n\n" +
                "Key Factors:\n" +
                "✓ Blood Glucose: 92 mg/dL (Normal range)\n" +
                "✓ BMI: 24.2 (Healthy range)\n" +
                "⚠ Family History: Present\n\n" +
                "Recommendations:\n" +
                "1. Schedule A1C test\n" +
                "2. Continue Mediterranean diet\n" +
                "3. Maintain 150 mins/week exercise\n" +
                "4. Annual screenings\n\n" +
                "Would you like a detailed prevention plan?",
          timestamp: formatTime()
        };
      } else if (text.toLowerCase().includes('exercise')) {
        aiResponse = {
          type: 'ai',
          template: 'fitness-assessment',
          timestamp: formatTime()
        };
      } else if (text.toLowerCase().includes('sleep')) {
        aiResponse = {
          type: 'ai',
          template: 'sleep-analysis',
          timestamp: formatTime()
        };
      } else {
        aiResponse = {
          type: 'ai',
          text: "I understand your question. Let me help you with that...",
          timestamp: formatTime()
        };
      }
      
      setMessages([...newMessages, aiResponse]);
    }, 1000);
  };

  const renderTemplate = (template, timestamp) => {
    const templateData = responseTemplates[template];
    
    if (templateData.type === 'chart') {
      return (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-3">{templateData.title}</h3>
          <p className="mb-3">{templateData.content.summary}</p>
          <div className="space-y-2">
            {templateData.content.metrics.map((metric, idx) => (
              <div key={idx} className="flex justify-between border-b pb-2">
                <span>{metric.label}</span>
                <span className="font-semibold">{metric.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Recommendations:</h4>
            <ul className="list-disc pl-5">
              {templateData.content.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
    
    if (templateData.type === 'progress') {
      return (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-3">{templateData.title}</h3>
          <p className="mb-3">Current Level: {templateData.content.currentLevel}</p>
          <div className="space-y-4">
            {templateData.content.metrics.map((metric, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-1">
                  <span>{metric.label}</span>
                  <span>{Math.round((metric.value / metric.total) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 rounded-full h-2"
                    style={{ width: `${(metric.value / metric.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Next Goals:</h4>
            <ul className="list-disc pl-5">
              {templateData.content.nextGoals.map((goal, idx) => (
                <li key={idx}>{goal}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
  };

  const suggestedPrompts = [
    "What's my risk for diabetes based on my health records?",
    "How can I improve my sleep quality?",
    "What exercises are best for my condition?",
    "Should I be concerned about my blood pressure?"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex flex-col h-full p-4 gap-4">
          {/* Date Selector */}
          <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-purple-500" />
              <select 
                value={formatDate(selectedDate)}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="border-none bg-transparent focus:outline-none"
              >
                {Object.keys(conversationHistory).map(date => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </option>
                ))}
              </select>
            </div>
            <button className="text-purple-500 hover:text-purple-600">
              <ArrowDown size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'user' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                    {message.type === 'user' ? <User size={16} /> : <MessageCircle size={16} />}
                  </div>
                  <div className="flex flex-col">
                    <div className={`rounded-lg p-3 ${message.type === 'user' ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}>
                      {message.template ? 
                        renderTemplate(message.template, message.timestamp) : 
                        message.text
                      }
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Clock size={12} />
                      {message.timestamp}
                    </div>
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

import { useState } from 'react';

const USER_ROLE = 'user';
const ASSISTANT_ROLE = 'assistant';

export function useChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [assistantResponseCount, setAssistantResponseCount] = useState(0);
  const [threadId, setThreadId] = useState<string | null>(null);

  const handleSend = async () => {
    if (inputValue.trim() === '') return;
    const userMessage = { role: USER_ROLE, content: inputValue };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');

    const response = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: inputValue,
        threadId: threadId || null,
      }),
    });

    const data = await response.json();
    const assistantMessage = { role: ASSISTANT_ROLE, content: data.response.message };

    setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    setAssistantResponseCount((prevCount) => prevCount + 1);

    if (!threadId && data.response.threadId) {
      setThreadId(data.response.threadId);
    }
  };

  return {
    messages,
    inputValue,
    setInputValue,
    handleSend,
    assistantResponseCount,
    threadId
  };
}
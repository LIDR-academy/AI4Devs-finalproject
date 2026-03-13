'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChatBubble } from '@/components/chat/chat-bubble';
import { TypingIndicator } from './typing-indicator';
import type { ConversationMessage } from '@/types/api';
import { createConversationEventSource, getConversationHistory, sendReply } from '@/lib/api';

type ConversationFinalStatus = 'COMPLETED' | 'ESCALATED' | 'TIMEOUT' | null;

const FINAL_STATUS_LABELS: Record<NonNullable<ConversationFinalStatus>, string> = {
  COMPLETED: 'Conversación completada ✓',
  ESCALATED: 'Conversación escalada a soporte',
  TIMEOUT: 'Conversación terminada por tiempo de espera',
};

function FinalStatusMessage({ status }: { status: NonNullable<ConversationFinalStatus> }) {
  return (
    <p className="text-center text-sm text-muted-foreground py-2">
      {FINAL_STATUS_LABELS[status]}
    </p>
  );
}

interface SimulationChatProps {
  conversationId: string;
}

export function SimulationChat({ conversationId }: SimulationChatProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [finalStatus, setFinalStatus] = useState<ConversationFinalStatus>(null);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // SSE subscription FIRST — avoid race condition with history loading
  useEffect(() => {
    const es = createConversationEventSource(conversationId);

    es.onmessage = (event) => {
      const payload = JSON.parse(event.data as string) as {
        event?: string;
        status?: string;
        role?: string;
        content?: string;
        timestamp?: string;
      };

      if (payload.event === 'conversation:complete') {
        setFinalStatus(payload.status as ConversationFinalStatus);
        setIsTyping(false);
        es.close();
        return;
      }

      if (payload.role === 'assistant') {
        const newMsg: ConversationMessage = {
          messageId: crypto.randomUUID(),
          role: 'assistant',
          content: payload.content ?? '',
          timestamp: payload.timestamp ?? new Date().toISOString(),
          expiresAt: 0,
        };
        setMessages((prev) => [...prev, newMsg]);
        setIsTyping(false);
      }
    };

    es.onerror = () => es.close();

    return () => es.close();
  }, [conversationId]);

  // Load history AFTER opening SSE
  useEffect(() => {
    getConversationHistory(conversationId).then((history) => {
      const visible = history.filter((m) => m.role !== 'system');
      setMessages(visible);
      setIsTyping(!visible.some((m) => m.role === 'assistant'));
    });
  }, [conversationId]);

  // Auto-scroll on new messages or typing indicator change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isSending || finalStatus) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsSending(true);
    setIsTyping(true);

    setMessages((prev) => [
      ...prev,
      {
        messageId: crypto.randomUUID(),
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
        expiresAt: 0,
      },
    ]);

    try {
      await sendReply(conversationId, userMessage);
    } finally {
      setIsSending(false);
    }
  }, [inputValue, isSending, finalStatus, conversationId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <>
      {/* Zona B: scrollable messages */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Conversación simulada"
        className="flex-1 overflow-y-auto bg-white px-6 py-4 space-y-4"
      >
        {messages.map((msg) => (
          <ChatBubble key={msg.messageId} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Zona C: fixed input */}
      <div className="shrink-0 border-t bg-background px-4 py-3">
        {finalStatus ? (
          <FinalStatusMessage status={finalStatus} />
        ) : (
          <div className="flex gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping || isSending}
              placeholder="Escribe tu respuesta..."
              rows={1}
              className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal disabled:opacity-50"
            />
            <Button
              onClick={() => void handleSend()}
              disabled={!inputValue.trim() || isTyping || isSending}
              size="sm"
            >
              Enviar
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

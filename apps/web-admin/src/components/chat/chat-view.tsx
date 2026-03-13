'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ChatBubble } from './chat-bubble';
import { ChatExpiryBanner } from './chat-expiry-banner';
import { ConversationTypeBadge, ConversationStatusBadge } from './conversation-badges';
import { formatDate } from '@/lib/utils';
import type { ConversationMessagesResponse } from '@/types/api';

interface ChatViewProps {
  data: ConversationMessagesResponse;
}

export function ChatView({ data }: ChatViewProps) {
  const { conversation, messages } = data;
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' });
  }, []);

  const firstMessageExpiry = messages[0]?.expiresAt;
  const orderNumber = conversation.order.externalOrderNumber;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 bg-brand-black px-6 py-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Link
            href="/orders"
            className="flex items-center gap-1 text-sm text-brand-teal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Pedido {orderNumber ? `#${orderNumber.replace(/^#/, '')}` : ''}
          </Link>
          <div className="flex items-center gap-2 ml-auto">
            <ConversationTypeBadge type={conversation.type} />
            <ConversationStatusBadge status={conversation.status} />
          </div>
        </div>
        <div className="mt-1.5 text-xs text-white/40">
          Iniciada: {formatDate(conversation.startedAt)}
          {conversation.completedAt && (
            <> · Completada: {formatDate(conversation.completedAt)}</>
          )}
          {!conversation.completedAt && <> · En curso</>}
        </div>
      </div>

      {/* Banner TTL — el componente decide internamente si renderizar */}
      <ChatExpiryBanner expiresAtUnix={firstMessageExpiry} />

      {/* Mensajes */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Conversación"
        className="flex-1 overflow-y-auto bg-white px-6 py-4 space-y-4"
      >
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">
            No hay mensajes en esta conversación.
          </p>
        ) : (
          messages.map((message) => (
            <ChatBubble key={message.messageId} message={message} />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

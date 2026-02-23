import { Bot, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ConversationMessage } from '@/types/api';

interface ChatBubbleProps {
  message: ConversationMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const timeLabel = format(new Date(message.timestamp), 'HH:mm');

  if (message.role === 'system') {
    return (
      <div className="flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-gray-200" aria-hidden="true" />
        <p className="text-xs italic text-gray-400 px-2">{message.content}</p>
        <div className="h-px flex-1 bg-gray-200" aria-hidden="true" />
      </div>
    );
  }

  if (message.role === 'assistant') {
    return (
      <div className="flex items-end gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-teal/10">
          <Bot className="h-4 w-4 text-brand-teal" aria-hidden="true" />
        </div>
        <div className="max-w-[70%]">
          <div
            className={cn(
              'rounded-chat rounded-tl-sm border-l-2 border-brand-teal',
              'bg-gray-100 px-4 py-2.5 text-sm text-gray-900',
            )}
          >
            {message.content}
          </div>
          <time
            dateTime={message.timestamp}
            className="mt-1 block text-xs text-gray-400"
          >
            {timeLabel}
          </time>
        </div>
      </div>
    );
  }

  // role === 'user'
  return (
    <div className="flex items-end justify-end gap-2">
      <div className="max-w-[70%]">
        <div
          className={cn(
            'rounded-chat rounded-tr-sm',
            'bg-brand-teal px-4 py-2.5 text-sm text-white',
          )}
        >
          {message.content}
        </div>
        <time
          dateTime={message.timestamp}
          className="mt-1 block text-right text-xs text-white/60"
        >
          {timeLabel}
        </time>
      </div>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
        <User className="h-4 w-4 text-gray-500" aria-hidden="true" />
      </div>
    </div>
  );
}

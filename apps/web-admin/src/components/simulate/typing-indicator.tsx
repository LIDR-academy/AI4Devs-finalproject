import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-teal/10">
        <Bot className="h-4 w-4 text-brand-teal" aria-hidden="true" />
      </div>
      <div className="rounded-chat rounded-tl-sm border-l-2 border-brand-teal bg-gray-100 px-4 py-3">
        <div className="flex items-center gap-1 h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

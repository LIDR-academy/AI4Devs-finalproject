import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import type { Components } from 'react-markdown';

interface MarkdownMessageProps {
  content: string;
  colorScheme: 'light' | 'dark';
}

// Componentes personalizados para estética de burbuja de chat.
// Los headings se redirigen a <p> para evitar tamaños desproporcionados en contexto conversacional.
const chatComponents: Components = {
  p: ({ children }) => (
    <span className="block mb-2 last:mb-0">{children}</span>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic">{children}</em>
  ),
  del: ({ children }) => (
    <del className="line-through opacity-70">{children}</del>
  ),
  code: ({ children }) => (
    <code className="font-mono text-xs bg-black/10 rounded px-1 py-0.5">{children}</code>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-4 space-y-0.5 mb-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-4 space-y-0.5 mb-2">{children}</ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-current pl-2 opacity-60 italic mb-2">
      {children}
    </blockquote>
  ),
  h1: ({ children }) => (
    <p className="font-semibold mb-1">{children}</p>
  ),
  h2: ({ children }) => (
    <p className="font-semibold mb-1">{children}</p>
  ),
  h3: ({ children }) => (
    <p className="font-semibold mb-1">{children}</p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
};

function MarkdownMessageBase({ content }: MarkdownMessageProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={chatComponents}
    >
      {content}
    </ReactMarkdown>
  );
}

export const MarkdownMessage = memo(MarkdownMessageBase);

import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewerProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string;
  className?: string;
}

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function MarkdownViewer({ content, className, ...props }: MarkdownViewerProps) {
  return (
    <div className={cn('prose dark:prose-invert max-w-none', className)} {...props}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>,
          h4: ({ children }) => <h4 className="text-base font-bold mt-3 mb-2">{children}</h4>,
          p: ({ children }) => <p className="my-2">{children}</p>,
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="list-disc pl-6 my-3">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 my-3">{children}</ol>,
          li: ({ children }) => <li className="my-1">{children}</li>,
          code: ({ node, inline, className, children, ...props }: CodeProps) => (
            <code
              className={cn(
                "bg-muted px-1 py-0.5 rounded text-sm font-mono",
                inline ? "inline" : "block p-4 my-3",
                className
              )}
              {...props}
            >
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-muted-foreground/30 pl-4 my-3 italic">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse border border-border">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
          th: ({ children }) => <th className="p-2 text-left font-medium">{children}</th>,
          td: ({ children }) => <td className="p-2 border-r border-border last:border-r-0">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 
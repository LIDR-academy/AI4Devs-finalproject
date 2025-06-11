import { zodResolver } from "@hookform/resolvers/zod";
import { SendHorizontal } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useChatLogic } from "../../hooks/useChatLogic";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { LoadingButton } from "../ui/loading-spinner";
import { MarkdownViewer } from "../ui/markdown-viewer";

const formSchema = z.object({
  message: z.string().min(1).max(1000),
});

interface ChatBotProps {
  className?: string;
}

export default function ChatBot({ className }: ChatBotProps) {
  const {
    messages,
    loading,
    relatedFaqs,
    sendMessage,
    scrollToBottom,
    messagesEndRef,
  } = useChatLogic();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await sendMessage(data.message);
    form.reset();
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex max-w-[80%] ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              } rounded-lg p-3 ${message.isError ? "bg-red-100 text-red-800" : ""}`}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 mr-2" />
              )}
              <div>
                <MarkdownViewer content={message.content} />
                {message.source && (
                  <div className="text-xs text-gray-500 mt-1">
                    Source: {message.source}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Related FAQs */}
      {relatedFaqs.length > 0 && (
        <div className="p-4 border-t">
          <h3 className="text-sm font-medium mb-2">Related Questions:</h3>
          <div className="space-y-2">
            {relatedFaqs.map((faq) => (
              <div
                key={faq.id}
                className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                onClick={() => sendMessage(faq.question)}
              >
                {faq.question}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="p-4 border-t">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-2">
          <Input
            {...form.register("message")}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1"
            autoComplete="off"
          />
          <Button type="submit" disabled={loading || !form.watch("message")?.trim()}>
            {loading ? (
              <LoadingButton size="sm" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
          </Button>
        </form>
        
        {form.formState.errors.message && (
          <p className="text-sm text-red-600 mt-1">
            {form.formState.errors.message.message}
          </p>
        )}
      </div>
    </div>
  );
} 
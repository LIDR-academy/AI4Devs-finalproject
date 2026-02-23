import { getConversationMessages } from '@/lib/api';

export const dynamic = 'force-dynamic';
import { ChatView } from '@/components/chat/chat-view';

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { conversationId } = await params;
  const data = await getConversationMessages(conversationId);

  return (
    <div className="flex h-full flex-col">
      <ChatView data={data} />
    </div>
  );
}

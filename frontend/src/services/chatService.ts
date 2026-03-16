import { apiFetch } from '../utils/api';

export const sendMessage = async (prompt: string, threadId: string | null) => {
  return await apiFetch('/chat', {
    method: 'POST',
    body: JSON.stringify({
      prompt,
      threadId,
    }),
  });
};
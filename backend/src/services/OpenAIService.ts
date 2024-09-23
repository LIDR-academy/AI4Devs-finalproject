import OpenAI from '../config/openai';

export const getOpenAIResponse = async (threadId: string, prompt: string) => {
    try {
        let assistantResponse: string = '';

        if (!threadId) {
            const thread = await OpenAI.beta.threads.create();
            threadId = thread.id;
        }
        
        await OpenAI.beta.threads.messages.create(
            threadId,
            {
                role: "user",
                content: prompt
            }
        );

        const run = await OpenAI.beta.threads.runs.createAndPoll(
            threadId,
            {
                assistant_id: process.env.OPENAI_ASSISTANT_ID || "gpt-4o-mini"
            }
        );

        if (run.status === 'completed') {
            const messages = await OpenAI.beta.threads.messages.list(run.thread_id);
            const lastAssistantMessage = messages.data.find(message => message.role === 'assistant' && message.content[0].type === 'text');

            if (lastAssistantMessage && 'text' in lastAssistantMessage.content[0]) {
                assistantResponse = lastAssistantMessage.content[0].text.value;
            }
        } else {
            console.error(run.status);
        }

        return {
            threadId: threadId,
            response: assistantResponse
        };
    } catch (error) {
        console.error("Error fetching response from OpenAI:", error);
        throw error;
    }
};
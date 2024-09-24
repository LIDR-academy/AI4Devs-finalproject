import OpenAI from '../config/openai';

export const getOpenAIResponse = async (threadId: string, prompt: string) => {
    try {
        let assistantResponse: string = '';
        let title: string = '';
        let properties: any = {};

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
                assistant_id: process.env.OPENAI_ASSISTANT_ID || "gpt-4o-mini",
                temperature: 1,
                max_prompt_tokens: 2048,
                max_completion_tokens: 2048,     
            }
        );

        if (run.status === 'completed') {
            const messages = await OpenAI.beta.threads.messages.list(run.thread_id);
            const lastAssistantMessage = messages.data.reverse().find(message => message.role === 'assistant' && Array.isArray(message.content) && message.content[0].type === 'text');

            console.log('lastAssistantMessage:', lastAssistantMessage);

            if (lastAssistantMessage && 'text' in lastAssistantMessage.content[0]) {
                const rawMessage = lastAssistantMessage.content[0].text.value;
                const jsonMatch = rawMessage.match(/```json\s*([\s\S]*)\s*```/);

                if (jsonMatch && jsonMatch[1]) {
                    try {
                        const parsedContent = JSON.parse(jsonMatch[1]);

                        // Validar y asignar valores
                        title = typeof parsedContent.title === 'string' ? parsedContent.title : 'Título no proporcionado';
                        properties = typeof parsedContent.trip_properties === 'object' && parsedContent.trip_properties !== null ? parsedContent.trip_properties : {};
                        assistantResponse = typeof parsedContent.user_response === 'string' ? parsedContent.user_response : 'Respuesta del asistente no proporcionada.';
                    } catch (err) {
                        console.error("Error parsing JSON from assistant response:", err);
                        // Asignar valores por defecto o mensajes de error
                        title = 'Error al procesar el título';
                        properties = {};
                        assistantResponse = 'Hubo un error al procesar la respuesta del asistente. Por favor, intenta de nuevo.';
                    }
                } else {
                    // Si no se encuentra el bloque JSON, asignar valores por defecto o manejar el caso
                    console.warn("No se encontró un bloque JSON en la respuesta del asistente.");
                    title = 'Título no proporcionado';
                    properties = {};
                    assistantResponse = rawMessage || 'El asistente no proporcionó una respuesta válida.';
                }
            }
        } else {
            console.error(`Run status: ${run.status}`);
        }

        return {
            threadId: threadId,
            message: assistantResponse,
            title: title,
            properties: properties
        };
    } catch (error) {
        console.error("Error fetching response from OpenAI:", error);
        throw error;
    }
};
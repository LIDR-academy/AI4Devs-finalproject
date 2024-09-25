import OpenAI from '../config/openai';

export const getOpenAIResponse = async (threadId: string, prompt: string) => {
    try {
        let assistantResponse: string = '';
        let title: string = '';
        let properties: any = {};
        let itinerary: string = '';
        let returned_itinerary: boolean = false;

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
            const lastAssistantMessage = messages.data.find(message => message.role === 'assistant' && Array.isArray(message.content) && message.content[0].type === 'text');

 
            if (lastAssistantMessage && 'text' in lastAssistantMessage.content[0]) {
                const rawMessage = lastAssistantMessage.content[0].text.value;

                console.log('>>> rawMessage:', rawMessage);

                const jsonMatch = rawMessage.match(/```json\s*([\s\S]*)\s*```/);

                if (jsonMatch && jsonMatch[1]) {
                    try {
                        const cleanedJsonString = jsonMatch[1].replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
                        const parsedContent = JSON.parse(cleanedJsonString);

                        title = typeof parsedContent.title === 'string' && parsedContent.title;
                        properties = typeof parsedContent.trip_properties === 'object' && parsedContent.trip_properties !== null ? parsedContent.trip_properties : {};
                        assistantResponse = typeof parsedContent.user_response === 'string' && parsedContent.user_response;
                        returned_itinerary = typeof parsedContent.returned_itinerary === 'string' && (parsedContent.returned_itinerary === "true" ? true : false);
                        itinerary = typeof parsedContent.itinerary === 'string' && parsedContent.itinerary;

                    } catch (err) {
                        console.error("Error parsing JSON from assistant response:", err);
                        assistantResponse = 'Hubo un error al procesar la respuesta del asistente. Por favor, intenta de nuevo.';
                    }
                } else {
                    console.warn("No se encontró un bloque JSON en la respuesta del asistente.");
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
            properties: properties,
            returned_itinerary: returned_itinerary,
            itinerary: itinerary
        };
    } catch (error) {
        console.error("Error fetching response from OpenAI:", error);
        throw error;
    }
};
import { api } from './api';
import { AIResponse } from '../types/ai';

export const aiService = {
  /**
   * Procesa la respuesta de la IA y extrae el texto relevante
   */
  processResponse: (response: AIResponse): string => {
    // Obtener el primer output que tenga contenido
    const output = response.output.find(out => out.content && out.content.length > 0);
    
    if (!output) {
      return '';
    }

    // Obtener el texto del primer contenido
    const content = output.content.find(cont => cont.type === 'output_text');
    
    return content ? content.text : '';
  },

  /**
   * Realiza una búsqueda semántica usando la IA
   */
  searchSemantic: async (query: string): Promise<string> => {
    try {
      const response = await api.post<AIResponse>('/search/semantic', { query });
      return aiService.processResponse(response.data);
    } catch (error) {
      console.error('Error en búsqueda semántica:', error);
      throw error;
    }
  }
}; 
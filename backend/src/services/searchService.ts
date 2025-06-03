import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const searchService = {
  // Búsqueda por ingredientes
  searchByIngredients: async (ingredients: string[]) => {
    try {
      const recipes = await prisma.recipe.findMany({
        where: {
          OR: ingredients.map(ingredient => ({
            ingredients: {
              path: '$',
              array_contains: [ingredient],
            },
          })),
        },
      });
      return recipes;
    } catch (error) {
      console.error('Error en búsqueda por ingredientes:', error);
      throw error;
    }
  },

  // Búsqueda semántica
  semanticSearch: async (query: string) => {
    try {
      // Realizar la consulta a GPT-4.1
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content: `Eres un asistente experto en recetas. Tu tarea es buscar recetas que coincidan con la descripción del usuario.
            
            Reglas importantes:
            1. Debes responder SOLO con un array JSON de recetas
            2. Cada receta debe tener la siguiente estructura:
               {
                 "id": "string (UUID)",
                 "title": "string (nombre de la receta)",
                 "description": "string (descripción breve)",
                 "ingredients": ["string"] (lista de ingredientes),
                 "instructions": ["string"] (pasos de preparación),
                 "cookingTime": number (tiempo en minutos),
                 "difficulty": "facil" | "medio" | "dificil"
               }
            3. Genera entre 3 y 5 recetas relevantes
            4. Asegúrate que las recetas sean realistas y factibles
            5. Los tiempos de cocción deben ser razonables
            6. Las dificultades deben ser apropiadas para la receta`
          },
          {
            role: "user",
            content: `Busca recetas que coincidan con: ${query}. Responde SOLO con el array JSON de recetas, sin texto adicional.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7, // Añadimos un poco de creatividad pero manteniendo coherencia
        max_tokens: 2000 // Aseguramos que tenga espacio suficiente para las recetas
      });

      // Extraer y parsear la respuesta
      const responseContent = completion.choices[0].message.content;
      if (!responseContent) {
        throw new Error('La IA no generó una respuesta válida');
      }

      const recipes = JSON.parse(responseContent);

      // Si la respuesta es un array de recetas, lo devolvemos
      if (Array.isArray(recipes)) {
        return recipes;
      }

      // Si la respuesta es un objeto con una propiedad 'recipes', devolvemos ese array
      if (recipes.recipes && Array.isArray(recipes.recipes)) {
        return recipes.recipes;
      }

      // Si no encontramos un formato válido, lanzamos un error
      throw new Error('Formato de respuesta inválido de la IA');

    } catch (error) {
      console.error('Error en búsqueda semántica:', error);
      throw error;
    }
  },

  // Búsqueda con filtros
  searchWithFilters: async (filters: {
    ingredients?: string[];
    dietary?: string[];
    cookingTime?: number;
    difficulty?: string;
  }) => {
    try {
      const where: any = {};

      if (filters.ingredients?.length) {
        where.OR = filters.ingredients.map(ingredient => ({
          ingredients: {
            path: '$',
            array_contains: [ingredient],
          },
        }));
      }

      if (filters.cookingTime) {
        where.cookingTime = {
          lte: filters.cookingTime,
        };
      }

      if (filters.difficulty) {
        where.difficulty = filters.difficulty;
      }

      const recipes = await prisma.recipe.findMany({
        where,
      });

      return recipes;
    } catch (error) {
      console.error('Error en búsqueda con filtros:', error);
      throw error;
    }
  },

  searchByFilters: async (filters: {
    cookingTime?: number;
    difficulty?: string;
    dietaryRestrictions?: {
      vegetarian?: boolean;
      vegan?: boolean;
      glutenFree?: boolean;
      dairyFree?: boolean;
      nutFree?: boolean;
    };
  }) => {
    try {
      const where: any = {};

      if (filters.cookingTime) {
        where.cookingTime = {
          lte: filters.cookingTime
        };
      }

      if (filters.difficulty) {
        where.difficulty = filters.difficulty;
      }

      if (filters.dietaryRestrictions) {
        const { dietaryRestrictions } = filters;
        where.dietaryRestrictions = {};

        if (dietaryRestrictions.vegetarian) {
          where.dietaryRestrictions.vegetarian = true;
        }
        if (dietaryRestrictions.vegan) {
          where.dietaryRestrictions.vegan = true;
        }
        if (dietaryRestrictions.glutenFree) {
          where.dietaryRestrictions.glutenFree = true;
        }
        if (dietaryRestrictions.dairyFree) {
          where.dietaryRestrictions.dairyFree = true;
        }
        if (dietaryRestrictions.nutFree) {
          where.dietaryRestrictions.nutFree = true;
        }
      }

      const recipes = await prisma.recipe.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        }
      });

      return {
        success: true,
        data: recipes,
        message: 'Búsqueda por filtros realizada con éxito'
      };
    } catch (error) {
      console.error('Error en la búsqueda por filtros:', error);
      return {
        success: false,
        data: [],
        message: 'Error al realizar la búsqueda por filtros',
        error
      };
    }
  },
}; 
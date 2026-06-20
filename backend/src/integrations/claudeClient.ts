import Anthropic from '@anthropic-ai/sdk';
import { DefinitionLanguage } from '../types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateDefinition(
  term: string,
  language: DefinitionLanguage
): Promise<string> {
  const langInstruction =
    language === 'es'
      ? 'Responde SOLO con la definición en español. No incluyas el término en la definición.'
      : 'Respond ONLY with the definition in English. Do not include the term in the definition.';

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: `Define the English word or phrase "${term}" clearly and concisely in 1-2 sentences. ${langInstruction}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }
  return content.text.trim();
}

export async function generateMCQ(
  term: string,
  definition: string,
  distractors: string[]
): Promise<{ question: string; options: string[]; correctAnswer: string }> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `Create a multiple choice question in English to test knowledge of the word "${term}" (definition: "${definition}").
The correct answer must be "${term}".
The wrong options must be from this list: ${distractors.join(', ')}.
Use exactly 3 wrong options.

Respond ONLY with valid JSON in this exact format:
{
  "question": "...",
  "options": ["option1", "option2", "option3", "option4"],
  "correctAnswer": "${term}"
}
The correct answer must appear randomly among the 4 options (not always first).`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    return JSON.parse(jsonMatch[0]) as {
      question: string;
      options: string[];
      correctAnswer: string;
    };
  } catch {
    throw new Error('Failed to parse MCQ response from Claude');
  }
}

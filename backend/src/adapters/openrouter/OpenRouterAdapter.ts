/**
 * OpenRouterAdapter — LLM system prompt for listing analysis (T033, FR-002, FR-013, FR-025).
 */
import fetch from 'node-fetch';
import { z } from 'zod';
import { env } from '../../infrastructure/config/env';
import { REALISTA_USER_AGENT } from '../../infrastructure/utils/urlValidator';
import { TransparencyScore, type ScoreBreakdownItem } from '../../domain/value-objects/TransparencyScore';
import { RedFlags, RED_FLAG_TYPES, type RedFlagItem } from '../../domain/value-objects/RedFlags';
import { LlmMalformedResponseError } from '../../domain/errors/DomainError';
import type { ListingAnalyzerPort, LLMAnalysisResult } from '../../domain/ports/ListingAnalyzerPort';

const LLMResponseSchema = z.object({
  transparencyScore: z.number().int().min(0).max(100),
  scoreLabel: z.enum(['baja', 'media', 'alta', 'excelente']),
  redFlags: z.array(
    z.object({
      flag: z.enum(RED_FLAG_TYPES),
      severity: z.enum(['low', 'medium', 'high']),
      reasoning: z.string().min(10),
    }),
  ),
  omissions: z.array(z.string()),
  manipulativePhrases: z.array(z.string()).optional(),
  positiveSignals: z.array(z.string()),
  summary: z.string(),
});

const SYSTEM_PROMPT = `Eres un analista de anuncios inmobiliarios para Realista, una herramienta educativa para compradores primerizos en España. Tu trabajo es leer un anuncio en español y detectar problemas de transparencia — no tomar decisiones de compra.

Devuelve SOLO un JSON con esta forma exacta:
{
  "transparencyScore": <entero 0-100>,
  "scoreLabel": "<baja|media|alta|excelente>",
  "redFlags": [
    { "flag": "<uno de: euphemistic_language, vague_location, missing_energy_certificate, inflated_square_meters, no_floor_plan, suspicious_price, stale_listing, missing_community_costs, hidden_fees_mentioned, photos_mismatch, missing_year_built, missing_orientation>", "severity": "<low|medium|high>", "reasoning": "<cita la frase exacta del anuncio que disparó el flag, seguida de tu inferencia>" }
  ],
  "omissions": ["<aspectos no mencionados que un comprador debería saber>"],
  "manipulativePhrases": ["<citas directas de frases que suavizan un problema o crean urgencia falsa>"],
  "positiveSignals": ["<aspectos inusualmente transparentes>"],
  "summary": "<resumen de 2-3 frases en español, tono neutral, sin consejo>"
}

Reglas:
1. Cita el anuncio. Para cada flag, copia la frase exacta.
2. Texto para el usuario en español.
3. Sin consejo financiero.
4. Sin juicio moral sobre el vendedor.
5. Sin detalles inventados.
6. JSON estricto. Sin markdown ni texto adicional.`;

export class OpenRouterAdapter implements ListingAnalyzerPort {
  private readonly endpoint = 'https://openrouter.ai/api/v1/chat/completions';
  private readonly maxRetries = 2;

  async analyze(text: string, url: string): Promise<LLMAnalysisResult> {
    if (env.NODE_ENV === 'test' || process.env.MOCK_OPENROUTER === 'true') {
      return this.cannedResponse(text);
    }

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const raw = await this.callOpenRouter(text, url);
        const parsed = LLMResponseSchema.parse(JSON.parse(raw));
        return this.toResult(parsed);
      } catch (err) {
        lastError = err as Error;
      }
    }
    throw new LlmMalformedResponseError(lastError ?? undefined);
  }

  private async callOpenRouter(text: string, url: string): Promise<string> {
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': env.FRONTEND_URL,
        'X-Title': 'Realista',
        'User-Agent': REALISTA_USER_AGENT,
      },
      body: JSON.stringify({
        model: env.OPENROUTER_MODEL,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `URL: ${url}\n\n${text}` },
        ],
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
    }

    const json = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    return json.choices[0].message.content;
  }

  private toResult(parsed: z.infer<typeof LLMResponseSchema>): LLMAnalysisResult {
    const breakdown: ScoreBreakdownItem[] = parsed.redFlags.map((f) => ({
      category: f.flag,
      score: f.severity === 'high' ? 0 : f.severity === 'medium' ? 50 : 80,
      weight: 1,
    }));
    return {
      transparencyScore: TransparencyScore.create(parsed.transparencyScore, breakdown),
      redFlags: RedFlags.create(parsed.redFlags as RedFlagItem[]),
      omissions: parsed.omissions,
      positiveSignals: parsed.positiveSignals,
      summary: parsed.summary,
    };
  }

  private cannedResponse(text: string): LLMAnalysisResult {
    const hasEufemismo = /acogedor|cálido|con encanto/i.test(text);
    const hasEnergy = /certificado energ[ée]tico/i.test(text);
    return {
      transparencyScore: TransparencyScore.create(hasEufemismo ? 60 : 90, []),
      redFlags: RedFlags.create(
        [
          ...(hasEufemismo
            ? [
                {
                  flag: 'euphemistic_language' as const,
                  severity: 'medium' as const,
                  reasoning: 'El anuncio usa "acogedor" sin describir el espacio.',
                },
              ]
            : []),
          ...(!hasEnergy
            ? [
                {
                  flag: 'missing_energy_certificate' as const,
                  severity: 'medium' as const,
                  reasoning: 'OMITIDO: certificado energético no mencionado.',
                },
              ]
            : []),
        ],
      ),
      omissions: hasEnergy ? [] : ['Certificado energético no mencionado'],
      positiveSignals: [],
      summary: 'Anuncio de prueba generado por mock.',
    };
  }
}

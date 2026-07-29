/**
 * NegotiationPointsService (FR-026, US4).
 * Generates 5-8 questions for the real-estate agent based on red flags.
 * Uses hardcoded templates, NOT LLM.
 */
import type { RedFlagItem, RedFlagType } from '../value-objects/RedFlags';

interface NegotiationInput {
  url: string;
  declaredAddress?: string | null;
  transparencyScore: number;
  redFlags: RedFlagItem[];
  createdAt: Date;
}

interface NegotiationPoint {
  category: RedFlagType | 'general';
  question: string;
  rationale: string;
}

const POINTS_BY_FLAG: Record<RedFlagType, string[]> = {
  euphemistic_language: [
    'El anuncio usa lenguaje vago para describir el espacio — ¿cuáles son los metros útiles reales de cada estancia?',
  ],
  vague_location: [
    'La dirección del anuncio no es específica — ¿puedes confirmar la calle exacta y el número?',
  ],
  missing_energy_certificate: [
    'El certificado energético no aparece — ¿lo tienen disponible? Si es clase E o F, la hipoteca podría no ser favorable.',
  ],
  inflated_square_meters: [
    'Los metros declarados parecen no coincidir con catastro — ¿la diferencia es de zonas comunes o del cálculo de la vivienda?',
  ],
  no_floor_plan: [
    'No hay plano publicado — ¿puedes compartir uno? Es esencial para evaluar la distribución.',
  ],
  suspicious_price: [
    'El precio parece inusualmente bajo para la zona — ¿hay algo que justifique esta diferencia?',
  ],
  stale_listing: [
    'El anuncio lleva tiempo sin actualizarse — ¿sigue disponible? ¿Ha cambiado el precio?',
  ],
  missing_community_costs: [
    '¿Cuáles son los gastos de comunidad mensuales? ¿Está al corriente de pago?',
  ],
  hidden_fees_mentioned: [
    'Has mencionado gastos adicionales — ¿puedes desglosarlos? ¿Hay derramas previstas?',
  ],
  photos_mismatch: [
    'Las fotos no parecen corresponder al anuncio — ¿puedes confirmar que son del inmueble real?',
  ],
  missing_year_built: [
    '¿En qué año se construyó el edificio? ¿Ha habido rehabilitaciones recientes?',
  ],
  missing_orientation: [
    '¿Cuál es la orientación del salón y los dormitorios principales?',
  ],
};

const GENERAL_POINTS = [
  'Pide la cédula de habitabilidad vigente.',
  'Solicita la última factura del IBI para verificar que está al corriente de pago.',
  'Pide el último recibo de la comunidad de propietarios.',
  'Pregunta por la cuota del préstamo comunitario (si aplica).',
];

export function generateNegotiationPoints(input: NegotiationInput): NegotiationPoint[] {
  const points: NegotiationPoint[] = [];
  const seenCategories = new Set<RedFlagType>();

  for (const flag of input.redFlags) {
    const templates = POINTS_BY_FLAG[flag.flag];
    if (!templates) continue;
    for (const q of templates) {
      points.push({ category: flag.flag, question: q, rationale: flag.reasoning });
    }
    seenCategories.add(flag.flag);
  }

  if (input.transparencyScore >= 80 && points.length < 3) {
    const toAdd = 5 - points.length;
    for (let i = 0; i < toAdd && i < GENERAL_POINTS.length; i++) {
      points.push({
        category: 'general',
        question: GENERAL_POINTS[i],
        rationale: 'El anuncio es transparente, pero estas verificaciones estándar son recomendables.',
      });
    }
  }

  const ageMs = Date.now() - input.createdAt.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays > 180 && !seenCategories.has('stale_listing')) {
    points.push({
      category: 'stale_listing',
      question: 'He visto que el anuncio lleva tiempo publicado — ¿sigue disponible?',
      rationale: 'El anuncio lleva más de 6 meses sin actualizarse.',
    });
  }

  if (points.length < 5) {
    const needed = 5 - points.length;
    for (let i = 0; i < needed && i < GENERAL_POINTS.length; i++) {
      points.push({
        category: 'general',
        question: GENERAL_POINTS[i],
        rationale: 'Verificación estándar recomendada.',
      });
    }
  }

  return points.slice(0, 8);
}

/**
 * TimelineService (US5).
 * Hardcoded milestones for the home-buying timeline.
 */
import { BureaucraticMilestone, type BureaucraticStage } from '../value-objects/BureaucraticMilestone';

const MILESTONES: Array<{
  stage: BureaucraticStage;
  title: string;
  description: string;
  estimatedDays: number;
  documentsNeeded: string[];
}> = [
  {
    stage: 'PRE_ARRAS',
    title: 'Búsqueda y pre-selección',
    description: 'Análisis de anuncios, visitas, evaluación de opciones. Verifica certificado energético, nota simple, IBI, cédula de habitabilidad.',
    estimatedDays: 30,
    documentsNeeded: ['DNI', 'Certificado de ingresos', 'Vida laboral'],
  },
  {
    stage: 'ARRAS',
    title: 'Firma de arras',
    description: 'Acuerdo de reserva con señal económica (5-10% del precio).',
    estimatedDays: 1,
    documentsNeeded: ['DNI', 'Contrato de arras firmado'],
  },
  {
    stage: 'DUE_DILIGENCE',
    title: 'Due diligence',
    description: 'Tasación, solicitud de hipoteca, inspección técnica, verificación catastro.',
    estimatedDays: 30,
    documentsNeeded: ['Tasación', 'Oferta vinculante del banco', 'Inspección técnica'],
  },
  {
    stage: 'PRE_ESCRITURA',
    title: 'Preparación de la escritura',
    description: 'Contrato de préstamo firmado, liquidación ITP/IVA, preparación de fondos.',
    estimatedDays: 7,
    documentsNeeded: ['Contrato hipotecario', 'Justificante de liquidación ITP/IVA'],
  },
  {
    stage: 'ESCRITURA',
    title: 'Firma ante notario',
    description: 'Firma de la escritura de compraventa y del préstamo hipotecario.',
    estimatedDays: 1,
    documentsNeeded: ['Escritura de compraventa', 'Escritura de hipoteca'],
  },
  {
    stage: 'POST_ESCRITURA',
    title: 'Post-escritura',
    description: 'Inscripción en Registro, cambio de titular en catastro, alta de suministros.',
    estimatedDays: 30,
    documentsNeeded: ['Nota simple registral', 'Cambio de titular en catastro', 'Contratos de suministros'],
  },
];

export function getTimeline(): BureaucraticMilestone[] {
  return MILESTONES.map((m) => BureaucraticMilestone.create(m));
}

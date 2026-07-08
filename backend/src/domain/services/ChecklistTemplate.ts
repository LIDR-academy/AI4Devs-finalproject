/**
 * ChecklistTemplate — hardcoded seed data for the per-process Checklist.
 *
 * Lives in domain because it's pure data (no Prisma, no IO) and is
 * referenced by both the ChecklistRepository (infrastructure) and the
 * checklist routes (api). Keeping it in domain prevents the api layer
 * from importing infrastructure/prisma/seed.ts.
 *
 * 21 items across 6 bureaucratic stages (FR-024).
 */

import type { BureaucraticStage } from '../value-objects/BureaucraticMilestone';

export interface ChecklistTemplateItem {
  stage: BureaucraticStage;
  title: string;
  description: string;
  documentsNeeded: string[];
  estimatedDays: number;
  sortOrder: number;
}

export const CHECKLIST_TEMPLATE: readonly ChecklistTemplateItem[] = [
  {
    stage: 'PRE_ARRAS',
    title: 'Verificar certificado energético',
    description: 'Solicitar al vendedor la etiqueta del certificado energético del inmueble.',
    documentsNeeded: ['Etiqueta CEE'],
    estimatedDays: 1,
    sortOrder: 1,
  },
  {
    stage: 'PRE_ARRAS',
    title: 'Solicitar nota simple al Registro de la Propiedad',
    description: 'Verificar titular, cargas y afección del inmueble.',
    documentsNeeded: ['Nota simple registral'],
    estimatedDays: 5,
    sortOrder: 2,
  },
  {
    stage: 'PRE_ARRAS',
    title: 'Consultar deuda IBI pendiente',
    description: 'Comprobar si el inmueble tiene recibos de IBI impagados.',
    documentsNeeded: ['Último recibo IBI'],
    estimatedDays: 1,
    sortOrder: 3,
  },
  {
    stage: 'PRE_ARRAS',
    title: 'Verificar cédula de habitabilidad',
    description: 'Confirmar que el inmueble tiene la cédula en vigor (depende de la comunidad autónoma).',
    documentsNeeded: ['Cédula de habitabilidad'],
    estimatedDays: 1,
    sortOrder: 4,
  },
  {
    stage: 'PRE_ARRAS',
    title: 'Revisar gastos de comunidad',
    description: 'Pedir al vendedor los últimos recibos y confirmar que está al corriente.',
    documentsNeeded: ['Recibos comunidad'],
    estimatedDays: 1,
    sortOrder: 5,
  },
  {
    stage: 'ARRAS',
    title: 'Firmar contrato de arras',
    description: 'Acuerdo privado entre comprador y vendedor con señal económica.',
    documentsNeeded: ['DNI', 'Contrato de arras'],
    estimatedDays: 1,
    sortOrder: 1,
  },
  {
    stage: 'ARRAS',
    title: 'Realizar pago de la señal',
    description: 'Transferencia o cheque bancario por el importe acordado (normalmente 5-10% del precio).',
    documentsNeeded: ['Justificante de pago'],
    estimatedDays: 0,
    sortOrder: 2,
  },
  {
    stage: 'ARRAS',
    title: 'Registrar arras ante notaría',
    description: 'Algunas comunidades autónomas exigen registrar el contrato de arras.',
    documentsNeeded: ['Copia compulsada en notaría'],
    estimatedDays: 2,
    sortOrder: 3,
  },
  {
    stage: 'DUE_DILIGENCE',
    title: 'Tasación oficial del inmueble',
    description: 'Tasación homologada por una sociedad de tasación inscrita en el Banco de España.',
    documentsNeeded: ['Informe de tasación'],
    estimatedDays: 7,
    sortOrder: 1,
  },
  {
    stage: 'DUE_DILIGENCE',
    title: 'Solicitud de hipoteca (si aplica)',
    description: 'Presentar la documentación al banco y obtener la oferta vinculante.',
    documentsNeeded: ['FEIN', 'Oferta vinculante'],
    estimatedDays: 15,
    sortOrder: 2,
  },
  {
    stage: 'DUE_DILIGENCE',
    title: 'Verificación catastro vs realidad',
    description: 'Comprobar que los metros del catastro coinciden con la realidad del inmueble.',
    documentsNeeded: ['Consulta catastro'],
    estimatedDays: 2,
    sortOrder: 3,
  },
  {
    stage: 'DUE_DILIGENCE',
    title: 'Inspección técnica del inmueble',
    description: 'Visita técnica para detectar vicios ocultos, humedades, instalaciones.',
    documentsNeeded: ['Informe técnico'],
    estimatedDays: 3,
    sortOrder: 4,
  },
  {
    stage: 'PRE_ESCRITURA',
    title: 'Contrato de préstamo hipotecario firmado',
    description: 'Firma del contrato de préstamo en el banco ante notario.',
    documentsNeeded: ['Contrato hipotecario firmado'],
    estimatedDays: 3,
    sortOrder: 1,
  },
  {
    stage: 'PRE_ESCRITURA',
    title: 'Liquidación ITP o IVA',
    description: 'Autoliquidación del impuesto (ITP en segunda mano, IVA en obra nueva).',
    documentsNeeded: ['Modelo 600 / 620'],
    estimatedDays: 1,
    sortOrder: 2,
  },
  {
    stage: 'PRE_ESCRITURA',
    title: 'Cheque bancario o transferencia preparada',
    description: 'Disponer del importe restante (precio + gastos) para la firma.',
    documentsNeeded: ['Cheque bancario'],
    estimatedDays: 1,
    sortOrder: 3,
  },
  {
    stage: 'ESCRITURA',
    title: 'Firma ante notario',
    description: 'Firma de la escritura de compraventa y, en su caso, del préstamo hipotecario.',
    documentsNeeded: ['DNI', 'Escritura firmada'],
    estimatedDays: 1,
    sortOrder: 1,
  },
  {
    stage: 'ESCRITURA',
    title: 'Liquidación final en notaría',
    description: 'Pago del precio más gastos al vendedor y a la notaría.',
    documentsNeeded: ['Justificantes de pago'],
    estimatedDays: 0,
    sortOrder: 2,
  },
  {
    stage: 'POST_ESCRITURA',
    title: 'Inscripción en Registro de la Propiedad',
    description: 'El notario envía la copia electrónica al Registro para su inscripción.',
    documentsNeeded: ['Nota simple registral actualizada'],
    estimatedDays: 15,
    sortOrder: 1,
  },
  {
    stage: 'POST_ESCRITURA',
    title: 'Cambio de titularidad en catastro',
    description: 'Comunicar la transmisión a la Dirección General del Catastro.',
    documentsNeeded: ['Declaración catastral'],
    estimatedDays: 7,
    sortOrder: 2,
  },
  {
    stage: 'POST_ESCRITURA',
    title: 'Cambio de titular suministros',
    description: 'Luz, agua, gas, comunidad de propietarios.',
    documentsNeeded: ['Contratos de suministro'],
    estimatedDays: 5,
    sortOrder: 3,
  },
  {
    stage: 'POST_ESCRITURA',
    title: 'Alta en IBI a tu nombre',
    description: 'El Ayuntamiento actualiza el titular del recibo del IBI.',
    documentsNeeded: ['Recibo IBI actualizado'],
    estimatedDays: 7,
    sortOrder: 4,
  },
];

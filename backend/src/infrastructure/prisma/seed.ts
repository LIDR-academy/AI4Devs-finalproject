/**
 * Seed default data: checklist template, narrative template keys, portal health initial state.
 * Run: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CHECKLIST_TEMPLATE = [
  {
    stage: 'PRE_ARRAS',
    items: [
      { title: 'Verificar certificado energético', sortOrder: 1, estimatedDays: 1 },
      { title: 'Solicitar nota simple al Registro de la Propiedad', sortOrder: 2, estimatedDays: 5 },
      { title: 'Consultar deuda IBI pendiente', sortOrder: 3, estimatedDays: 1 },
      { title: 'Verificar cédula de habitabilidad', sortOrder: 4, estimatedDays: 1 },
      { title: 'Revisar gastos de comunidad', sortOrder: 5, estimatedDays: 1 },
    ],
  },
  {
    stage: 'ARRAS',
    items: [
      { title: 'Firmar contrato de arras', sortOrder: 1, estimatedDays: 1 },
      { title: 'Realizar pago de la señal', sortOrder: 2, estimatedDays: 0 },
      { title: 'Registrar arras ante notaría', sortOrder: 3, estimatedDays: 2 },
    ],
  },
  {
    stage: 'DUE_DILIGENCE',
    items: [
      { title: 'Tasación oficial del inmueble', sortOrder: 1, estimatedDays: 7 },
      { title: 'Solicitud de hipoteca (si aplica)', sortOrder: 2, estimatedDays: 15 },
      { title: 'Verificación catastro vs realidad', sortOrder: 3, estimatedDays: 2 },
      { title: 'Inspección técnica del inmueble', sortOrder: 4, estimatedDays: 3 },
    ],
  },
  {
    stage: 'PRE_ESCRITURA',
    items: [
      { title: 'Contrato de préstamo hipotecario firmado', sortOrder: 1, estimatedDays: 3 },
      { title: 'Liquidación ITP o IVA', sortOrder: 2, estimatedDays: 1 },
      { title: 'Cheque bancario o transferencia preparada', sortOrder: 3, estimatedDays: 1 },
    ],
  },
  {
    stage: 'ESCRITURA',
    items: [
      { title: 'Firma ante notario', sortOrder: 1, estimatedDays: 1 },
      { title: 'Liquidación final en notaría', sortOrder: 2, estimatedDays: 0 },
    ],
  },
  {
    stage: 'POST_ESCRITURA',
    items: [
      { title: 'Inscripción en Registro de la Propiedad', sortOrder: 1, estimatedDays: 15 },
      { title: 'Cambio de titularidad en catastro', sortOrder: 2, estimatedDays: 7 },
      { title: 'Cambio de titular suministros (luz, agua, gas)', sortOrder: 3, estimatedDays: 5 },
      { title: 'Alta en IBI a tu nombre', sortOrder: 4, estimatedDays: 7 },
    ],
  },
];

const INITIAL_PORTALS = [
  'idealista.com',
  'fotocasa.es',
  'habitaclia.com',
  'pisos.com',
  'milanuncios.com',
];

async function main(): Promise<void> {
  console.log('Seeding default data...');

  for (const domain of INITIAL_PORTALS) {
    await prisma.portalHealthCheck.upsert({
      where: { domain },
      update: {},
      create: { domain, status: 'UNKNOWN' },
    });
  }
  console.log(`  ✓ ${INITIAL_PORTALS.length} portal health entries`);

  console.log('Done. Checklist items are created per-process at runtime (T082).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { CHECKLIST_TEMPLATE };

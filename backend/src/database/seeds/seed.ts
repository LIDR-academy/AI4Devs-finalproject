/**
 * Seed de datos de prueba para desarrollo.
 * Ejecutar desde backend/: npm run seed
 * Reseed (borrar y volver a insertar): npm run seed -- --force
 *
 * Requisitos:
 * - .env con variables de BD (POSTGRES_* o DATABASE_*).
 * - Migraciones ejecutadas antes que el seed: npm run migration:run
 *   (crea tablas documentations, notifications, postop_evolutions, etc.).
 */
import { DataSource } from 'typeorm';
import { join } from 'path';
import { Patient } from '../../modules/hce/entities/patient.entity';
import { OperatingRoom } from '../../modules/planning/entities/operating-room.entity';
import {
  Surgery,
  SurgeryStatus,
  SurgeryType,
} from '../../modules/planning/entities/surgery.entity';
import { PostopEvolution } from '../../modules/followup/entities/postop-evolution.entity';
import { DischargePlan } from '../../modules/followup/entities/discharge-plan.entity';
import { Checklist } from '../../modules/planning/entities/checklist.entity';
import { SurgicalPlanning } from '../../modules/planning/entities/surgical-planning.entity';
import { Documentation } from '../../modules/documentation/entities/documentation.entity';
import { MedicalRecord } from '../../modules/hce/entities/medical-record.entity';
import { LabResult } from '../../modules/hce/entities/lab-result.entity';
import { Image } from '../../modules/hce/entities/image.entity';
import { Allergy } from '../../modules/hce/entities/allergy.entity';
import { Medication } from '../../modules/hce/entities/medication.entity';

const SEED_USER_ID = '00000000-0000-0000-0000-000000000001';

const isReseed = process.argv.includes('--force') || process.argv.includes('--reseed');

async function run() {
  const rootPath = join(__dirname, '..', '..');
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || process.env.DATABASE_HOST || 'localhost',
    port: parseInt(
      process.env.POSTGRES_PORT || process.env.DATABASE_PORT || '5432',
      10,
    ),
    username:
      process.env.POSTGRES_USER || process.env.DATABASE_USER || 'sigq_user',
    password:
      process.env.POSTGRES_PASSWORD ||
      process.env.DATABASE_PASSWORD ||
      'sigq_password_change_in_prod',
    database:
      process.env.POSTGRES_DB || process.env.DATABASE_NAME || 'sigq_db',
    entities: [join(rootPath, 'modules', '**', '*.entity{.ts,.js}')],
    synchronize: false,
    logging: true,
  });

  await dataSource.initialize();
  console.log('Conectado a la base de datos.');

  const patientRepo = dataSource.getRepository(Patient);
  const roomRepo = dataSource.getRepository(OperatingRoom);
  const surgeryRepo = dataSource.getRepository(Surgery);
  const evolutionRepo = dataSource.getRepository(PostopEvolution);
  const dischargeRepo = dataSource.getRepository(DischargePlan);

  const existingPatients = await patientRepo.count();
  if (existingPatients > 0 && !isReseed) {
    console.log(
      `Ya existen ${existingPatients} paciente(s). Para reseed: npm run seed -- --force`,
    );
    await dataSource.destroy();
    return;
  }

  if (isReseed && existingPatients > 0) {
    console.log('Reseed: borrando datos de prueba...');
    const manager = dataSource.manager;
    const deleteIfExists = async (entity: any) => {
      try {
        await manager.createQueryBuilder().delete().from(entity).execute();
      } catch (err: any) {
        if (err?.code !== '42P01') throw err;
        // 42P01 = relation does not exist (tabla no creada aún)
      }
    };
    await deleteIfExists(DischargePlan);
    await deleteIfExists(PostopEvolution);
    await deleteIfExists(Documentation);
    await deleteIfExists(Checklist);
    await deleteIfExists(SurgicalPlanning);
    await deleteIfExists(Surgery);
    await deleteIfExists(OperatingRoom);
    await deleteIfExists(LabResult);
    await deleteIfExists(Image);
    await deleteIfExists(MedicalRecord);
    await deleteIfExists(Allergy);
    await deleteIfExists(Medication);
    await deleteIfExists(Patient);
    console.log('Datos de prueba borrados.');
  }

  const p1 = patientRepo.create({
    firstName: 'María',
    lastName: 'García López',
    dateOfBirth: new Date('1975-03-15'),
    gender: 'F',
    phone: '+34 612 000 001',
    email: 'maria.garcia@example.com',
    address: 'Calle Mayor 1, 28001 Madrid',
    createdBy: SEED_USER_ID,
  });
  await patientRepo.save(p1);
  console.log('Paciente creado:', p1.firstName, p1.lastName);

  const p2 = patientRepo.create({
    firstName: 'Juan',
    lastName: 'Martínez Sánchez',
    dateOfBirth: new Date('1982-08-22'),
    gender: 'M',
    phone: '+34 612 000 002',
    email: 'juan.martinez@example.com',
    address: 'Plaza España 5, 28013 Madrid',
    createdBy: SEED_USER_ID,
  });
  await patientRepo.save(p2);
  console.log('Paciente creado:', p2.firstName, p2.lastName);

  const r1 = roomRepo.create({
    name: 'Quirófano 1',
    code: 'Q1',
    description: 'Sala de cirugía general',
    floor: 'Planta 2',
    building: 'Edificio Principal',
    isActive: true,
    equipment: { anesthesiaMachine: true, ventilator: true, surgicalLights: 3 },
    capacity: 8,
  });
  await roomRepo.save(r1);
  console.log('Quirófano creado:', r1.name);

  const r2 = roomRepo.create({
    name: 'Quirófano 2',
    code: 'Q2',
    floor: 'Planta 2',
    building: 'Edificio Principal',
    isActive: true,
    capacity: 6,
  });
  await roomRepo.save(r2);
  console.log('Quirófano creado:', r2.name);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(11, 0, 0, 0);
  const nextWeek = new Date(tomorrow);
  nextWeek.setDate(nextWeek.getDate() + 6);
  nextWeek.setHours(10, 0, 0, 0);
  const nextWeekEnd = new Date(nextWeek);
  nextWeekEnd.setHours(12, 0, 0, 0);

  const s1 = surgeryRepo.create({
    patientId: p1.id,
    surgeonId: SEED_USER_ID,
    procedure: 'Colecistectomía laparoscópica',
    type: SurgeryType.ELECTIVE,
    status: SurgeryStatus.SCHEDULED,
    scheduledDate: tomorrow,
    startTime: tomorrow,
    endTime: tomorrowEnd,
    operatingRoomId: r1.id,
    preopNotes: 'Paciente estable, sin alergias conocidas.',
  });
  await surgeryRepo.save(s1);
  console.log('Cirugía creada:', s1.procedure);

  const s2 = surgeryRepo.create({
    patientId: p2.id,
    surgeonId: SEED_USER_ID,
    procedure: 'Herniorrafia inguinal',
    type: SurgeryType.ELECTIVE,
    status: SurgeryStatus.PLANNED,
    scheduledDate: nextWeek,
    startTime: nextWeek,
    endTime: nextWeekEnd,
    operatingRoomId: r2.id,
  });
  await surgeryRepo.save(s2);
  console.log('Cirugía creada:', s2.procedure);

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const ev = evolutionRepo.create({
    surgeryId: s1.id,
    evolutionDate: today,
    clinicalNotes: 'Paciente en buen estado postoperatorio. Tolerancia oral. Sin fiebre.',
    hasComplications: false,
    recordedBy: SEED_USER_ID,
  });
  await evolutionRepo.save(ev);
  console.log('Evolución postoperatoria creada para cirugía', s1.procedure);

  const plan = dischargeRepo.create({
    surgeryId: s1.id,
    surgerySummary: 'Colecistectomía laparoscópica sin incidencias. Paciente estable.',
    instructions: 'Dieta blanda 48h. Reposo relativo 1 semana. Control en consultas externas.',
    status: 'draft',
    generatedBy: SEED_USER_ID,
  });
  await dischargeRepo.save(plan);
  console.log('Plan de alta creado (borrador) para cirugía', s1.procedure);

  console.log('');
  console.log('Seed completado. Datos creados: 2 pacientes, 2 quirófanos, 2 cirugías, 1 evolución, 1 plan de alta.');
  await dataSource.destroy();
}

run().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});

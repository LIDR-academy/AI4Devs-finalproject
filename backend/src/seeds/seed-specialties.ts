import { AppDataSource } from '../config/database';
import { Specialty } from '../models/specialty.entity';
import { logger } from '../utils/logger';

const specialties = [
  { nameEs: 'Cardiología', nameEn: 'Cardiology' },
  { nameEs: 'Dermatología', nameEn: 'Dermatology' },
  { nameEs: 'Pediatría', nameEn: 'Pediatrics' },
  { nameEs: 'Neurología', nameEn: 'Neurology' },
  { nameEs: 'Oftalmología', nameEn: 'Ophthalmology' },
  { nameEs: 'Ortopedia', nameEn: 'Orthopedics' },
  { nameEs: 'Psiquiatría', nameEn: 'Psychiatry' },
  { nameEs: 'Medicina General', nameEn: 'General Medicine' },
];

export async function seedSpecialties(): Promise<void> {
  try {
    const specialtyRepository = AppDataSource.getRepository(Specialty);

    for (const specialtyData of specialties) {
      const existing = await specialtyRepository.findOne({
        where: [
          { nameEs: specialtyData.nameEs },
          { nameEn: specialtyData.nameEn },
        ],
      });

      if (!existing) {
        const specialty = specialtyRepository.create({
          nameEs: specialtyData.nameEs,
          nameEn: specialtyData.nameEn,
          isActive: true,
        });
        await specialtyRepository.save(specialty);
        logger.info(`✅ Especialidad creada: ${specialtyData.nameEs}`);
      } else {
        logger.info(`⏭️  Especialidad ya existe: ${specialtyData.nameEs}`);
      }
    }
  } catch (error) {
    logger.error('Error al crear especialidades:', error);
    throw error;
  }
}

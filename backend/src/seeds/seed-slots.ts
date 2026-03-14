import { AppDataSource } from '../config/database';
import { Doctor } from '../models/doctor.entity';
import { Slot } from '../models/slot.entity';
import { logger } from '../utils/logger';

const SLOT_DURATION_MINUTES = 30;

/**
 * Crea slots disponibles para los médicos en los próximos 7 días.
 * Horario: 09:00 - 17:00, slots de 30 minutos.
 */
export async function seedSlots(): Promise<void> {
  try {
    const doctorRepository = AppDataSource.getRepository(Doctor);
    const slotRepository = AppDataSource.getRepository(Slot);

    const doctors = await doctorRepository.find();

    if (doctors.length === 0) {
      logger.warn('⚠️ No hay médicos. Ejecuta seed-doctors primero.');
      return;
    }

    const now = new Date();
    let slotsCreated = 0;

    for (const doctor of doctors) {
      // Crear slots para los próximos 7 días
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(now);
        date.setDate(date.getDate() + dayOffset);
        date.setHours(0, 0, 0, 0);

        // Saltar fines de semana (0=domingo, 6=sábado)
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        // Crear slots de 09:00 a 17:00
        for (let hour = 9; hour < 17; hour++) {
          const startTime = new Date(date);
          startTime.setHours(hour, 0, 0, 0);

          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + SLOT_DURATION_MINUTES);

          // No crear slots en el pasado
          if (startTime <= now) continue;

          const existingSlot = await slotRepository.findOne({
            where: {
              doctorId: doctor.id,
              startTime,
            },
          });

          if (!existingSlot) {
            const slot = slotRepository.create({
              doctorId: doctor.id,
              startTime,
              endTime,
              isAvailable: true,
            });
            await slotRepository.save(slot);
            slotsCreated++;
          }
        }
      }
    }

    logger.info(`✅ Slots creados: ${slotsCreated}`);
  } catch (error) {
    logger.error('Error al crear slots:', error);
    throw error;
  }
}

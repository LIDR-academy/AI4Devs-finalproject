import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Specialty } from '../models/specialty.entity';
import { logger } from '../utils/logger';

export const specialtiesController = {
  getAll: async (_req: any, res: Response) => {
    try {
      const specialtyRepository = AppDataSource.getRepository(Specialty);
      const specialties = await specialtyRepository.find({
        where: { isActive: true },
        order: { nameEs: 'ASC' },
      });

      return res.status(200).json({
        specialties: specialties.map((s) => ({
          id: s.id,
          nameEs: s.nameEs,
          nameEn: s.nameEn,
          isActive: s.isActive,
        })),
      });
    } catch (error) {
      logger.error('Error al obtener especialidades:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  },
};

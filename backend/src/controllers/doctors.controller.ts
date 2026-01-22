import { Response } from 'express';
import { DoctorSearchService } from '../services/doctor-search.service';
import { SearchFiltersDto } from '../dto/doctors/search-filters.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const doctorSearchService = new DoctorSearchService();

export const doctorsController = {
  search: async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Convertir query params a DTO
      const filters = plainToInstance(SearchFiltersDto, {
        specialty: req.query.specialty,
        lat: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
        lng: req.query.lng ? parseFloat(req.query.lng as string) : undefined,
        postalCode: req.query.postalCode,
        radius: req.query.radius
          ? parseFloat(req.query.radius as string)
          : undefined,
        date: req.query.date,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      });

      // Validar DTO
      const errors = await validate(filters);

      if (errors.length > 0) {
        const formattedErrors: Record<string, string[]> = {};
        errors.forEach((error) => {
          if (error.constraints) {
            formattedErrors[error.property] = Object.values(error.constraints);
          }
        });

        return res.status(400).json({
          error: 'Parámetros de búsqueda inválidos',
          code: 'INVALID_SEARCH_PARAMS',
          details: formattedErrors,
          timestamp: new Date().toISOString(),
        });
      }

      // Validar que haya al menos coordenadas o código postal
      if (!filters.lat && !filters.lng && !filters.postalCode) {
        return res.status(400).json({
          error: 'Debes proporcionar coordenadas (lat, lng) o código postal',
          code: 'MISSING_LOCATION_PARAMS',
          timestamp: new Date().toISOString(),
        });
      }

      // Validar que si hay lat, también haya lng y viceversa
      if ((filters.lat && !filters.lng) || (!filters.lat && filters.lng)) {
        return res.status(400).json({
          error: 'Las coordenadas lat y lng deben proporcionarse juntas',
          code: 'INCOMPLETE_COORDINATES',
          timestamp: new Date().toISOString(),
        });
      }

      // Ejecutar búsqueda
      const result = await doctorSearchService.searchDoctors(filters);

      // Si no hay resultados
      if (result.doctors.length === 0) {
        return res.status(200).json({
          ...result,
          message: 'No se encontraron médicos con los criterios especificados',
        });
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error en búsqueda de médicos:', error);

      if (error instanceof Error) {
        return res.status(500).json({
          error: 'Error interno del servidor',
          code: 'INTERNAL_ERROR',
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      }

      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  },
};

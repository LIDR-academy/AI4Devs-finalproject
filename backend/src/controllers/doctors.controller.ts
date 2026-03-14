import { Response } from 'express';
import { DoctorSearchService } from '../services/doctor-search.service';
import { DoctorService } from '../services/doctor.service';
import { SearchFiltersDto } from '../dto/doctors/search-filters.dto';
import { UpdateDoctorProfileDto } from '../dto/doctors/update-profile.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const doctorSearchService = new DoctorSearchService();
const doctorService = new DoctorService();

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

      const hasCoordinates = filters.lat !== undefined && filters.lng !== undefined;
      const hasPostalCode = !!filters.postalCode;

      // Validar que haya al menos coordenadas o código postal
      if (!hasCoordinates && !hasPostalCode) {
        return res.status(400).json({
          error: 'Debes proporcionar coordenadas (lat, lng) o código postal',
          code: 'MISSING_LOCATION_PARAMS',
          timestamp: new Date().toISOString(),
        });
      }

      // Validar que si hay lat, también haya lng y viceversa
      if ((filters.lat !== undefined && filters.lng === undefined) || (filters.lat === undefined && filters.lng !== undefined)) {
        return res.status(400).json({
          error: 'Las coordenadas lat y lng deben proporcionarse juntas',
          code: 'INCOMPLETE_COORDINATES',
          timestamp: new Date().toISOString(),
        });
      }

      // Ejecutar búsqueda primaria
      let result = await doctorSearchService.searchDoctors(filters);

      // Fallback: si no hay resultados por geolocalización, intentar por código postal
      if (result.doctors.length === 0 && hasCoordinates && hasPostalCode) {
        const fallbackFilters = {
          ...filters,
          lat: undefined,
          lng: undefined,
        };

        logger.info('Sin resultados por geolocalización. Aplicando fallback por código postal.');
        result = await doctorSearchService.searchDoctors(fallbackFilters);
      }

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

  getById: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { doctorId } = req.params;
      const doctor = await doctorService.getById(doctorId);

      if (!doctor) {
        return res.status(404).json({
          error: 'Médico no encontrado',
          code: 'DOCTOR_NOT_FOUND',
          timestamp: new Date().toISOString(),
        });
      }

      return res.status(200).json(doctor);
    } catch (error) {
      logger.error('Error al obtener médico:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  },

  getLatest: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const parsedLimit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
      const limit = Number.isFinite(parsedLimit) ? parsedLimit : 5;
      const latestDoctors = await doctorService.getLatestRegistered(limit);

      return res.status(200).json({
        doctors: latestDoctors,
      });
    } catch (error) {
      logger.error('Error al obtener últimos médicos registrados:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  },

  getSlots: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { doctorId } = req.params;
      const date = req.query.date as string;

      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          error: 'Parámetro date es requerido (formato: yyyy-MM-dd)',
          code: 'INVALID_DATE_PARAM',
          timestamp: new Date().toISOString(),
        });
      }

      const slots = await doctorService.getSlotsByDate(doctorId, date);

      return res.status(200).json({ slots });
    } catch (error) {
      logger.error('Error al obtener slots:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  },

  getMe: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          error: 'No autenticado',
          code: 'NOT_AUTHENTICATED',
          timestamp: new Date().toISOString(),
        });
      }

      const doctorProfile = await doctorService.getMyProfile(userId);

      if (!doctorProfile) {
        return res.status(404).json({
          error: 'Perfil de médico no encontrado',
          code: 'DOCTOR_PROFILE_NOT_FOUND',
          timestamp: new Date().toISOString(),
        });
      }

      return res.status(200).json(doctorProfile);
    } catch (error) {
      logger.error('Error al obtener perfil del médico:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  },

  updateMe: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          error: 'No autenticado',
          code: 'NOT_AUTHENTICATED',
          timestamp: new Date().toISOString(),
        });
      }

      if (Object.prototype.hasOwnProperty.call(req.body, 'email')) {
        return res.status(400).json({
          error: 'El email no se puede modificar',
          code: 'EMAIL_IMMUTABLE',
          timestamp: new Date().toISOString(),
        });
      }

      const dto = plainToInstance(UpdateDoctorProfileDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        const formattedErrors: Record<string, string[]> = {};
        errors.forEach((error) => {
          if (error.constraints) {
            formattedErrors[error.property] = Object.values(error.constraints);
          }
        });

        return res.status(400).json({
          error: 'Datos de perfil inválidos',
          code: 'INVALID_PROFILE_DATA',
          details: formattedErrors,
          timestamp: new Date().toISOString(),
        });
      }

      if (
        (dto.address !== undefined && dto.postalCode === undefined) ||
        (dto.postalCode !== undefined && dto.address === undefined)
      ) {
        return res.status(400).json({
          error: 'Dirección y código postal deben enviarse juntos',
          code: 'ADDRESS_POSTAL_REQUIRED',
          timestamp: new Date().toISOString(),
        });
      }

      const ipAddress = req.ip || req.socket.remoteAddress || '0.0.0.0';
      const result = await doctorService.updateMyProfile(userId, dto, ipAddress);

      if (!result) {
        return res.status(404).json({
          error: 'Perfil de médico no encontrado',
          code: 'DOCTOR_PROFILE_NOT_FOUND',
          timestamp: new Date().toISOString(),
        });
      }

      return res.status(200).json({
        message: 'Perfil médico actualizado correctamente',
        doctor: result.doctor,
        warnings: result.warnings,
      });
    } catch (error) {
      logger.error('Error al actualizar perfil del médico:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  },
};

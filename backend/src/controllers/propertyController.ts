import { Request, Response } from 'express';
import { IRequestWithUser } from '../types';
import { PropertyService } from '../services/propertyService';

export class PropertyController {
  // Obtener todas las propiedades con filtros
  static async getProperties(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        property_type: req.query.property_type as any,
        operation_type: req.query.operation_type as any,
        price_min: req.query.price_min ? parseFloat(req.query.price_min as string) : undefined,
        price_max: req.query.price_max ? parseFloat(req.query.price_max as string) : undefined,
        bedrooms_min: req.query.bedrooms_min ? parseInt(req.query.bedrooms_min as string) : undefined,
        bathrooms_min: req.query.bathrooms_min ? parseInt(req.query.bathrooms_min as string) : undefined,
        city: req.query.city as string,
        state: req.query.state as string,
        featured: req.query.featured === 'true'
      };

      const { properties, total } = await PropertyService.getProperties(filters);
      const totalPages = Math.ceil(total / filters.limit);

      res.status(200).json({
        success: true,
        message: 'Propiedades obtenidas exitosamente',
        data: properties,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          total_pages: totalPages
        }
      });
    } catch (error) {
      console.error('Error al obtener propiedades:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Obtener una propiedad por ID
  static async getPropertyById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const property = await PropertyService.getPropertyById(parseInt(id));

      if (!property) {
        res.status(404).json({
          success: false,
          message: 'Propiedad no encontrada',
          error: 'PROPERTY_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Propiedad obtenida exitosamente',
        data: property
      });
    } catch (error) {
      console.error('Error al obtener propiedad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Crear una nueva propiedad
  static async createProperty(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const property = await PropertyService.createProperty(req.body, user.id);

      res.status(201).json({
        success: true,
        message: 'Propiedad creada exitosamente',
        data: property
      });
    } catch (error) {
      console.error('Error al crear propiedad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Actualizar una propiedad
  static async updateProperty(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { id } = req.params;
      const property = await PropertyService.updateProperty(parseInt(id), req.body, user.id);

      if (!property) {
        res.status(404).json({
          success: false,
          message: 'Propiedad no encontrada o sin permisos',
          error: 'PROPERTY_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Propiedad actualizada exitosamente',
        data: property
      });
    } catch (error) {
      console.error('Error al actualizar propiedad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Eliminar una propiedad
  static async deleteProperty(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { id } = req.params;
      const success = await PropertyService.deleteProperty(parseInt(id), user.id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Propiedad no encontrada o sin permisos',
          error: 'PROPERTY_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Propiedad eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar propiedad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Obtener propiedades del usuario autenticado
  static async getUserProperties(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const properties = await PropertyService.getUserProperties(user.id);

      res.status(200).json({
        success: true,
        message: 'Propiedades del usuario obtenidas exitosamente',
        data: properties
      });
    } catch (error) {
      console.error('Error al obtener propiedades del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Cambiar estado destacado (solo admin)
  static async toggleFeatured(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const user = req.user!;
      
      if (user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden cambiar el estado destacado',
          error: 'INSUFFICIENT_PERMISSIONS'
        });
        return;
      }

      const { id } = req.params;
      const property = await PropertyService.toggleFeatured(parseInt(id));

      if (!property) {
        res.status(404).json({
          success: false,
          message: 'Propiedad no encontrada',
          error: 'PROPERTY_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Estado destacado cambiado exitosamente',
        data: property
      });
    } catch (error) {
      console.error('Error al cambiar estado destacado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }
}

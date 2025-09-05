import { Request, Response } from 'express';
import { PropertyImageService } from '../services/propertyImageService';
import { IRequestWithUser } from '../types';

export class PropertyImageController {
  // Obtener imágenes de una propiedad
  static async getPropertyImages(req: Request, res: Response): Promise<void> {
    try {
      const { id_property } = req.params;
      const images = await PropertyImageService.getPropertyImages(id_property);

      res.json({
        success: true,
        data: images,
        message: 'Imágenes obtenidas exitosamente'
      });
    } catch (error: any) {
      console.error('Error al obtener imágenes:', error);
      
      if (error.message === 'PROPERTY_NOT_FOUND') {
        res.status(404).json({
          success: false,
          message: 'Propiedad no encontrada'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Subir imagen a una propiedad
  static async uploadPropertyImage(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { id_property } = req.params;
      const { url, cloudinary_id, alt_text, is_primary } = req.body;

      const image = await PropertyImageService.uploadPropertyImage(
        id_property,
        {
          url,
          cloudinary_id,
          alt_text,
          is_primary: is_primary || false
        },
        user.id_user
      );

      res.status(201).json({
        success: true,
        data: image,
        message: 'Imagen subida exitosamente'
      });
    } catch (error: any) {
      console.error('Error al subir imagen:', error);
      
      if (error.message === 'PROPERTY_NOT_FOUND') {
        res.status(404).json({
          success: false,
          message: 'Propiedad no encontrada'
        });
        return;
      }
      
      if (error.message === 'INSUFFICIENT_PERMISSIONS') {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para subir imágenes a esta propiedad'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Eliminar imagen
  static async deletePropertyImage(req: IRequestWithUser, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { id_property, id_image } = req.params;

      const success = await PropertyImageService.deletePropertyImage(
        id_property,
        id_image,
        user.id_user
      );

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Imagen no encontrada o sin permisos'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Imagen eliminada exitosamente'
      });
    } catch (error: any) {
      console.error('Error al eliminar imagen:', error);
      
      if (error.message === 'PROPERTY_NOT_FOUND') {
        res.status(404).json({
          success: false,
          message: 'Propiedad no encontrada'
        });
        return;
      }
      
      if (error.message === 'INSUFFICIENT_PERMISSIONS') {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar esta imagen'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

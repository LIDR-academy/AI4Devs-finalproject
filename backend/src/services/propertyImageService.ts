import { PropertyImage } from '../models/PropertyImage';
import Property from '../models/Property';
import sequelize from '../config/database';

export class PropertyImageService {
  // Obtener imágenes de una propiedad
  static async getPropertyImages(propertyId: string): Promise<PropertyImage[]> {
    // Verificar que la propiedad existe
    const property = await Property.findByPk(propertyId);
    if (!property) {
      throw new Error('PROPERTY_NOT_FOUND');
    }

    const images = await PropertyImage.findAll({
      where: { property_id: propertyId },
      order: [['is_primary', 'DESC'], ['order_index', 'ASC']]
    });

    return images;
  }

  // Subir imagen a una propiedad
  static async uploadPropertyImage(
    propertyId: string,
    imageData: {
      url: string;
      cloudinary_id: string;
      alt_text: string;
      is_primary: boolean;
    },
    userId: string
  ): Promise<PropertyImage> {
    // Iniciar transacción
    const transaction = await sequelize.transaction();

    try {
      // Verificar que la propiedad existe y pertenece al usuario
      const property = await Property.findOne({
        where: { id_property: propertyId, user_id: userId },
        transaction
      });

      if (!property) {
        throw new Error('PROPERTY_NOT_FOUND');
      }

      // Si esta imagen es primaria, desmarcar las otras como no primarias
      if (imageData.is_primary) {
        await PropertyImage.update(
          { is_primary: false },
          { 
            where: { property_id: propertyId },
            transaction
          }
        );
      }

      // Obtener el siguiente order_index
      const lastImage = await PropertyImage.findOne({
        where: { property_id: propertyId },
        order: [['order_index', 'DESC']],
        transaction
      });

      const orderIndex = lastImage ? lastImage.order_index + 1 : 0;

      const image = await PropertyImage.create({
        ...imageData,
        property_id: propertyId,
        order_index: orderIndex
      }, { transaction });

      // Confirmar transacción
      await transaction.commit();
      return image;

    } catch (error) {
      // Revertir transacción en caso de error
      await transaction.rollback();
      throw error;
    }
  }

  // Eliminar imagen
  static async deletePropertyImage(
    propertyId: string,
    imageId: string,
    userId: string
  ): Promise<boolean> {
    // Iniciar transacción
    const transaction = await sequelize.transaction();

    try {
      // Verificar que la propiedad existe y pertenece al usuario
      const property = await Property.findOne({
        where: { id_property: propertyId, user_id: userId },
        transaction
      });

      if (!property) {
        throw new Error('PROPERTY_NOT_FOUND');
      }

      const image = await PropertyImage.findOne({
        where: { id_property_image: imageId, property_id: propertyId },
        transaction
      });

      if (!image) {
        await transaction.rollback();
        return false;
      }

      await image.destroy({ transaction });

      // Confirmar transacción
      await transaction.commit();
      return true;

    } catch (error) {
      // Revertir transacción en caso de error
      await transaction.rollback();
      throw error;
    }
  }
}

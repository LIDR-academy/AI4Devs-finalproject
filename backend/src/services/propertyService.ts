import { Op } from 'sequelize';
import sequelize from '../config/database';
import Property from '../models/Property';
import User from '../models/User';
import { PropertyImage } from '../models/PropertyImage';
import { ICreateProperty, IUpdateProperty, IPropertyFilters, PropertyStatus } from '../types';

// Cache simple para evitar incrementos duplicados de vistas
const viewIncrementCache = new Map<string, number>();

export class PropertyService {
  // Obtener propiedades con filtros
  static async getProperties(filters: IPropertyFilters): Promise<{ properties: Property[]; total: number }> {
    const { page = 1, limit = 10, ...whereFilters } = filters;
    const offset = (page - 1) * limit;

    const where: any = { status: PropertyStatus.ACTIVE };

    if (whereFilters.property_type) where.property_type = whereFilters.property_type;
    if (whereFilters.operation_type) where.operation_type = whereFilters.operation_type;
    if (whereFilters.price_min) where.price = { [Op.gte]: whereFilters.price_min };
    if (whereFilters.price_max) where.price = { ...where.price, [Op.lte]: whereFilters.price_max };
    if (whereFilters.bedrooms_min) where.bedrooms = { [Op.gte]: whereFilters.bedrooms_min };
    if (whereFilters.bathrooms_min) where.bathrooms = { [Op.gte]: whereFilters.bathrooms_min };
    if (whereFilters.city) where.city = whereFilters.city;
    if (whereFilters.state) where.state = whereFilters.state;
    if (whereFilters.featured !== undefined) where.featured = whereFilters.featured;

    const { count, rows } = await Property.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id_user', 'first_name', 'last_name', 'email', 'phone']
        },
        {
          model: PropertyImage,
          as: 'images',
          attributes: ['id_property_image', 'url', 'alt_text', 'is_primary', 'order_index'],
          order: [['order_index', 'ASC'], ['created_at', 'ASC']]
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    return { properties: rows, total: count };
  }

  // Obtener propiedad por ID
  static async getPropertyById(id_property: string): Promise<Property | null> {
    const property = await Property.findByPk(id_property, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id_user', 'first_name', 'last_name', 'email', 'phone']
        },
        {
          model: PropertyImage,
          as: 'images',
          attributes: ['id_property_image', 'url', 'alt_text', 'is_primary', 'order_index'],
          order: [['order_index', 'ASC'], ['created_at', 'ASC']]
        }
      ]
    });

    if (property) {
      // Verificar si ya se incrementó recientemente (en los últimos 5 segundos)
      const now = Date.now();
      const lastIncrement = viewIncrementCache.get(id_property);
      
      if (!lastIncrement || (now - lastIncrement) > 5000) {
        // Incrementar contador de vistas solo si no se ha incrementado recientemente
        console.log(`PropertyService: Incrementando vistas para propiedad ${id_property}`);
        await property.increment('views_count');
        viewIncrementCache.set(id_property, now);
        
        // Limpiar cache después de 1 minuto
        setTimeout(() => {
          viewIncrementCache.delete(id_property);
        }, 60000);
      } else {
        console.log(`PropertyService: Saltando incremento de vistas para ${id_property} (ya incrementado recientemente)`);
      }
    }

    return property;
  }

  // Método separado para incrementar vistas sin obtener la propiedad completa
  static async incrementPropertyViews(id_property: string): Promise<boolean> {
    try {
      const property = await Property.findByPk(id_property);
      if (!property) {
        return false;
      }

      // Verificar si ya se incrementó recientemente para evitar duplicados
      const now = Date.now();
      const lastIncrement = viewIncrementCache.get(id_property);
      
      // Aumentar el tiempo de cache a 30 segundos para ser más resistente a React Strict Mode
      if (!lastIncrement || (now - lastIncrement) > 30000) {
        // Incrementar contador de vistas solo si no se ha incrementado recientemente
        console.log(`PropertyService: Incrementando vistas para propiedad ${id_property}`);
        await property.increment('views_count');
        viewIncrementCache.set(id_property, now);
        
        // Limpiar cache después de 5 minutos
        setTimeout(() => {
          viewIncrementCache.delete(id_property);
        }, 300000);
        
        return true;
      } else {
        console.log(`PropertyService: Incremento reciente para ${id_property} (hace ${Math.round((now - lastIncrement) / 1000)}s), ignorando`);
        return false;
      }
    } catch (error) {
      console.error('Error al incrementar vistas:', error);
      return false;
    }
  }

  // Crear propiedad
  static async createProperty(propertyData: ICreateProperty, userId: string): Promise<Property> {
    // Extraer imágenes del propertyData
    const { images, ...propertyDataWithoutImages } = propertyData;

    // Iniciar transacción
    const transaction = await sequelize.transaction();

    try {
      // Crear la propiedad dentro de la transacción
      const property = await Property.create({
        ...propertyDataWithoutImages,
        user_id: userId,
        currency: propertyData.currency || 'MXN',
        amenities: propertyData.amenities || [],
        status: PropertyStatus.ACTIVE,
        featured: false,
        views_count: 0,
        contact_count: 0,
        last_updated: new Date()
      }, { transaction });

      // Crear imágenes si existen
      if (images && images.length > 0) {
        const imagePromises = images.map(image => 
          PropertyImage.create({
            property_id: property.id_property,
            url: image.url,
            alt_text: image.alt_text,
            is_primary: image.is_primary,
            order_index: image.order_index,
            cloudinary_id: image.cloudinary_id
          }, { transaction })
        );
        
        await Promise.all(imagePromises);
      }

      // Si todo sale bien, confirmar la transacción
      await transaction.commit();
      return property;

    } catch (error) {
      // Si hay algún error, revertir toda la transacción
      await transaction.rollback();
      throw error;
    }
  }

  // Actualizar propiedad
  static async updateProperty(id_property: string, propertyData: IUpdateProperty, userId: string): Promise<Property | null> {
    // Extraer imágenes del propertyData
    const { images, ...propertyDataWithoutImages } = propertyData;

    // Iniciar transacción
    const transaction = await sequelize.transaction();

    try {
      const property = await Property.findOne({
        where: { id_property, user_id: userId }
      });

      if (!property) {
        await transaction.rollback();
        return null;
      }

      // Actualizar la propiedad
      await property.update({
        ...propertyDataWithoutImages,
        last_updated: new Date()
      }, { transaction });

      // Si se proporcionan imágenes, actualizar las imágenes
      if (images !== undefined) {
        // Eliminar imágenes existentes
        await PropertyImage.destroy({
          where: { property_id: id_property },
          transaction
        });

        // Crear nuevas imágenes si existen
        if (images.length > 0) {
          const imagePromises = images.map(image => 
            PropertyImage.create({
              property_id: id_property,
              url: image.url,
              alt_text: image.alt_text,
              is_primary: image.is_primary,
              order_index: image.order_index,
              cloudinary_id: image.cloudinary_id
            }, { transaction })
          );
          
          await Promise.all(imagePromises);
        }
      }

      // Si todo sale bien, confirmar la transacción
      await transaction.commit();
      
      // Obtener la propiedad actualizada con las imágenes
      const updatedProperty = await Property.findOne({
        where: { id_property },
        include: [
          {
            model: PropertyImage,
            as: 'images',
            order: [['order_index', 'ASC']]
          }
        ]
      });
      
      return updatedProperty;

    } catch (error) {
      // Si hay algún error, revertir toda la transacción
      await transaction.rollback();
      throw error;
    }
  }

  // Eliminar propiedad
  static async deleteProperty(id_property: string, userId: string): Promise<boolean> {
    const property = await Property.findOne({
      where: { id_property, user_id: userId }
    });

    if (!property) {
      return false;
    }

    await property.destroy();
    return true;
  }

  // Obtener propiedades de un usuario
  static async getUserProperties(userId: string): Promise<Property[]> {
    return await Property.findAll({
      where: { user_id: userId },
      include: [
        {
          model: PropertyImage,
          as: 'images',
          attributes: ['id_property_image', 'url', 'alt_text', 'is_primary', 'order_index'],
          order: [['order_index', 'ASC'], ['created_at', 'ASC']]
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  // Cambiar estado destacado
  static async toggleFeatured(id_property: string, userId: string): Promise<Property | null> {
    const property = await Property.findOne({
      where: { id_property, user_id: userId }
    });
    
    if (!property) {
      return null;
    }

    await property.update({ featured: !property.featured });
    return property;
  }

  // Actualizar estado de propiedad
  static async updatePropertyStatus(id_property: string, status: string, userId: string): Promise<Property | null> {
    const property = await Property.findOne({
      where: { id_property, user_id: userId }
    });

    if (!property) {
      return null;
    }

    await property.update({ status });
    return property;
  }
}

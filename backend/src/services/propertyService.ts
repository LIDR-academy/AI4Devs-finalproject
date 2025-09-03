import { Op } from 'sequelize';
import Property from '../models/Property';
import User from '../models/User';
import { ICreateProperty, IUpdateProperty, IPropertyFilters, PropertyStatus } from '../types';

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
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    return { properties: rows, total: count };
  }

  // Obtener propiedad por ID
  static async getPropertyById(id: number): Promise<Property | null> {
    const property = await Property.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
        }
      ]
    });

    if (property) {
      // Incrementar contador de vistas
      await property.increment('views_count');
    }

    return property;
  }

  // Crear propiedad
  static async createProperty(propertyData: ICreateProperty, userId: number): Promise<Property> {
    const property = await Property.create({
      ...propertyData,
      user_id: userId,
      currency: propertyData.currency || 'MXN',
      amenities: propertyData.amenities || [],
      status: PropertyStatus.ACTIVE,
      featured: false,
      views_count: 0,
      contact_count: 0,
      last_updated: new Date()
    });

    return property;
  }

  // Actualizar propiedad
  static async updateProperty(id: number, propertyData: IUpdateProperty, userId: number): Promise<Property | null> {
    const property = await Property.findOne({
      where: { id, user_id: userId }
    });

    if (!property) {
      return null;
    }

    await property.update({
      ...propertyData,
      last_updated: new Date()
    });

    return property;
  }

  // Eliminar propiedad
  static async deleteProperty(id: number, userId: number): Promise<boolean> {
    const property = await Property.findOne({
      where: { id, user_id: userId }
    });

    if (!property) {
      return false;
    }

    await property.destroy();
    return true;
  }

  // Obtener propiedades de un usuario
  static async getUserProperties(userId: number): Promise<Property[]> {
    return await Property.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });
  }

  // Cambiar estado destacado (solo admin)
  static async toggleFeatured(id: number): Promise<Property | null> {
    const property = await Property.findByPk(id);
    
    if (!property) {
      return null;
    }

    await property.update({ featured: !property.featured });
    return property;
  }
}

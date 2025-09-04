'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const amenities = [
      // Amenidades Básicas
      { id_amenity: uuidv4(), name: 'Estacionamiento', category: 'básicas', icon: 'local_parking', description: 'Espacio de estacionamiento disponible', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id_amenity: uuidv4(), name: 'Jardín', category: 'básicas', icon: 'yard', description: 'Área verde o jardín', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id_amenity: uuidv4(), name: 'Terraza', category: 'básicas', icon: 'balcony', description: 'Terraza o balcón', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id_amenity: uuidv4(), name: 'Cocina Integral', category: 'básicas', icon: 'kitchen', description: 'Cocina completamente equipada', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id_amenity: uuidv4(), name: 'Closets', category: 'básicas', icon: 'wardrobe', description: 'Closets empotrados', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id_amenity: uuidv4(), name: 'Ventilación', category: 'básicas', icon: 'air', description: 'Buena ventilación natural', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id_amenity: uuidv4(), name: 'Iluminación Natural', category: 'básicas', icon: 'light_mode', description: 'Abundante luz natural', is_active: true, created_at: new Date(), updated_at: new Date() },

      // Amenidades de Lujo
      { id_amenity: uuidv4(), name: 'Alberca', category: 'lujo', icon: 'pool', description: 'Alberca privada', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id_amenity: uuidv4(), name: 'Jacuzzi', category: 'lujo', icon: 'hot_tub', description: 'Jacuzzi o bañera de hidromasaje', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id_amenity: uuidv4(), name: 'Gimnasio', category: 'lujo', icon: 'fitness_center', description: 'Gimnasio privado', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id_amenity: uuidv4(), name: 'Sala de Cine', category: 'lujo', icon: 'movie', description: 'Sala de cine en casa', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id_amenity: uuidv4(), name: 'Bodega', category: 'lujo', icon: 'wine_bar', description: 'Bodega de vinos', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id_amenity: uuidv4(), name: 'Ascensor', category: 'lujo', icon: 'elevator', description: 'Ascensor privado', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id_amenity: uuidv4(), name: 'Seguridad 24/7', category: 'lujo', icon: 'security', description: 'Seguridad las 24 horas', is_active: true, created_at: new Date(), updated_at: new Date() },

      // Amenidades de Accesibilidad
      { id_amenity: uuidv4(), name: 'Acceso para Silla de Ruedas', category: 'accesibilidad', icon: 'accessible', description: 'Acceso adaptado para sillas de ruedas', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id_amenity: uuidv4(), name: 'Rampas', category: 'accesibilidad', icon: 'ramp_right', description: 'Rampas de acceso', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id_amenity: uuidv4(), name: 'Baño Adaptado', category: 'accesibilidad', icon: 'accessible_forward', description: 'Baño adaptado para personas con discapacidad', is_active: true, created_at: new Date(), updated_at: new Date() },

      // Amenidades Tecnológicas
      { id_amenity: uuidv4(), name: 'Internet de Alta Velocidad', category: 'tecnología', icon: 'wifi', description: 'Conexión a internet de alta velocidad', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id_amenity: uuidv4(), name: 'Sistema de Seguridad', category: 'tecnología', icon: 'security', description: 'Sistema de seguridad con cámaras', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id_amenity: uuidv4(), name: 'Domótica', category: 'tecnología', icon: 'smart_toy', description: 'Sistema de automatización del hogar', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id_amenity: uuidv4(), name: 'Paneles Solares', category: 'tecnología', icon: 'solar_power', description: 'Sistema de paneles solares', is_active: true, created_at: new Date(), updated_at: new Date() },

      // Amenidades de Servicios
      { id_amenity: uuidv4(), name: 'Conserjería', category: 'servicios', icon: 'support_agent', description: 'Servicio de conserjería', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id_amenity: uuidv4(), name: 'Limpieza', category: 'servicios', icon: 'cleaning_services', description: 'Servicio de limpieza incluido', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id_amenity: uuidv4(), name: 'Mantenimiento', category: 'servicios', icon: 'build', description: 'Servicio de mantenimiento incluido', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id_amenity: uuidv4(), name: 'Lavandería', category: 'servicios', icon: 'local_laundry_service', description: 'Servicio de lavandería', is_active: true, created_at: new Date(), updated_at: new Date() }
    ];

    await queryInterface.bulkInsert('amenities', amenities, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('amenities', null, {});
  }
};

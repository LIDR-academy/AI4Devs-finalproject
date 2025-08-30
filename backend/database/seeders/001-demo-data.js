'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Crear usuarios de prueba
    const users = [
      {
        email: 'admin@zonmatch.com',
        password_hash: await bcrypt.hash('Admin123!', 12),
        role: 'admin',
        first_name: 'Administrador',
        last_name: 'Zonmatch',
        phone: '+525512345678',
        verification_status: 'verified',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'agente@zonmatch.com',
        password_hash: await bcrypt.hash('Agente123!', 12),
        role: 'agent',
        first_name: 'María',
        last_name: 'González',
        phone: '+525512345679',
        verification_status: 'verified',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'usuario@zonmatch.com',
        password_hash: await bcrypt.hash('Usuario123!', 12),
        role: 'user',
        first_name: 'Carlos',
        last_name: 'Rodríguez',
        phone: '+525512345680',
        verification_status: 'verified',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users);

    // Obtener los IDs de los usuarios insertados
    const adminUser = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = ?',
      {
        replacements: ['admin@zonmatch.com'],
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );
    
    const agentUser = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = ?',
      {
        replacements: ['agente@zonmatch.com'],
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );
    
    const regularUser = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = ?',
      {
        replacements: ['usuario@zonmatch.com'],
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );

    // Crear propiedades de prueba
    const properties = [
      {
        user_id: agentUser[0].id, // Agente
        title: 'Hermosa casa en Lomas de Chapultepec',
        description: 'Casa moderna de 3 recámaras con acabados de lujo, ubicada en una de las mejores zonas de la Ciudad de México. Cuenta con jardín, terraza y estacionamiento para 2 autos.',
        property_type: 'house',
        operation_type: 'sale',
        price: 8500000,
        currency: 'MXN',
        price_per_sqm: 85000,
        bedrooms: 3,
        bathrooms: 3,
        total_bathrooms: 4,
        sq_meters: 200,
        sq_meters_land: 300,
        floors: 2,
        parking_spaces: 2,
        year_built: 2020,
        condition: 'new',
        address: 'Av. Lomas de Chapultepec 123',
        neighborhood: 'Lomas de Chapultepec',
        city: 'Ciudad de México',
        state: 'CDMX',
        zip_code: '11000',
        latitude: 19.4326,
        longitude: -99.1332,
        amenities: ['pool', 'garden', 'terrace', 'security', 'parking'],
        status: 'active',
        featured: true,
        views_count: 45,
        contact_count: 8,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: createdUsers[1].id, // Agente
        title: 'Departamento en Polanco',
        description: 'Departamento de lujo en el corazón de Polanco, con vista panorámica y acceso a todas las amenidades. Ideal para ejecutivos o familias pequeñas.',
        property_type: 'apartment',
        operation_type: 'rent',
        price: 45000,
        currency: 'MXN',
        price_per_sqm: 45000,
        bedrooms: 2,
        bathrooms: 2,
        total_bathrooms: 2,
        sq_meters: 120,
        floors: 1,
        floor_number: 15,
        parking_spaces: 1,
        year_built: 2018,
        condition: 'used',
        address: 'Av. Presidente Masaryk 456',
        neighborhood: 'Polanco',
        city: 'Ciudad de México',
        state: 'CDMX',
        zip_code: '11560',
        latitude: 19.4333,
        longitude: -99.1333,
        amenities: ['gym', 'pool', 'security', 'parking', 'elevator'],
        status: 'active',
        featured: false,
        views_count: 32,
        contact_count: 5,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: createdUsers[2].id, // Usuario
        title: 'Oficina en Santa Fe',
        description: 'Oficina moderna en edificio corporativo de Santa Fe, ideal para empresas en crecimiento. Incluye recepción y servicios de conserjería.',
        property_type: 'office',
        operation_type: 'rent',
        price: 25000,
        currency: 'MXN',
        price_per_sqm: 25000,
        sq_meters: 80,
        floors: 1,
        floor_number: 8,
        parking_spaces: 2,
        year_built: 2019,
        condition: 'new',
        address: 'Av. Santa Fe 789',
        neighborhood: 'Santa Fe',
        city: 'Ciudad de México',
        state: 'CDMX',
        zip_code: '01210',
        latitude: 19.3569,
        longitude: -99.2574,
        amenities: ['reception', 'security', 'parking', 'elevator', 'concierge'],
        status: 'active',
        featured: false,
        views_count: 18,
        contact_count: 3,
        last_updated: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('properties', properties);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('properties', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};

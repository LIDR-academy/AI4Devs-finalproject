'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Obtener el ID del agente
    const agentUser = await queryInterface.sequelize.query(
      'SELECT id_user FROM users WHERE email = ?',
      {
        replacements: ['agente@zonmatch.com'],
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );
    
    const regularUser = await queryInterface.sequelize.query(
      'SELECT id_user FROM users WHERE email = ?',
      {
        replacements: ['usuario@zonmatch.com'],
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );

    if (agentUser.length === 0 || regularUser.length === 0) {
      console.log('Usuarios no encontrados, saltando inserción de propiedades');
      return;
    }

    // Crear propiedades de prueba
    const now = new Date();
    const properties = [
      {
        id_property: uuidv4(),
        user_id: agentUser[0].id_user,
        title: 'Hermosa casa en Lomas de Chapultepec',
        description: 'Casa moderna de 3 recámaras con acabados de lujo',
        property_type: 'house',
        operation_type: 'sale',
        price: 8500000,
        currency: 'MXN',
        bedrooms: 3,
        bathrooms: 3,
        sq_meters: 200,
        address: 'Av. Lomas de Chapultepec 123',
        city: 'Ciudad de México',
        state: 'CDMX',
        status: 'active',
        featured: true,
        views_count: 45,
        contact_count: 8,
        last_updated: now,
        created_at: now,
        updated_at: now
      },
      {
        id_property: uuidv4(),
        user_id: agentUser[0].id_user,
        title: 'Departamento en Polanco',
        description: 'Departamento de lujo en el corazón de Polanco',
        property_type: 'apartment',
        operation_type: 'rent',
        price: 45000,
        currency: 'MXN',
        bedrooms: 2,
        bathrooms: 2,
        sq_meters: 120,
        address: 'Av. Presidente Masaryk 456',
        city: 'Ciudad de México',
        state: 'CDMX',
        status: 'active',
        featured: false,
        views_count: 32,
        contact_count: 5,
        last_updated: now,
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('properties', properties);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('properties', null, {});
  }
};

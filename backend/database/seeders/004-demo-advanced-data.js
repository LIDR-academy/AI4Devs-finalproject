'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Obtener IDs de usuarios y propiedades existentes
    const users = await queryInterface.sequelize.query(
      'SELECT id_user FROM users LIMIT 3',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const properties = await queryInterface.sequelize.query(
      'SELECT id_property FROM properties LIMIT 5',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0 || properties.length === 0) {
      console.log('No hay usuarios o propiedades para crear datos de prueba');
      return;
    }

    const userId = users[0].id_user;
    const propertyId = properties[0].id_property;
    
    // Obtener los IDs de las búsquedas que acabamos de crear
    const searches = await queryInterface.sequelize.query(
      'SELECT id_search FROM searches WHERE user_id = ?',
      { 
        replacements: [userId],
        type: Sequelize.QueryTypes.SELECT 
      }
    );

    // Crear búsquedas guardadas
    await queryInterface.bulkInsert('searches', [
      {
        id_search: uuidv4(),
        user_id: userId,
        name: 'Casa en Polanco',
        property_type: 'house',
        operation_type: 'sale',
        price_min: 5000000,
        price_max: 15000000,
        bedrooms_min: 3,
        bathrooms_min: 2,
        sq_meters_min: 150,
        sq_meters_max: 300,
        amenities: JSON.stringify(['parking', 'garden', 'security']),
        neighborhoods: JSON.stringify(['Polanco', 'Lomas de Chapultepec']),
        is_active: true,
        notification_frequency: 'immediate',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_search: uuidv4(),
        user_id: userId,
        name: 'Departamento en Condesa',
        property_type: 'apartment',
        operation_type: 'rent',
        price_min: 15000,
        price_max: 35000,
        bedrooms_min: 1,
        bathrooms_min: 1,
        sq_meters_min: 60,
        sq_meters_max: 120,
        amenities: JSON.stringify(['elevator', 'security', 'gym']),
        neighborhoods: JSON.stringify(['Condesa', 'Roma']),
        is_active: true,
        notification_frequency: 'daily',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Crear polígonos de zonas de interés
    await queryInterface.bulkInsert('polygons', [
      {
        id_polygon: uuidv4(),
        user_id: userId,
        search_id: searches[0]?.id_search || null,
        name: 'Zona Polanco',
        coordinates: JSON.stringify([
          [19.4326, -99.1332],
          [19.4326, -99.1232],
          [19.4226, -99.1232],
          [19.4226, -99.1332],
          [19.4326, -99.1332]
        ]),
        color: '#FF0000',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_polygon: uuidv4(),
        user_id: userId,
        search_id: searches[1]?.id_search || null,
        name: 'Zona Condesa',
        coordinates: JSON.stringify([
          [19.4126, -99.1632],
          [19.4126, -99.1532],
          [19.4026, -99.1532],
          [19.4026, -99.1632],
          [19.4126, -99.1632]
        ]),
        color: '#00FF00',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Crear favoritos
    await queryInterface.bulkInsert('favorites', [
      {
        id_favorite: uuidv4(),
        user_id: userId,
        property_id: propertyId,
        notes: 'Me gusta mucho esta propiedad, tiene todo lo que busco',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Crear coincidencias automáticas
    await queryInterface.bulkInsert('matches', [
      {
        id_match: uuidv4(),
        user_id: userId,
        property_id: propertyId,
        search_id: searches[0]?.id_search || null,
        match_percentage: 85.5,
        match_criteria: JSON.stringify({
          price: 'match',
          location: 'match',
          bedrooms: 'match',
          bathrooms: 'partial'
        }),
        status: 'new',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Crear notificaciones
    await queryInterface.bulkInsert('notifications', [
      {
        id_notification: uuidv4(),
        user_id: userId,
        type: 'match',
        title: '¡Nueva coincidencia encontrada!',
        content: 'Hemos encontrado una propiedad que coincide con tu búsqueda en un 85%',
        data: JSON.stringify({
          property_id: propertyId,
          match_percentage: 85.5
        }),
        sent_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_notification: uuidv4(),
        user_id: userId,
        type: 'system',
        title: 'Bienvenido a ZonMatch',
        content: 'Tu cuenta ha sido configurada correctamente. ¡Comienza a explorar propiedades!',
        sent_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Crear mensajes de chat
    await queryInterface.bulkInsert('messages', [
      {
        id_message: uuidv4(),
        sender_id: userId,
        receiver_id: users[1]?.id_user || userId,
        property_id: propertyId,
        content: 'Hola, me interesa esta propiedad. ¿Podrías darme más información?',
        message_type: 'text',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    console.log('✅ Datos de prueba avanzados creados correctamente');
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar en orden inverso para evitar problemas de FK
    await queryInterface.bulkDelete('messages', null, {});
    await queryInterface.bulkDelete('notifications', null, {});
    await queryInterface.bulkDelete('matches', null, {});
    await queryInterface.bulkDelete('favorites', null, {});
    await queryInterface.bulkDelete('polygons', null, {});
    await queryInterface.bulkDelete('searches', null, {});
    
    console.log('✅ Datos de prueba avanzados eliminados correctamente');
  }
};

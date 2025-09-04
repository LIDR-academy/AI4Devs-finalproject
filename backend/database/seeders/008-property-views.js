'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener propiedades existentes
    const [properties] = await queryInterface.sequelize.query(
      'SELECT id_property, title FROM properties LIMIT 5'
    );

    // Obtener usuarios existentes
    const [users] = await queryInterface.sequelize.query(
      'SELECT id_user, first_name, last_name FROM users LIMIT 3'
    );

    if (properties.length === 0) {
      console.log('No hay propiedades para crear vistas');
      return;
    }

    const propertyViews = [];

    // Generar vistas para cada propiedad
    properties.forEach(property => {
      const propertyId = property.id_property;
      const title = property.title;

      // 5-15 vistas por propiedad
      const numViews = Math.floor(Math.random() * 11) + 5;

      for (let i = 0; i < numViews; i++) {
        // 70% de las vistas son de usuarios registrados, 30% anónimas
        const isRegisteredUser = Math.random() < 0.7;
        const user = isRegisteredUser && users.length > 0 
          ? users[Math.floor(Math.random() * users.length)]
          : null;

        // Generar IP aleatoria
        const ipAddress = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

        // User agents de ejemplo
        const userAgents = [
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ];

        // Fecha aleatoria en los últimos 30 días
        const daysAgo = Math.floor(Math.random() * 30);
        const viewedAt = new Date();
        viewedAt.setDate(viewedAt.getDate() - daysAgo);
        viewedAt.setHours(Math.floor(Math.random() * 24));
        viewedAt.setMinutes(Math.floor(Math.random() * 60));

        propertyViews.push({
          id_property_view: uuidv4(),
          property_id: propertyId,
          user_id: user ? user.id_user : null,
          ip_address: ipAddress,
          user_agent: userAgents[Math.floor(Math.random() * userAgents.length)],
          viewed_at: viewedAt
        });
      }
    });

    await queryInterface.bulkInsert('property_views', propertyViews, {});
    console.log(`✅ ${propertyViews.length} vistas de propiedades creadas`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('property_views', null, {});
  }
};

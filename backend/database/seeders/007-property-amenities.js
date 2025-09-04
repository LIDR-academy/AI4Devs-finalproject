'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener propiedades existentes
    const [properties] = await queryInterface.sequelize.query(
      'SELECT id_property, title, property_type FROM properties LIMIT 5'
    );

    // Obtener amenidades existentes
    const [amenities] = await queryInterface.sequelize.query(
      'SELECT id_amenity, name, category FROM amenities WHERE is_active = true'
    );

    if (properties.length === 0 || amenities.length === 0) {
      console.log('No hay propiedades o amenidades para crear relaciones');
      return;
    }

    const propertyAmenities = [];

    // Mapeo de tipos de propiedad a categorías de amenidades
    const propertyTypeAmenities = {
      'house': ['básicas', 'lujo', 'accesibilidad', 'tecnología'],
      'apartment': ['básicas', 'lujo', 'accesibilidad', 'tecnología', 'servicios'],
      'office': ['básicas', 'tecnología', 'servicios'],
      'commercial': ['básicas', 'tecnología', 'servicios'],
      'land': ['básicas']
    };

    properties.forEach(property => {
      const propertyId = property.id_property;
      const propertyType = property.property_type;
      
      // Obtener amenidades relevantes para este tipo de propiedad
      const relevantCategories = propertyTypeAmenities[propertyType] || ['básicas'];
      const relevantAmenities = amenities.filter(amenity => 
        relevantCategories.includes(amenity.category)
      );

      // Seleccionar 3-8 amenidades aleatorias para cada propiedad
      const numAmenities = Math.floor(Math.random() * 6) + 3; // 3-8 amenidades
      const selectedAmenities = relevantAmenities
        .sort(() => 0.5 - Math.random())
        .slice(0, numAmenities);

      selectedAmenities.forEach(amenity => {
        propertyAmenities.push({
          id_property_amenity: uuidv4(),
          property_id: propertyId,
          amenity_id: amenity.id_amenity,
          created_at: new Date()
        });
      });
    });

    await queryInterface.bulkInsert('property_amenities', propertyAmenities, {});
    console.log(`✅ ${propertyAmenities.length} relaciones propiedad-amenidad creadas`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('property_amenities', null, {});
  }
};

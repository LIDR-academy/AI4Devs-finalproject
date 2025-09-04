'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener propiedades existentes
    const [properties] = await queryInterface.sequelize.query(
      'SELECT id_property, title FROM properties LIMIT 5'
    );

    if (properties.length === 0) {
      console.log('No hay propiedades para agregar imágenes');
      return;
    }

    const propertyImages = [];

    // Imágenes para cada propiedad
    properties.forEach((property, index) => {
      const propertyId = property.id_property;
      const title = property.title;

      // Imagen principal
      propertyImages.push({
        id_property_image: uuidv4(),
        property_id: propertyId,
        url: `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop&crop=center`,
        cloudinary_id: `property_${propertyId}_main`,
        is_primary: true,
        order_index: 0,
        alt_text: `Imagen principal de ${title}`,
        created_at: new Date(),
        updated_at: new Date()
      });

      // Imágenes adicionales (2-4 por propiedad)
      const numImages = Math.floor(Math.random() * 3) + 2; // 2-4 imágenes adicionales
      
      for (let i = 1; i <= numImages; i++) {
        const imageUrls = [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800&h=600&fit=crop&crop=center'
        ];

        propertyImages.push({
          id_property_image: uuidv4(),
          property_id: propertyId,
          url: imageUrls[i % imageUrls.length],
          cloudinary_id: `property_${propertyId}_${i}`,
          is_primary: false,
          order_index: i,
          alt_text: `Imagen ${i} de ${title}`,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    });

    await queryInterface.bulkInsert('property_images', propertyImages, {});
    console.log(`✅ ${propertyImages.length} imágenes de propiedades creadas`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('property_images', null, {});
  }
};

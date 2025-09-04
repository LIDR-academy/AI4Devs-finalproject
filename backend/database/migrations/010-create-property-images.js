'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('property_images', {
      id_property_image: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      property_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'properties',
          key: 'id_property'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      url: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'URL de la imagen'
      },
      cloudinary_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'ID en Cloudinary para gestión'
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si es la imagen principal'
      },
      order_index: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Orden de las imágenes'
      },
      alt_text: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Text alternativo para accesibilidad'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Crear índices
    await queryInterface.addIndex('property_images', ['property_id'], {
      name: 'idx_property_images_property_id'
    });
    await queryInterface.addIndex('property_images', ['is_primary'], {
      name: 'idx_property_images_is_primary'
    });
    await queryInterface.addIndex('property_images', ['order_index'], {
      name: 'idx_property_images_order_index'
    });
    await queryInterface.addIndex('property_images', ['property_id', 'order_index'], {
      name: 'idx_property_images_property_order'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('property_images');
  }
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('amenities', {
      id_amenity: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Nombre de la amenidad'
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Categoría (básicas, lujo, accesibilidad, etc.)'
      },
      icon: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Ícono para la interfaz de usuario'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción de la amenidad'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Estado activo/inactivo'
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
    await queryInterface.addIndex('amenities', ['category'], {
      name: 'idx_amenities_category'
    });
    await queryInterface.addIndex('amenities', ['is_active'], {
      name: 'idx_amenities_is_active'
    });
    await queryInterface.addIndex('amenities', ['name'], {
      name: 'idx_amenities_name'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('amenities');
  }
};

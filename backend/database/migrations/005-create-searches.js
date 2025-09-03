'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('searches', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      property_type: {
        type: Sequelize.ENUM('house', 'apartment', 'office', 'land', 'commercial'),
        allowNull: true
      },
      operation_type: {
        type: Sequelize.ENUM('sale', 'rent', 'transfer'),
        allowNull: true
      },
      price_min: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      },
      price_max: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      },
      bedrooms_min: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      bathrooms_min: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      sq_meters_min: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      sq_meters_max: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      amenities: {
        type: Sequelize.JSON,
        allowNull: true
      },
      neighborhoods: {
        type: Sequelize.JSON,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      notification_frequency: {
        type: Sequelize.ENUM('immediate', 'daily', 'weekly'),
        allowNull: false,
        defaultValue: 'immediate'
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
    await queryInterface.addIndex('searches', ['user_id'], { name: 'idx_user_id' });
    await queryInterface.addIndex('searches', ['is_active'], { name: 'idx_is_active' });
    await queryInterface.addIndex('searches', ['property_type'], { name: 'idx_property_type' });
    await queryInterface.addIndex('searches', ['operation_type'], { name: 'idx_operation_type' });
    await queryInterface.addIndex('searches', ['price_min', 'price_max'], { name: 'idx_price_range' });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('searches');
  }
};

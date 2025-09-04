'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('property_amenities', {
      id_property_amenity: {
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
      amenity_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'amenities',
          key: 'id_amenity'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Crear índices
    await queryInterface.addIndex('property_amenities', ['property_id'], {
      name: 'idx_property_amenities_property_id'
    });
    await queryInterface.addIndex('property_amenities', ['amenity_id'], {
      name: 'idx_property_amenities_amenity_id'
    });
    await queryInterface.addIndex('property_amenities', ['property_id', 'amenity_id'], {
      name: 'idx_property_amenities_property_amenity',
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('property_amenities');
  }
};

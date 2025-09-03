'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('polygons', {
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
      search_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'searches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      coordinates: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Array de coordenadas [lat, lng] que forman el polígono'
      },
      color: {
        type: Sequelize.STRING(7),
        allowNull: false,
        defaultValue: '#FF0000'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    await queryInterface.addIndex('polygons', ['user_id'], { name: 'idx_user_id' });
    await queryInterface.addIndex('polygons', ['search_id'], { name: 'idx_search_id' });
    await queryInterface.addIndex('polygons', ['is_active'], { name: 'idx_is_active' });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('polygons');
  }
};

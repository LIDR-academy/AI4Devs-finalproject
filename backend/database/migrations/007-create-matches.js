'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('matches', {
      id_match: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id_user'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      search_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'searches',
          key: 'id_search'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      match_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        comment: 'Porcentaje de coincidencia (0-100)'
      },
      match_criteria: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Criterios que coincidieron (precio, ubicación, características)'
      },
      status: {
        type: Sequelize.ENUM('new', 'viewed', 'contacted', 'ignored'),
        allowNull: false,
        defaultValue: 'new'
      },
      notified_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Cuándo se notificó al usuario'
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
    await queryInterface.addIndex('matches', ['user_id'], { name: 'idx_user_id' });
    await queryInterface.addIndex('matches', ['property_id'], { name: 'idx_property_id' });
    await queryInterface.addIndex('matches', ['search_id'], { name: 'idx_search_id' });
    await queryInterface.addIndex('matches', ['status'], { name: 'idx_status' });
    await queryInterface.addIndex('matches', ['match_percentage'], { name: 'idx_match_percentage' });
    await queryInterface.addIndex('matches', ['notified_at'], { name: 'idx_notified_at' });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('matches');
  }
};

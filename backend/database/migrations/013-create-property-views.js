'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('property_views', {
      id_property_view: {
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
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id_user'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Usuario que vio la propiedad (opcional para usuarios no registrados)'
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'IP del visitante'
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User agent del navegador'
      },
      viewed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Cuándo se vio la propiedad'
      }
    });

    // Crear índices
    await queryInterface.addIndex('property_views', ['property_id'], {
      name: 'idx_property_views_property_id'
    });
    await queryInterface.addIndex('property_views', ['user_id'], {
      name: 'idx_property_views_user_id'
    });
    await queryInterface.addIndex('property_views', ['viewed_at'], {
      name: 'idx_property_views_viewed_at'
    });
    await queryInterface.addIndex('property_views', ['ip_address'], {
      name: 'idx_property_views_ip_address'
    });
    await queryInterface.addIndex('property_views', ['property_id', 'viewed_at'], {
      name: 'idx_property_views_property_date'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('property_views');
  }
};

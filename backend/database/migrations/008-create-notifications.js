'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notifications', {
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
      type: {
        type: Sequelize.ENUM('match', 'message', 'system', 'property_update'),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      data: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Datos adicionales de la notificación (IDs, URLs, etc.)'
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Cuándo se leyó la notificación'
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Cuándo se envió la notificación'
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
    await queryInterface.addIndex('notifications', ['user_id'], { name: 'idx_user_id' });
    await queryInterface.addIndex('notifications', ['type'], { name: 'idx_type' });
    await queryInterface.addIndex('notifications', ['read_at'], { name: 'idx_read_at' });
    await queryInterface.addIndex('notifications', ['sent_at'], { name: 'idx_sent_at' });
    await queryInterface.addIndex('notifications', ['user_id', 'read_at'], { name: 'idx_user_unread' });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notifications');
  }
};

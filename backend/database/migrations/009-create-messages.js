'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('messages', {
      id_message: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      sender_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id_user'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      receiver_id: {
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
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      message_type: {
        type: Sequelize.ENUM('text', 'image', 'file'),
        allowNull: false,
        defaultValue: 'text'
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Cuándo se leyó el mensaje'
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.addIndex('messages', ['sender_id'], { name: 'idx_sender_id' });
    await queryInterface.addIndex('messages', ['receiver_id'], { name: 'idx_receiver_id' });
    await queryInterface.addIndex('messages', ['property_id'], { name: 'idx_property_id' });
    await queryInterface.addIndex('messages', ['read_at'], { name: 'idx_read_at' });
    await queryInterface.addIndex('messages', ['is_deleted'], { name: 'idx_is_deleted' });
    await queryInterface.addIndex('messages', ['sender_id', 'receiver_id'], { name: 'idx_conversation' });
    await queryInterface.addIndex('messages', ['created_at'], { name: 'idx_created_at' });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('messages');
  }
};

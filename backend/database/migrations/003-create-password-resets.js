'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('password_resets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      token: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      used: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Crear índices
    await queryInterface.addIndex('password_resets', ['email'], {
      name: 'idx_password_resets_email'
    });
    await queryInterface.addIndex('password_resets', ['token'], {
      name: 'idx_password_resets_token'
    });
    await queryInterface.addIndex('password_resets', ['expires_at'], {
      name: 'idx_password_resets_expires_at'
    });
    await queryInterface.addIndex('password_resets', ['used'], {
      name: 'idx_password_resets_used'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('password_resets');
  }
};


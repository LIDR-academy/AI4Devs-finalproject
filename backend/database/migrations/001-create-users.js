'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id_user: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('user', 'agent', 'admin'),
        allowNull: false,
        defaultValue: 'user'
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      profile_picture: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      preferences: {
        type: Sequelize.JSON,
        allowNull: true
      },
      notification_settings: {
        type: Sequelize.JSON,
        allowNull: true
      },
      verification_status: {
        type: Sequelize.ENUM('pending', 'email_verified', 'phone_verified', 'id_verified', 'verified'),
        allowNull: false,
        defaultValue: 'pending'
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Crear índices (email y phone ya tienen índices únicos automáticos)
    await queryInterface.addIndex('users', ['role'], {
      name: 'idx_users_role'
    });
    await queryInterface.addIndex('users', ['is_active'], {
      name: 'idx_users_is_active'
    });
    await queryInterface.addIndex('users', ['verification_status'], {
      name: 'idx_users_verification_status'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};

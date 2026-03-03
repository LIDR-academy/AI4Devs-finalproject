'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('comentarios', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      reporteId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'reportes', // Nombre de la tabla de reportes
          key: 'id',
        },
      },
      usuarioId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'usuarios', // Nombre de la tabla de usuarios
          key: 'id',
        },
      },
      contenido: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      fechaCreacion: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('comentarios');
  }
};

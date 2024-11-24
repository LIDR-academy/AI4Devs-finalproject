'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('report_ratings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      reporteId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'reportes',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      ratingPromedio: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      cantidadRatings: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('report_ratings');
  }
};

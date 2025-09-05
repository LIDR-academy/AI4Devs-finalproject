'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Cambiar la columna url de VARCHAR(255) a LONGTEXT para soportar imágenes base64
    await queryInterface.changeColumn('property_images', 'url', {
      type: Sequelize.TEXT('long'),
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    // Revertir la columna url a VARCHAR(255)
    await queryInterface.changeColumn('property_images', 'url', {
      type: Sequelize.STRING(255),
      allowNull: false
    });
  }
};

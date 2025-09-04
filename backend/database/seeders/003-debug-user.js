'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Crear un usuario simple para debug
    const hashedPassword = await bcrypt.hash('test123', 12);
    
    const debugUser = {
      id_user: uuidv4(),
      email: 'test@test.com',
      password_hash: hashedPassword,
      role: 'user',
      first_name: 'Test',
      last_name: 'User',
      phone: '+525512345681',
      verification_status: 'verified',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Verificar si ya existe
    const existingUser = await queryInterface.sequelize.query(
      'SELECT id_user FROM users WHERE email = ?',
      {
        replacements: ['test@test.com'],
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );

    if (existingUser.length === 0) {
      await queryInterface.bulkInsert('users', [debugUser]);
      console.log('Usuario de debug creado: test@test.com / test123');
    } else {
      console.log('Usuario de debug ya existe');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', { email: 'test@test.com' });
  }
};


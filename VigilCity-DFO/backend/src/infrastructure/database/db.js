const { Sequelize } = require('sequelize');
require('dotenv').config(); // Asegúrate de cargar las variables de entorno

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
});

module.exports = sequelize; 

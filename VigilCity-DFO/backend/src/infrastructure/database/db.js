const { Sequelize } = require('sequelize');
const config = require('../../../config/environment');

const sequelize = new Sequelize(
    config.DB_CONFIG.database,
    config.DB_CONFIG.username,
    config.DB_CONFIG.password,
    {
        host: config.DB_CONFIG.host,
        port: config.DB_CONFIG.port,
        dialect: 'postgres',
        logging: config.NODE_ENV === 'development',
        dialectOptions: {
            ssl: config.NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        }
    }
);

// Test de conexión
sequelize.authenticate()
    .then(() => console.log('Conexión a la base de datos establecida correctamente.'))
    .catch(err => console.error('Error al conectar con la base de datos:', err));

module.exports = sequelize; 

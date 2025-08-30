import sequelize from '../config/database';
import User from './User';
import Property from './Property';
import PasswordReset from './PasswordReset';

// Configurar relaciones
User.hasMany(Property, { foreignKey: 'user_id', as: 'properties' });
Property.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Sincronizar modelos con la base de datos
export const syncDatabase = async (): Promise<void> => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Base de datos sincronizada correctamente');
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
    throw error;
  }
};

// Conectar a la base de datos
export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    throw error;
  }
};

export { User, Property };
export default sequelize;

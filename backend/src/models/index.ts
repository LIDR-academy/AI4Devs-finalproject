import sequelize from '../config/database';
import User from './User';
import Property from './Property';
import PasswordReset from './PasswordReset';
import Favorite from './Favorite';
import Search from './Search';
import Polygon from './Polygon';
import Match from './Match';
import Notification from './Notification';
import Message from './Message';

// Definir las relaciones entre modelos
User.hasMany(Property, { foreignKey: 'user_id', as: 'properties' });
Property.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });

User.hasMany(PasswordReset, { foreignKey: 'user_id', as: 'passwordResets' });
PasswordReset.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Relaciones de Favoritos
User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'favoriteUser' });
Property.hasMany(Favorite, { foreignKey: 'property_id', as: 'favorites' });
Favorite.belongsTo(Property, { foreignKey: 'property_id', as: 'favoriteProperty' });

// Relaciones de Búsquedas
User.hasMany(Search, { foreignKey: 'user_id', as: 'searches' });
Search.belongsTo(User, { foreignKey: 'user_id', as: 'searchUser' });

// Relaciones de Polígonos
User.hasMany(Polygon, { foreignKey: 'user_id', as: 'polygons' });
Polygon.belongsTo(User, { foreignKey: 'user_id', as: 'polygonUser' });
Search.hasMany(Polygon, { foreignKey: 'search_id', as: 'polygons' });
Polygon.belongsTo(Search, { foreignKey: 'search_id', as: 'polygonSearch' });

// Relaciones de Coincidencias
User.hasMany(Match, { foreignKey: 'user_id', as: 'matches' });
Match.belongsTo(User, { foreignKey: 'user_id', as: 'matchUser' });
Property.hasMany(Match, { foreignKey: 'property_id', as: 'matches' });
Match.belongsTo(Property, { foreignKey: 'property_id', as: 'matchProperty' });
Search.hasMany(Match, { foreignKey: 'search_id', as: 'matches' });
Match.belongsTo(Search, { foreignKey: 'search_id', as: 'matchSearch' });

// Relaciones de Notificaciones
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'notificationUser' });

// Relaciones de Mensajes
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'messageSender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'messageReceiver' });
Property.hasMany(Message, { foreignKey: 'property_id', as: 'messages' });
Message.belongsTo(Property, { foreignKey: 'property_id', as: 'messageProperty' });

export {
  sequelize,
  User,
  Property,
  PasswordReset,
  Favorite,
  Search,
  Polygon,
  Match,
  Notification,
  Message,
};

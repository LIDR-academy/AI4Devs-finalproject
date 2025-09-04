import { Model, DataTypes, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';
import User from './User';

interface NotificationAttributes {
  id_notification: string;
  user_id: string;
  type: 'match' | 'message' | 'system' | 'property_update';
  title: string;
  content: string;
  data?: any; // JSON con datos adicionales
  read_at?: Date;
  sent_at: Date;
  created_at: Date;
  updated_at: Date;
}

interface NotificationCreationAttributes extends Omit<NotificationAttributes, 'id_notification' | 'created_at' | 'updated_at'> {}

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public id_notification!: string;
  public user_id!: string;
  public type!: 'match' | 'message' | 'system' | 'property_update';
  public title!: string;
  public content!: string;
  public data?: any;
  public read_at?: Date;
  public sent_at!: Date;
  public created_at!: Date;
  public updated_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
  {
    id_notification: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4()
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id_user',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    type: {
      type: DataTypes.ENUM('match', 'message', 'system', 'property_update'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Datos adicionales de la notificación (IDs, URLs, etc.)',
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Cuándo se leyó la notificación',
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: 'Cuándo se envió la notificación',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['user_id'],
        name: 'idx_user_id',
      },
      {
        fields: ['type'],
        name: 'idx_type',
      },
      {
        fields: ['read_at'],
        name: 'idx_read_at',
      },
      {
        fields: ['sent_at'],
        name: 'idx_sent_at',
      },
      {
        fields: ['user_id', 'read_at'],
        name: 'idx_user_unread',
      },
    ],
  }
);

// Relaciones
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export default Notification;

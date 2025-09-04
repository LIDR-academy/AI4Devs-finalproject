import { Model, DataTypes, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';
import User from './User';
import Property from './Property';

interface MessageAttributes {
  id_message: string;
  sender_id: string;
  receiver_id: string;
  property_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  read_at?: Date;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

interface MessageCreationAttributes extends Omit<MessageAttributes, 'id_message' | 'created_at' | 'updated_at'> {}

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id_message!: string;
  public sender_id!: string;
  public receiver_id!: string;
  public property_id!: string;
  public content!: string;
  public message_type!: 'text' | 'image' | 'file';
  public read_at?: Date;
  public is_deleted!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Message.init(
  {
    id_message: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4()
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id_user',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    receiver_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id_user',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    property_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'properties',
        key: 'id_property',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    message_type: {
      type: DataTypes.ENUM('text', 'image', 'file'),
      allowNull: false,
      defaultValue: 'text',
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Cuándo se leyó el mensaje',
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: 'messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['sender_id'],
        name: 'idx_sender_id',
      },
      {
        fields: ['receiver_id'],
        name: 'idx_receiver_id',
      },
      {
        fields: ['property_id'],
        name: 'idx_property_id',
      },
      {
        fields: ['read_at'],
        name: 'idx_read_at',
      },
      {
        fields: ['is_deleted'],
        name: 'idx_is_deleted',
      },
      {
        fields: ['sender_id', 'receiver_id'],
        name: 'idx_conversation',
      },
      {
        fields: ['created_at'],
        name: 'idx_created_at',
      },
    ],
  }
);

// Relaciones
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });
Message.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

export default Message;

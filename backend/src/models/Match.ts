import { Model, DataTypes, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';
import User from './User';
import Property from './Property';
import Search from './Search';

interface MatchAttributes {
  id_match: string;
  user_id: string;
  property_id: string;
  search_id?: string;
  match_percentage: number;
  match_criteria: any; // JSON con criterios que coincidieron
  status: 'new' | 'viewed' | 'contacted' | 'ignored';
  notified_at?: Date;
  created_at: Date;
  updated_at: Date;
}

interface MatchCreationAttributes extends Omit<MatchAttributes, 'id_match' | 'created_at' | 'updated_at'> {}

class Match extends Model<MatchAttributes, MatchCreationAttributes> implements MatchAttributes {
  public id_match!: string;
  public user_id!: string;
  public property_id!: string;
  public search_id?: string;
  public match_percentage!: number;
  public match_criteria!: any;
  public status!: 'new' | 'viewed' | 'contacted' | 'ignored';
  public notified_at?: Date;
  public created_at!: Date;
  public updated_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Match.init(
  {
    id_match: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
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
    search_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'searches',
        key: 'id_search',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    match_percentage: {
      type: DataTypes.DECIMAL(5, 2), // 0.00 a 100.00
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
      comment: 'Porcentaje de coincidencia (0-100)',
    },
    match_criteria: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Criterios que coincidieron (precio, ubicación, características)',
    },
    status: {
      type: DataTypes.ENUM('new', 'viewed', 'contacted', 'ignored'),
      allowNull: false,
      defaultValue: 'new',
    },
    notified_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Cuándo se notificó al usuario',
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
    tableName: 'matches',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['user_id'],
        name: 'idx_user_id',
      },
      {
        fields: ['property_id'],
        name: 'idx_property_id',
      },
      {
        fields: ['search_id'],
        name: 'idx_search_id',
      },
      {
        fields: ['status'],
        name: 'idx_status',
      },
      {
        fields: ['match_percentage'],
        name: 'idx_match_percentage',
      },
      {
        fields: ['notified_at'],
        name: 'idx_notified_at',
      },
    ],
  }
);

// Relaciones
Match.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Match.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });
Match.belongsTo(Search, { foreignKey: 'search_id', as: 'search' });

export default Match;

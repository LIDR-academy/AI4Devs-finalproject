import { Model, DataTypes, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';
import User from './User';
import Search from './Search';

interface PolygonAttributes {
  id_polygon: string;
  user_id: string;
  search_id?: string;
  name: string;
  coordinates: any; // JSON con coordenadas del polígono
  color: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface PolygonCreationAttributes extends Omit<PolygonAttributes, 'id_polygon' | 'created_at' | 'updated_at'> {}

class Polygon extends Model<PolygonAttributes, PolygonCreationAttributes> implements PolygonAttributes {
  public id_polygon!: string;
  public user_id!: string;
  public search_id?: string;
  public name!: string;
  public coordinates!: any;
  public color!: string;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Polygon.init(
  {
    id_polygon: {
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    coordinates: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array de coordenadas [lat, lng] que forman el polígono',
    },
    color: {
      type: DataTypes.STRING(7), // #FF0000
      allowNull: false,
      defaultValue: '#FF0000',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'polygons',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['user_id'],
        name: 'idx_user_id',
      },
      {
        fields: ['search_id'],
        name: 'idx_search_id',
      },
      {
        fields: ['is_active'],
        name: 'idx_is_active',
      },
    ],
  }
);

// Relaciones
Polygon.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Polygon.belongsTo(Search, { foreignKey: 'search_id', as: 'search' });

export default Polygon;

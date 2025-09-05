import { Model, DataTypes, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';
import User from './User';

interface SearchAttributes {
  id_search: string;
  user_id: string;
  name: string;
  property_type?: 'house' | 'apartment' | 'office' | 'land' | 'commercial';
  operation_type?: 'sale' | 'rent' | 'transfer';
  price_min?: number;
  price_max?: number;
  bedrooms_min?: number;
  bathrooms_min?: number;
  sq_meters_min?: number;
  sq_meters_max?: number;
  amenities?: any; // JSON
  neighborhoods?: any; // JSON
  is_active: boolean;
  notification_frequency: 'immediate' | 'daily' | 'weekly';
  created_at: Date;
  updated_at: Date;
}

interface SearchCreationAttributes extends Omit<SearchAttributes, 'id_search' | 'created_at' | 'updated_at'> {}

class Search extends Model<SearchAttributes, SearchCreationAttributes> implements SearchAttributes {
  public id_search!: string;
  public user_id!: string;
  public name!: string;
  public property_type?: 'house' | 'apartment' | 'office' | 'land' | 'commercial';
  public operation_type?: 'sale' | 'rent' | 'transfer';
  public price_min?: number;
  public price_max?: number;
  public bedrooms_min?: number;
  public bathrooms_min?: number;
  public sq_meters_min?: number;
  public sq_meters_max?: number;
  public amenities?: any;
  public neighborhoods?: any;
  public is_active!: boolean;
  public notification_frequency!: 'immediate' | 'daily' | 'weekly';
  public created_at!: Date;
  public updated_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Search.init(
  {
    id_search: {
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    property_type: {
      type: DataTypes.ENUM('house', 'apartment', 'office', 'land', 'commercial'),
      allowNull: true,
    },
    operation_type: {
      type: DataTypes.ENUM('sale', 'rent', 'transfer'),
      allowNull: true,
    },
    price_min: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    price_max: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    bedrooms_min: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bathrooms_min: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sq_meters_min: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    sq_meters_max: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    neighborhoods: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    notification_frequency: {
      type: DataTypes.ENUM('immediate', 'daily', 'weekly'),
      allowNull: false,
      defaultValue: 'immediate',
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
    tableName: 'searches',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['user_id'],
        name: 'idx_user_id',
      },
      {
        fields: ['is_active'],
        name: 'idx_is_active',
      },
      {
        fields: ['property_type'],
        name: 'idx_property_type',
      },
      {
        fields: ['operation_type'],
        name: 'idx_operation_type',
      },
      {
        fields: ['price_min', 'price_max'],
        name: 'idx_price_range',
      },
    ],
  }
);

// Relaciones
Search.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export default Search;

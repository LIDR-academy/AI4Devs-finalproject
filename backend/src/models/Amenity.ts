import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AmenityAttributes {
  id_amenity: string;
  name: string;
  category: string;
  icon?: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface AmenityCreationAttributes extends Optional<AmenityAttributes, 'id_amenity' | 'icon' | 'description' | 'created_at' | 'updated_at'> {}

class Amenity extends Model<AmenityAttributes, AmenityCreationAttributes> implements AmenityAttributes {
  public id_amenity!: string;
  public name!: string;
  public category!: string;
  public icon?: string;
  public description?: string;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Amenity.init(
  {
    id_amenity: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'amenities',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export { Amenity, AmenityAttributes, AmenityCreationAttributes };

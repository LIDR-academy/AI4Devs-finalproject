import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PropertyImageAttributes {
  id_property_image: string;
  property_id: string;
  url: string;
  cloudinary_id?: string;
  is_primary: boolean;
  order_index: number;
  alt_text?: string;
  created_at: Date;
  updated_at: Date;
}

interface PropertyImageCreationAttributes extends Optional<PropertyImageAttributes, 'id_property_image' | 'cloudinary_id' | 'alt_text' | 'created_at' | 'updated_at'> {}

class PropertyImage extends Model<PropertyImageAttributes, PropertyImageCreationAttributes> implements PropertyImageAttributes {
  public id_property_image!: string;
  public property_id!: string;
  public url!: string;
  public cloudinary_id?: string;
  public is_primary!: boolean;
  public order_index!: number;
  public alt_text?: string;
  public created_at!: Date;
  public updated_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PropertyImage.init(
  {
    id_property_image: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    property_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'properties',
        key: 'id_property'
      }
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    cloudinary_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    alt_text: {
      type: DataTypes.STRING(255),
      allowNull: true
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
    tableName: 'property_images',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export { PropertyImage, PropertyImageAttributes, PropertyImageCreationAttributes };

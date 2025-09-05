import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PropertyAmenityAttributes {
  id_property_amenity: string;
  property_id: string;
  amenity_id: string;
  created_at: Date;
}

interface PropertyAmenityCreationAttributes extends Optional<PropertyAmenityAttributes, 'id_property_amenity' | 'created_at'> {}

class PropertyAmenity extends Model<PropertyAmenityAttributes, PropertyAmenityCreationAttributes> implements PropertyAmenityAttributes {
  public id_property_amenity!: string;
  public property_id!: string;
  public amenity_id!: string;
  public created_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
}

PropertyAmenity.init(
  {
    id_property_amenity: {
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
    amenity_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'amenities',
        key: 'id_amenity'
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'property_amenities',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  }
);

export { PropertyAmenity, PropertyAmenityAttributes, PropertyAmenityCreationAttributes };

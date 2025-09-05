import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PropertyViewAttributes {
  id_property_view: string;
  property_id: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  viewed_at: Date;
}

interface PropertyViewCreationAttributes extends Optional<PropertyViewAttributes, 'id_property_view' | 'user_id' | 'ip_address' | 'user_agent'> {}

class PropertyView extends Model<PropertyViewAttributes, PropertyViewCreationAttributes> implements PropertyViewAttributes {
  public id_property_view!: string;
  public property_id!: string;
  public user_id?: string;
  public ip_address?: string;
  public user_agent?: string;
  public viewed_at!: Date;
}

PropertyView.init(
  {
    id_property_view: {
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id_user'
      }
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    viewed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'property_views',
    timestamps: false
  }
);

export { PropertyView, PropertyViewAttributes, PropertyViewCreationAttributes };

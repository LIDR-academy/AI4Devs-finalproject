import { Model, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { PropertyType, OperationType, PropertyCondition, PropertyStatus } from '../types';
import sequelize from '../config/database';

class Property extends Model {
  public id_property!: string;
  public user_id!: string;
  public title!: string;
  public description?: string;
  public property_type!: PropertyType;
  public operation_type!: OperationType;
  public price!: number;
  public currency!: string;
  public price_per_sqm?: number;
  public bedrooms?: number;
  public bathrooms?: number;
  public total_bathrooms?: number;
  public sq_meters?: number;
  public sq_meters_land?: number;
  public floors?: number;
  public floor_number?: number;
  public parking_spaces?: number;
  public year_built?: number;
  public condition?: PropertyCondition;
  public address!: string;
  public neighborhood?: string;
  public city!: string;
  public state!: string;
  public zip_code?: string;
  public latitude?: number;
  public longitude?: number;
  public location_accuracy?: string;
  public amenities?: any;
  public status!: PropertyStatus;
  public featured!: boolean;
  public views_count!: number;
  public contact_count!: number;
  public last_updated!: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Property.init(
  {
    id_property: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4()
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id_user'
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    property_type: {
      type: DataTypes.ENUM(...Object.values(PropertyType)),
      allowNull: false
    },
    operation_type: {
      type: DataTypes.ENUM(...Object.values(OperationType)),
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'MXN'
    },
    price_per_sqm: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    total_bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    sq_meters: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    sq_meters_land: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    floors: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    floor_number: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    parking_spaces: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    year_built: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    condition: {
      type: DataTypes.ENUM(...Object.values(PropertyCondition)),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    neighborhood: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    zip_code: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    location_accuracy: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PropertyStatus)),
      allowNull: false,
      defaultValue: PropertyStatus.ACTIVE
    },
    featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    views_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    contact_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    last_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'properties',
    timestamps: true,
    underscored: true
  }
);

export default Property;

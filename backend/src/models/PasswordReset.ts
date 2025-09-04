import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database';

class PasswordReset extends Model {
  public id_password_reset!: string;
  public email!: string;
  public token!: string;
  public expires_at!: Date;
  public used!: boolean;
  public readonly created_at!: Date;
}

PasswordReset.init(
  {
    id_password_reset: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  },
  {
    sequelize,
    modelName: 'PasswordReset',
    tableName: 'password_resets',
    timestamps: false,
    underscored: true
  }
);

export default PasswordReset;


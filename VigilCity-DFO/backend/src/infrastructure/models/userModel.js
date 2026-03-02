const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/db'); // Asegúrate de importar la instancia de Sequelize

class User extends Model {}

User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    contraseña: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fechaRegistro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    rol: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'User',
    tableName: 'usuarios', // Nombre de la tabla en la base de datos
    timestamps: true, // Esto habilita las columnas createdAt y updatedAt automáticamente
});

module.exports = User;

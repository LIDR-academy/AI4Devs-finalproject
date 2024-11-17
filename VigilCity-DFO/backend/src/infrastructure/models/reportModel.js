const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/db'); // Asegúrate de importar la instancia de Sequelize

class Report extends Model {}

Report.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    usuarioId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'usuarios', // Nombre de la tabla de usuarios
            key: 'id',
        },
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    categoria: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    latitud: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    longitud: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    fechaCreacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
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
    modelName: 'Report',
    tableName: 'reportes', // Nombre de la tabla en la base de datos
    timestamps: true, // Si no deseas que Sequelize maneje createdAt y updatedAt
});

module.exports = Report;

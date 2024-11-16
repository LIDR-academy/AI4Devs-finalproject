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
    titulo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    fechaCreacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Report',
    tableName: 'reportes', // Nombre de la tabla en la base de datos
    timestamps: false, // Si no deseas que Sequelize maneje createdAt y updatedAt
});

module.exports = Report;

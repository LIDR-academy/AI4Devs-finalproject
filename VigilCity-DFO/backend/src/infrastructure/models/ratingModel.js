const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/db'); // Asegúrate de importar la instancia de Sequelize

class Rating extends Model {}

Rating.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    reporteId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'reportes', // Nombre de la tabla de reportes
            key: 'id',
        },
    },
    usuarioId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'usuarios', // Nombre de la tabla de usuarios
            key: 'id',
        },
    },
    valor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        },
    },
    comentario: {
        type: DataTypes.TEXT,
        allowNull: true, // Comentario opcional
    },
    fechaCreacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }, createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }, updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    modelName: 'Rating',
    tableName: 'ratings', // Nombre de la tabla en la base de datos
    timestamps: true, // Si no deseas que Sequelize maneje createdAt y updatedAt
});

module.exports = Rating;

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/db'); // Asegúrate de importar la instancia de Sequelize

class Comment extends Model {}

Comment.init({
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
    contenido: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    fechaCreacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    modelName: 'Comment',
    tableName: 'comentarios', // Nombre de la tabla en la base de datos
    timestamps: false, // Si no deseas que Sequelize maneje createdAt y updatedAt
});

module.exports = Comment;

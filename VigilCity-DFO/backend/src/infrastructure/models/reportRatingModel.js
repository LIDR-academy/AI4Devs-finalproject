const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/db');

class ReportRating extends Model {}

ReportRating.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    reporteId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
            model: 'reportes',
            key: 'id',
        },
    },
    ratingPromedio: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 5,
        },
    },
    cantidadRatings: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    modelName: 'ReportRating',
    tableName: 'report_ratings',
    timestamps: true,
});

module.exports = ReportRating;

const Report = require('../models/reportModel');
const Rating = require('../models/ratingModel');
const { Op } = require('sequelize');

const createReport = async (req, res) => {
    try {
        const { descripcion, direccion, latitud, longitud, categoria } = req.body;
        const usuarioId = req.userId; // Asegúrate de que el middleware de autenticación añade el id del usuario

        const newReport = await Report.create({
            descripcion,
            direccion,
            latitud,
            longitud,
            categoria,
            usuarioId,
        });

        return res.status(201).json(newReport);
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear el reporte', error });
    }
};

const deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.userId; // ID del usuario autenticado

        // Buscar el reporte por ID
        const report = await Report.findOne({ where: { id } });

        // Verificar si el reporte existe
        if (!report) {
            return res.status(404).json({ message: 'Reporte no encontrado' });
        }

        // Verificar si el usuario es el creador del reporte
        if (report.usuarioId !== usuarioId) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este reporte' });
        }

        // Eliminar el reporte
        await Report.destroy({ where: { id } });

        return res.status(204).send(); // No content
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar el reporte', error });
    }
};

const getReports = async (req, res) => {
    try {
        const { latitud, longitud, rango = 1 } = req.query; // Rango por defecto de 1 km

        // Validar que se envíen latitud y longitud
        if (!latitud || !longitud) {
            return res.status(400).json({ message: 'Latitud y longitud son requeridas.' });
        }

        // Convertir rango de kilómetros a metros
        const rangoEnMetros = rango * 1000;

        // Consultar reportes dentro del rango especificado
        const reports = await Report.findAll({
            where: {
                latitud: {
                    [Op.and]: [
                        { [Op.gte]: parseFloat(latitud) - (rangoEnMetros / 111320) }, // Latitud mínima
                        { [Op.lte]: parseFloat(latitud) + (rangoEnMetros / 111320) }, // Latitud máxima
                    ],
                },
                longitud: {
                    [Op.and]: [
                        { [Op.gte]: parseFloat(longitud) - (rangoEnMetros / (111320 * Math.cos(parseFloat(latitud) * (Math.PI / 180)))) }, // Longitud mínima
                        { [Op.lte]: parseFloat(longitud) + (rangoEnMetros / (111320 * Math.cos(parseFloat(latitud) * (Math.PI / 180)))) }, // Longitud máxima
                    ],
                },
            },
        });

        // Calcular la distancia lineal y agregarla a cada reporte
        const reportsWithDistanceAndRating = await Promise.all(reports.map(async report => {
            const distanciaLineal = calculateDistance(latitud, longitud, report.latitud, report.longitud);
            const ratings = await Rating.findAll({ where: { reporteId: report.id } });
            const averageRating = ratings.length > 0 
                ? ratings.reduce((acc, rating) => acc + rating.valor, 0) / ratings.length 
                : null; // Promedio de ratings

            return {
                ...report.toJSON(), // Convertir el reporte a JSON
                distanciaLineal,
                rating: averageRating, // Incluir el promedio de ratings
            };
        }));

        return res.status(200).json(reportsWithDistanceAndRating);
    } catch (error) {
        return res.status(500).json({ message: 'Error al consultar reportes', error });
    }
};

const getReportById = async (req, res) => {
    try {
        const { id } = req.params; // ID del reporte

        // Buscar el reporte por ID
        const report = await Report.findByPk(id);
        if (!report) {
            return res.status(404).json({ message: 'Reporte no encontrado' });
        }

        // Obtener ratings para el reporte
        const ratings = await Rating.findAll({ where: { reporteId: report.id } });
        const averageRating = ratings.length > 0 
            ? ratings.reduce((acc, rating) => acc + rating.valor, 0) / ratings.length 
            : null; // Promedio de ratings

        return res.status(200).json({
            ...report.toJSON(), // Convertir el reporte a JSON
            rating: averageRating, // Incluir el promedio de ratings
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener el reporte', error });
    }
};

// Función para calcular la distancia entre dos puntos geográficos
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * (Math.PI / 180); // Convertir grados a radianes
    const φ2 = lat2 * (Math.PI / 180);
    const Δφ = (lat2 - lat1) * (Math.PI / 180);
    const Δλ = (lon2 - lon1) * (Math.PI / 180);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
};

module.exports = { createReport, deleteReport, getReports, getReportById }; 

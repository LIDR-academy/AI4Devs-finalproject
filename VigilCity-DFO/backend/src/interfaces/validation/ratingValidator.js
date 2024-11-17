const { body, validationResult } = require('express-validator');

const validateRating = [
    body('reporteId').notEmpty().withMessage('El ID del reporte es obligatorio.'),
    body('valor').isInt({ min: 1, max: 5 }).withMessage('El valor debe estar entre 1 y 5.'),
    body('comentario').optional().isString().withMessage('El comentario debe ser un texto.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

// Validador para la edición de calificaciones
const validateRatingUpdate = [
    body('valor').optional().isInt({ min: 1, max: 5 }).withMessage('El valor debe estar entre 1 y 5.'),
    body('comentario').optional().isString().withMessage('El comentario debe ser un texto.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

module.exports = { validateRating, validateRatingUpdate }; 
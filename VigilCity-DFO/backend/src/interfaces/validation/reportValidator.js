const { body, validationResult } = require('express-validator');

const validateReport = [
    body('descripcion').notEmpty().withMessage('La descripción es obligatoria.'),
    body('latitud').isFloat().withMessage('La latitud debe ser un número.'),
    body('longitud').isFloat().withMessage('La longitud debe ser un número.'),
    body('categoria').notEmpty().withMessage('La categoría es obligatoria.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

module.exports = { validateReport }; 

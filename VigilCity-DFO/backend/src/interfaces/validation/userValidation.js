const { body } = require('express-validator');

const userValidation = {
    createUser: [
        body('nombre')
            .isString()
            .withMessage('El nombre debe ser una cadena de texto.')
            .notEmpty()
            .withMessage('El nombre es obligatorio.'),
        body('email')
            .isEmail()
            .withMessage('El correo electrónico no es válido.')
            .notEmpty()
            .withMessage('El correo electrónico es obligatorio.'),
        body('contraseña')
            .isString()
            .withMessage('La contraseña debe ser una cadena de texto.')
            .isLength({ min: 6 })
            .withMessage('La contraseña debe tener al menos 6 caracteres.'),
        body('rol')
            .isString()
            .withMessage('El rol debe ser una cadena de texto.')
            .notEmpty()
            .withMessage('El rol es obligatorio.'),
    ],
    updateUser: [
        body('nombre').optional().isString().withMessage('El nombre debe ser una cadena de texto.'),
        body('email').optional().isEmail().withMessage('El correo electrónico no es válido.'),
        body('contraseña').optional().isString().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
        body('rol').optional().isString().withMessage('El rol debe ser una cadena de texto.'),
    ],
};

module.exports = userValidation;

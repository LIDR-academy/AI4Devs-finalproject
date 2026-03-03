const express = require('express');
const UserController = require('../../infrastructure/controllers/userController'); // Asegúrate de que esta importación sea correcta
const userValidation = require('../validation/userValidation'); // Importar las validaciones
const { validationResult } = require('express-validator'); // Importar para manejar resultados de validación
const authMiddleware = require('../../middleware/authMiddleware'); // Importar el middleware

const router = express.Router();

// Middleware para manejar errores de validación
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array()); // Log para ver los errores de validación
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Ruta para obtener un usuario por ID (protegida)
router.get('/:id', authMiddleware, UserController.getUserById); // Asegúrate de que UserController.getUserById esté definido

// Ruta para obtener todos los usuarios
router.get('/', authMiddleware, UserController.getAllUsers); // Asegúrate de que UserController.getAllUsers esté definido

// Ruta para actualizar un usuario
router.put('/:id', authMiddleware, userValidation.updateUser, validate, UserController.updateUser); // Verifica que UserController.updateUser esté definido

// Ruta para eliminar un usuario
router.delete('/:id', authMiddleware, UserController.deleteUser); // Verifica que UserController.deleteUser esté definido

// Ruta para actualizar la contraseña
router.put('/:id/password', authMiddleware, userValidation.updatePassword, validate, UserController.updatePassword);

module.exports = router;

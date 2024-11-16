const express = require('express');
const UserService = require('../../application/user/userService');

const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post('/register', async (req, res) => {
    try {
        const user = await UserService.register(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Ruta para autenticar un usuario
router.post('/login', async (req, res) => {
    try {
        const { email, contraseña } = req.body;
        const { user, token } = await UserService.login(email, contraseña);
        res.status(200).json({ user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;

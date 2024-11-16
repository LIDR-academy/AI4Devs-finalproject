const UserService = require('../../application/user/userService');

class UserController {
    async getUserById(req, res) {
        try {
            const user = await UserService.getUserById(req.params.id);
            const { contraseña, ...userWithoutPassword } = user.dataValues || user;
            res.status(200).json(userWithoutPassword);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await UserService.getAllUsers();
            const usersWithoutPassword = users.map(({ id, nombre, email, fechaRegistro, rol, createdAt, updatedAt }) => ({
                id,
                nombre,
                email,
                fechaRegistro,
                rol,
                createdAt,
                updatedAt
            }));
            res.status(200).json(usersWithoutPassword);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateUser(req, res) {
        try {
            const updatedUser = await UserService.updateUser(req.params.id, req.body);
            const { contraseña, ...updatedUserWithoutPassword } = updatedUser.dataValues || updatedUser;
            res.status(200).json(updatedUserWithoutPassword);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteUser(req, res) {
        try {
            await UserService.deleteUser(req.params.id);
            res.status(204).send(); // No content
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updatePassword(req, res) {
        try {
            const { contraseña, nuevaContraseña } = req.body;
            const userId = req.params.id;

            // Llama al servicio para actualizar la contraseña
            const updatedUser = await UserService.updatePassword(userId, contraseña, nuevaContraseña);
            res.status(200).json({ message: 'Contraseña actualizada con éxito' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new UserController();

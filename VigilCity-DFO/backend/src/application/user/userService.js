const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../../domain/user/userRepository');

const JWT_SECRET = process.env.JWT_SECRET;

class UserService {
    async register(data) {
        const hashedPassword = await bcrypt.hash(data.contraseña, 10);
        const user = await UserRepository.createUser({ ...data, contraseña: hashedPassword });
        
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        return { user, token };
    }

    async login(email, contraseña) {
        const user = await UserRepository.getUserByEmail(email);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const isMatch = await bcrypt.compare(contraseña, user.contraseña);
        if (!isMatch) {
            throw new Error('Contraseña incorrecta');
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        return { user, token };
    }

    async getUserById(id) {
        const user = await UserRepository.getUserById(id); // Asegúrate de que esta función exista en tu repositorio
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        return user;
    }

    // Método para obtener todos los usuarios
    async getAllUsers() {
        return await UserRepository.getAllUsers(); // Asegúrate de que esta función exista en tu repositorio
    }

    async updatePassword(userId, contraseña, nuevaContraseña) {
        const user = await UserRepository.getUserById(userId); // Asegúrate de que esta función exista

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Verificar la contraseña actual
        const isMatch = await bcrypt.compare(contraseña, user.contraseña);
        if (!isMatch) {
            throw new Error('La contraseña actual es incorrecta');
        }

        // Hashear la nueva contraseña
        const hashedNewPassword = await bcrypt.hash(nuevaContraseña, 10);

        // Actualizar la contraseña en el repositorio
        await UserRepository.updatePassword(userId, hashedNewPassword); // Asegúrate de que esta función exista

        return user; // O devuelve el usuario actualizado si es necesario
    }
}

module.exports = new UserService();

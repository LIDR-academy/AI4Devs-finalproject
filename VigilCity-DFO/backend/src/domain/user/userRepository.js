const User = require('../../infrastructure/models/userModel'); // Importar el modelo de Usuario

class UserRepository {
    
    async getUserByEmail(email) {
        return await User.findOne({ where: { email } }); // Asegúrate de que esta función esté disponible
    }
    
    // Método para crear un nuevo usuario
    async createUser(data) {
        try {
            const user = await User.create(data);
            return user;
        } catch (error) {
            throw new Error('Error al crear el usuario: ' + error.message);
        }
    }

    // Método para obtener un usuario por ID
    async getUserById(id) {
        try {
            const user = await User.findByPk(id);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            return user;
        } catch (error) {
            throw new Error('Error al obtener el usuario: ' + error.message);
        }
    }

    // Método para obtener todos los usuarios
    async getAllUsers() {
        try {
            const users = await User.findAll();
            return users;
        } catch (error) {
            throw new Error('Error al obtener los usuarios: ' + error.message);
        }
    }

    // Método para actualizar un usuario
    async updateUser(id, data) {
        try {
            const user = await User.findByPk(id);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            await user.update(data);
            return user;
        } catch (error) {
            throw new Error('Error al actualizar el usuario: ' + error.message);
        }
    }

    // Método para eliminar un usuario
    async deleteUser(id) {
        try {
            const user = await User.findByPk(id);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            await user.destroy();
            return { message: 'Usuario eliminado con éxito' };
        } catch (error) {
            throw new Error('Error al eliminar el usuario: ' + error.message);
        }
    }
}

module.exports = new UserRepository(); 

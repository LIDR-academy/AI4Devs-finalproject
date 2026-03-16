const UserService = require('../../src/application/user/userService');
const UserRepository = require('../../src/domain/user/userRepository');

jest.mock('../../src/domain/user/userRepository'); // Mockear el repositorio

describe('UserService', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Limpiar los mocks después de cada prueba
    });

    test('debería crear un nuevo usuario', async () => {
        const userData = { nombre: 'Juan', email: 'juan@example.com', contraseña: '123456' };
        UserRepository.createUser.mockResolvedValue(userData); // Mockear la respuesta del repositorio

        const user = await UserService.createUser(userData);
        expect(user).toEqual(userData);
        expect(UserRepository.createUser).toHaveBeenCalledWith(userData);
    });

    test('debería obtener un usuario por ID', async () => {
        const userId = 'valid-uuid'; // Asegúrate de usar un UUID válido
        const userData = { id: userId, nombre: 'Juan', email: 'juan@example.com' };
        UserRepository.getUserById.mockResolvedValue(userData); // Mockear la respuesta del repositorio

        const user = await UserService.getUserById(userId);
        expect(user).toEqual(userData);
        expect(UserRepository.getUserById).toHaveBeenCalledWith(userId);
    });

    test('debería obtener todos los usuarios', async () => {
        const usersData = [{ id: '1', nombre: 'Juan' }, { id: '2', nombre: 'Ana' }];
        UserRepository.getAllUsers.mockResolvedValue(usersData); // Mockear la respuesta del repositorio

        const users = await UserService.getAllUsers();
        expect(users).toEqual(usersData);
        expect(UserRepository.getAllUsers).toHaveBeenCalled();
    });

    test('debería actualizar un usuario', async () => {
        const userId = 'valid-uuid'; // Asegúrate de usar un UUID válido
        const userData = { nombre: 'Juan Actualizado' };
        UserRepository.updateUser.mockResolvedValue({ id: userId, ...userData }); // Mockear la respuesta del repositorio

        const user = await UserService.updateUser(userId, userData);
        expect(user).toEqual({ id: userId, ...userData });
        expect(UserRepository.updateUser).toHaveBeenCalledWith(userId, userData);
    });

    test('debería eliminar un usuario', async () => {
        const userId = '1';
        UserRepository.deleteUser.mockResolvedValue({ message: 'Usuario eliminado con éxito' }); // Mockear la respuesta del repositorio

        const result = await UserService.deleteUser(userId);
        expect(result).toEqual({ message: 'Usuario eliminado con éxito' });
        expect(UserRepository.deleteUser).toHaveBeenCalledWith(userId);
    });
}); 

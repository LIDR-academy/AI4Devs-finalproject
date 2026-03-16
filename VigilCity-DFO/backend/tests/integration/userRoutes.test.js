const request = require('supertest');
const express = require('express');
const userRoutes = require('../../src/interfaces/http/userRoutes');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User API', () => {
    test('debería crear un nuevo usuario', async () => {
        const userId = uuidv4();
        const response = await request(app)
            .post('/api/users')
            .send({ 
                nombre: 'Juan', 
                email: 'juan@example.com', 
                contraseña: '123456', 
                rol: 'usuario'
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('nombre', 'Juan');
    });

    test('debería obtener un usuario por ID', async () => {
        const userId = uuidv4();
        const response = await request(app)
            .get(`/api/users/${userId}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', userId);
    });

    test('debería obtener todos los usuarios', async () => {
        const response = await request(app)
            .get('/api/users');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('debería actualizar un usuario', async () => {
        const userId = uuidv4();
        const response = await request(app)
            .put(`/api/users/${userId}`)
            .send({ nombre: 'Juan Actualizado' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('nombre', 'Juan Actualizado');
    });

    test('debería eliminar un usuario', async () => {
        const userId = uuidv4();
        const response = await request(app)
            .delete(`/api/users/${userId}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Usuario eliminado con éxito');
    });
}); 

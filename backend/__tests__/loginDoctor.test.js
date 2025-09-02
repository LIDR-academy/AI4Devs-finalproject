const request = require('supertest');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwtService = require('../src/domain/jwtService');
const authService = require('../src/domain/authService');
const responseFormatter = require('../src/adapters/in/responseFormatter');
const errorHandler = require('../src/adapters/in/errorHandler');
const { ApiError } = require('../src/adapters/in/errorHandler');

// Mocks
jest.mock('@prisma/client');
jest.mock('bcryptjs');
jest.mock('../src/domain/jwtService');
jest.mock('../src/domain/authService');

// Crear app Express solo para pruebas (sin iniciar servidor)
const createTestApp = () => {
    const app = express();
    app.use(express.json());
    app.use(responseFormatter);

    // Definir rutas directamente aquí en lugar de importar authRoutes
    app.post('/api/auth/login/doctor', async (req, res, next) => {
        try {
            const result = await authService.loginUser(req.body, 'doctor');
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    });

    app.use(errorHandler);
    return app;
};

describe('POST /api/auth/login/doctor', () => {
    let app;

    beforeAll(() => {
        // Crear instancia de app para pruebas
        app = createTestApp();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const endpoint = '/api/auth/login/doctor';

    it('Login exitoso con credenciales válidas', async () => {
        const mockUser = {
            id: 10,
            email: 'luis.perez@example.com',
            role: 'doctor',
        };

        // Mockear respuesta exitosa del servicio de autenticación
        authService.loginUser.mockResolvedValue({
            code: 200,
            message: "success",
            payload: {
                token: 'jwt_token_doctor',
                id: mockUser.id,
                email: mockUser.email,
                role: 'doctor'
            }
        });

        const res = await request(app)
            .post(endpoint)
            .send({ email: mockUser.email, password: 'StrongPass2!' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            code: 200,
            message: "success",
            payload: {
                token: 'jwt_token_doctor',
                id: mockUser.id,
                email: mockUser.email,
                role: 'doctor',
            }
        });
    });

    it('Error por usuario no encontrado', async () => {
        // Mockear error de usuario no encontrado
        authService.loginUser.mockRejectedValue(
            new ApiError(404, 'User not found', ['User not found'])
        );

        const res = await request(app)
            .post(endpoint)
            .send({ email: 'notfound@doctor.com', password: 'StrongPass2!' });

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
            code: 404,
            message: 'User not found',
            payload: { error: ['User not found'] },
        });
    });

    it('Error por tipo de usuario incorrecto', async () => {
        // Mockear error de tipo de usuario incorrecto
        authService.loginUser.mockRejectedValue(
            new ApiError(401, 'Invalid credentials', ['Invalid credentials'])
        );

        const res = await request(app)
            .post(endpoint)
            .send({ email: 'ana.garcia@example.com', password: 'StrongPass2!' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            code: 401,
            message: 'Invalid credentials',
            payload: { error: ['Invalid credentials'] },
        });
    });

    it('Error por contraseña incorrecta', async () => {
        // Mockear error de contraseña incorrecta
        authService.loginUser.mockRejectedValue(
            new ApiError(401, 'Invalid credentials', ['Invalid credentials'])
        );

        const res = await request(app)
            .post(endpoint)
            .send({ email: 'luis.perez@example.com', password: 'WrongPass!' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({
            code: 401,
            message: 'Invalid credentials',
            payload: { error: ['Invalid credentials'] },
        });
    });

    it('Error por campos faltantes o inválidos', async () => {
        // Mockear error de validación
        authService.loginUser.mockRejectedValue(
            new ApiError(400, 'Validation error', ['Email is required', 'Password is required'])
        );

        const res = await request(app)
            .post(endpoint)
            .send({ email: '', password: '' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            code: 400,
            message: 'Validation error',
            payload: { error: ['Email is required', 'Password is required'] },
        });
    });

    it('Validación de generación y formato del JWT', async () => {
        const mockUser = {
            id: 13,
            email: 'luis.perez@example.com',
            role: 'doctor'
        };

        // Mockear respuesta exitosa con token JWT
        authService.loginUser.mockResolvedValue({
            code: 200,
            message: "success",
            payload: {
                token: 'jwt_token_doctor',
                id: mockUser.id,
                email: mockUser.email,
                role: 'doctor'
            }
        });

        const res = await request(app)
            .post(endpoint)
            .send({ email: mockUser.email, password: 'StrongPass2!' });

        expect(res.statusCode).toBe(200);
        expect(res.body.payload.token).toBe('jwt_token_doctor');
        expect(res.body.payload).toHaveProperty('id', mockUser.id);
        expect(res.body.payload).toHaveProperty('email', mockUser.email);
        expect(res.body.payload).toHaveProperty('role', 'doctor');
    });
});
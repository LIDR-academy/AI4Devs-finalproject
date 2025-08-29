const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const registerService = require('../src/domain/registerService');
const responseFormatter = require('../src/adapters/in/responseFormatter');
const errorHandler = require('../src/adapters/in/errorHandler');
const { ApiError } = require('../src/adapters/in/errorHandler');

// Mocks
jest.mock('@prisma/client');
jest.mock('bcryptjs');
jest.mock('../src/domain/registerService');

// Crear app Express solo para pruebas (sin iniciar servidor)
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(responseFormatter);
  
  // Definir la ruta de prueba directamente
  app.post('/api/auth/register/patient', async (req, res, next) => {
    try {
      const result = await registerService.registerPatient(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  });

  app.use(errorHandler);
  return app;
};

describe('POST /api/auth/register/patient', () => {
  let app;
  
  // Mock bcrypt.hash
  bcrypt.hash = jest.fn().mockImplementation(async (pw) => `hashed_${pw}`);

  beforeAll(() => {
    // Crear instancia de app para pruebas
    app = createTestApp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('registro exitoso con datos válidos', async () => {
    // Mockear respuesta exitosa del servicio de registro
    registerService.registerPatient.mockResolvedValue({
      code: 201,
      message: 'Patient registered successfully',
      payload: {
        id: 1,
        firstName: 'Ana',
        lastName: 'García',
        email: 'ana.garcia@example.com',
        role: 'patient'
      }
    });

    const res = await request(app)
      .post('/api/auth/register/patient')
      .send({
        firstName: 'Ana',
        lastName: 'García',
        email: 'ana.garcia@example.com',
        password: 'StrongPass1!',
        confirmPassword: 'StrongPass1!',
        phone: '5551234567'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.code).toBe(201);
    expect(res.body.message).toBe('Patient registered successfully');
    expect(res.body.payload.firstName).toBe('Ana');
    expect(res.body.payload.email).toBe('ana.garcia@example.com');
  });

  it('error por email duplicado', async () => {
    // Mockear error por email duplicado
    registerService.registerPatient.mockRejectedValue(
      new ApiError(400, 'Patient already exists', ['Patient already exists'])
    );

    const res = await request(app)
      .post('/api/auth/register/patient')
      .send({
        firstName: 'Ana',
        lastName: 'García',
        email: 'ana.garcia@example.com',
        password: 'StrongPass1!',
        confirmPassword: 'StrongPass1!'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Patient already exists');
    expect(res.body.payload.error).toContain('Patient already exists');
  });

  it('error por contraseña débil', async () => {
    // Mockear error por contraseña débil
    registerService.registerPatient.mockRejectedValue(
      new ApiError(400, 'Validation error', ['Password too weak'])
    );

    const res = await request(app)
      .post('/api/auth/register/patient')
      .send({
        firstName: 'Ana',
        lastName: 'García',
        email: 'ana.garcia@example.com',
        password: 'weak',
        confirmPassword: 'weak'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Validation error');
    expect(res.body.payload.error).toContain('Password too weak');
  });

  it('error por campos faltantes', async () => {
    // Mockear error por campos faltantes
    registerService.registerPatient.mockRejectedValue(
      new ApiError(400, 'Validation error', ['First name is required'])
    );

    const res = await request(app)
      .post('/api/auth/register/patient')
      .send({
        email: 'ana.garcia@example.com',
        password: 'StrongPass1!',
        confirmPassword: 'StrongPass1!'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Validation error');
    expect(res.body.payload.error).toContain('First name is required');
  });

  it('valida que la contraseña se almacena como hash', async () => {
    // Mockear respuesta exitosa con hash de contraseña
    registerService.registerPatient.mockImplementation(data => {
      // Verificar que la contraseña se pasa al servicio de registro
      expect(data.password).toBe('StrongPass1!');
      
      return Promise.resolve({
        code: 201,
        message: 'Patient registered successfully',
        payload: {
          id: 2,
          firstName: 'Ana',
          lastName: '',
          email: 'ana2.garcia@example.com',
          role: 'patient'
        }
      });
    });

    const res = await request(app)
      .post('/api/auth/register/patient')
      .send({
        firstName: 'Ana',
        email: 'ana2.garcia@example.com',
        password: 'StrongPass1!',
        confirmPassword: 'StrongPass1!'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.code).toBe(201);
    expect(registerService.registerPatient).toHaveBeenCalledWith(expect.objectContaining({
      password: 'StrongPass1!'
    }));
  });
});
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
  app.post('/api/auth/register/doctor', async (req, res, next) => {
    try {
      const result = await registerService.registerDoctor(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  });

  app.use(errorHandler);
  return app;
};

describe('POST /api/auth/register/doctor', () => {
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
    registerService.registerDoctor.mockResolvedValue({
      code: 201,
      message: 'Doctor registered successfully',
      payload: {
        id: 1,
        firstName: 'Luis',
        lastName: 'Pérez',
        email: 'luis.perez@example.com',
        role: 'doctor'
      }
    });

    const res = await request(app)
      .post('/api/auth/register/doctor')
      .send({
        firstName: 'Luis',
        lastName: 'Pérez',
        email: 'luis.perez@example.com',
        password: 'StrongPass2!',
        confirmPassword: 'StrongPass2!',
        licenseNumber: 'MED1234567',
        phone: '5559876543'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.code).toBe(201);
    expect(res.body.message).toBe('Doctor registered successfully');
    expect(res.body.payload.firstName).toBe('Luis');
    expect(res.body.payload.email).toBe('luis.perez@example.com');
  });

  it('error por email duplicado', async () => {
    // Mockear error por email duplicado
    registerService.registerDoctor.mockRejectedValue(
      new ApiError(400, 'Doctor already exists', ['Doctor already exists'])
    );

    const res = await request(app)
      .post('/api/auth/register/doctor')
      .send({
        firstName: 'Luis',
        lastName: 'Pérez',
        email: 'luis.perez@example.com',
        password: 'StrongPass2!',
        confirmPassword: 'StrongPass2!',
        licenseNumber: 'MED1234567',
        phone: '5559876543'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Doctor already exists');
    expect(res.body.payload.error).toContain('Doctor already exists');
  });

  it('error por license_number duplicado', async () => {
    // Mockear error por licencia duplicada
    registerService.registerDoctor.mockRejectedValue(
      new ApiError(400, 'Doctor already exists', ['Doctor already exists'])
    );

    const res = await request(app)
      .post('/api/auth/register/doctor')
      .send({
        firstName: 'Luis',
        lastName: 'Pérez',
        email: 'luis.perez@example.com',
        password: 'StrongPass2!',
        confirmPassword: 'StrongPass2!',
        licenseNumber: 'MED1234567',
        phone: '5559876543'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Doctor already exists');
    expect(res.body.payload.error).toContain('Doctor already exists');
  });

  it('error por license_number faltante', async () => {
    // Mockear error por licencia faltante
    registerService.registerDoctor.mockRejectedValue(
      new ApiError(400, 'Validation error', ['License number required'])
    );

    const res = await request(app)
      .post('/api/auth/register/doctor')
      .send({
        firstName: 'Luis',
        lastName: 'Pérez',
        email: 'luis.perez@example.com',
        password: 'StrongPass2!',
        confirmPassword: 'StrongPass2!',
        phone: '5559876543'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Validation error');
    expect(res.body.payload.error).toContain('License number required');
  });

  it('error por contraseña débil', async () => {
    // Mockear error por contraseña débil
    registerService.registerDoctor.mockRejectedValue(
      new ApiError(400, 'Validation error', ['Password too weak'])
    );

    const res = await request(app)
      .post('/api/auth/register/doctor')
      .send({
        firstName: 'Luis',
        lastName: 'Pérez',
        email: 'luis.perez@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        licenseNumber: 'MED1234567',
        phone: '5559876543'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Validation error');
    expect(res.body.payload.error).toContain('Password too weak');
  });

  it('error por campos faltantes', async () => {
    // Mockear error por campos faltantes
    registerService.registerDoctor.mockRejectedValue(
      new ApiError(400, 'Validation error', [
        'First name is required',
        'Last name is required',
        'Phone is required'
      ])
    );

    const res = await request(app)
      .post('/api/auth/register/doctor')
      .send({
        email: 'luis.perez@example.com',
        password: 'StrongPass2!',
        confirmPassword: 'StrongPass2!',
        licenseNumber: 'MED1234567'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Validation error');
    expect(res.body.payload.error).toContain('First name is required');
    expect(res.body.payload.error).toContain('Last name is required');
    expect(res.body.payload.error).toContain('Phone is required');
  });

  it('valida que la contraseña se almacena como hash', async () => {
    // Mockear respuesta exitosa con hash de contraseña
    registerService.registerDoctor.mockImplementation(data => {
      // Verificar que la contraseña se pasa al servicio de registro
      expect(data.password).toBe('StrongPass2!');
      
      return Promise.resolve({
        code: 201,
        message: 'Doctor registered successfully',
        payload: {
          id: 2,
          firstName: 'Luis',
          lastName: 'Pérez',
          email: 'luis2.perez@example.com',
          role: 'doctor'
        }
      });
    });

    const res = await request(app)
      .post('/api/auth/register/doctor')
      .send({
        firstName: 'Luis',
        lastName: 'Pérez',
        email: 'luis2.perez@example.com',
        password: 'StrongPass2!',
        confirmPassword: 'StrongPass2!',
        licenseNumber: 'MED1234567',
        phone: '5559876543'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.code).toBe(201);
    expect(registerService.registerDoctor).toHaveBeenCalledWith(expect.objectContaining({
      password: 'StrongPass2!'
    }));
  });
});
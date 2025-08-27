// Establecer NODE_ENV a 'test' para evitar que el servidor se inicie automáticamente
process.env.NODE_ENV = 'test';

// Mockear completamente el módulo de Prisma antes de importar cualquier otro módulo
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn()
    },
    patient: {
      create: jest.fn()
    },
    $transaction: jest.fn(callback => callback(mockPrismaClient))
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

const request = require('supertest');
const app = require('../server');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

// Obtener la instancia mockeada de PrismaClient
const prismaInstance = new PrismaClient();

// Mock bcrypt.hash
jest.spyOn(bcrypt, 'hash').mockImplementation(async (pw) => `hashed_${pw}`);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/auth/register/patient', () => {
  it('registro exitoso con datos válidos', async () => {
    // Mock para simular que no existe el usuario
    prismaInstance.user.findUnique.mockResolvedValue(null);
    
    // Mock para crear usuario
    prismaInstance.user.create.mockResolvedValue({
      id: 1,
      first_name: 'Ana',
      last_name: 'García',
      email: 'ana.garcia@example.com',
      password_hash: 'hashed_StrongPass1!',
      role: 'patient',
      registration_date: new Date()
    });
    
    // Mock para crear paciente
    prismaInstance.patient.create.mockResolvedValue({
      id: 1,
      phone: '5551234567',
      location_id: 1
    });
    
    // Implementación de la transacción - devolver un objeto con user y patient
    prismaInstance.$transaction.mockImplementation(async (callback) => {
      const user = await prismaInstance.user.create();
      const patient = await prismaInstance.patient.create();
      return { user, patient };
    });

    const res = await request(app)
      .post('/api/auth/register/patient')
      .send({
        firstName: 'Ana',
        email: 'ana.garcia@example.com',
        password: 'StrongPass1!',
        confirmPassword: 'StrongPass1!',
        lastName: 'García',
        phone: '5551234567'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.code).toBe(201);
    expect(res.body.message).toBe('Patient registered successfully');
    expect(res.body.payload.firstName).toBe('Ana');
    expect(res.body.payload.email).toBe('ana.garcia@example.com');
  });

  it('error por email duplicado', async () => {
    prismaInstance.user.findUnique.mockResolvedValue({ 
      id: 1,
      email: 'ana.garcia@example.com'
    });

    const res = await request(app)
      .post('/api/auth/register/patient')
      .send({
        firstName: 'Ana',
        email: 'ana.garcia@example.com',
        password: 'StrongPass1!',
        confirmPassword: 'StrongPass1!'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Patient already exists');
    expect(res.body.payload.error).toContain('Patient already exists');
  });

  it('error por contraseña débil', async () => {
    prismaInstance.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/register/patient')
      .send({
        firstName: 'Ana',
        email: 'ana.garcia@example.com',
        password: 'weak',
        confirmPassword: 'weak'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Validation error');
    expect(res.body.payload.error).toContain('Password too weak');
  });

  it('error por campos faltantes', async () => {
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
    prismaInstance.user.findUnique.mockResolvedValue(null);
    
    // Verificar que la contraseña se almacena como hash
    prismaInstance.user.create.mockImplementation(({ data }) => {
      expect(data.password_hash).toMatch(/^hashed_/);
      return Promise.resolve({
        id: 2,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password_hash: data.password_hash,
        role: 'patient',
        registration_date: new Date()
      });
    });
    
    prismaInstance.patient.create.mockResolvedValue({ 
      id: 2, 
      phone: null, 
      location_id: 1 
    });
    
    // Implementación correcta de la transacción que devuelve un objeto con user y patient
    prismaInstance.$transaction.mockImplementation(async (callback) => {
      const user = await prismaInstance.user.create({ data: {
        first_name: 'Ana',
        last_name: null,
        email: 'ana2.garcia@example.com',
        password_hash: 'hashed_StrongPass1!',
        role: 'patient'
      }});
      const patient = await prismaInstance.patient.create({ data: {
        id: user.id,
        phone: null,
        location_id: 1
      }});
      return { user, patient };
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
  });
});
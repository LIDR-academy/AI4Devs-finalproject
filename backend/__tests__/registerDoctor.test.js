// Establecer NODE_ENV a 'test' para evitar que el servidor se inicie automáticamente
process.env.NODE_ENV = 'test';

// Mockear completamente el módulo de Prisma antes de importar cualquier otro módulo
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn()
    },
    doctor: {
      findFirst: jest.fn(),
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

describe('POST /api/auth/register/doctor', () => {
  it('registro exitoso con datos válidos', async () => {
    // Mock para simular que no existe el usuario ni el número de licencia
    prismaInstance.user.findUnique.mockResolvedValue(null);
    prismaInstance.doctor.findFirst.mockResolvedValue(null);
    
    // Mock para crear usuario
    prismaInstance.user.create.mockResolvedValue({
      id: 1,
      first_name: 'Luis',
      last_name: 'Pérez',
      email: 'luis.perez@example.com',
      password_hash: 'hashed_StrongPass2!',
      role: 'doctor',
      registration_date: new Date()
    });
    
    // Mock para crear doctor
    prismaInstance.doctor.create.mockResolvedValue({
      id: 1,
      license_number: 'MED1234567',
      phone: '5559876543',
      location_id: 1
    });
    
    // Implementación de la transacción - devolver un objeto con user y doctor
    prismaInstance.$transaction.mockImplementation(async (callback) => {
      const user = await prismaInstance.user.create();
      const doctor = await prismaInstance.doctor.create();
      return { user, doctor };
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
    prismaInstance.user.findUnique.mockResolvedValue({ 
      id: 1,
      email: 'luis.perez@example.com'
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

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Doctor already exists');
    expect(res.body.payload.error).toContain('Doctor already exists');
  });

  it('error por license_number duplicado', async () => {
    prismaInstance.user.findUnique.mockResolvedValue(null);
    prismaInstance.doctor.findFirst.mockResolvedValue({ 
      id: 2,
      license_number: 'MED1234567'
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

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Doctor already exists');
    expect(res.body.payload.error).toContain('Doctor already exists');
  });

  it('error por license_number faltante', async () => {
    prismaInstance.user.findUnique.mockResolvedValue(null);
    prismaInstance.doctor.findFirst.mockResolvedValue(null);

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
    prismaInstance.user.findUnique.mockResolvedValue(null);
    prismaInstance.doctor.findFirst.mockResolvedValue(null);

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
    prismaInstance.user.findUnique.mockResolvedValue(null);
    prismaInstance.doctor.findFirst.mockResolvedValue(null);
    
    // Verificar que la contraseña se almacena como hash
    prismaInstance.user.create.mockImplementation(({ data }) => {
      expect(data.password_hash).toMatch(/^hashed_/);
      return Promise.resolve({
        id: 2,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password_hash: data.password_hash,
        role: 'doctor',
        registration_date: new Date()
      });
    });
    
    prismaInstance.doctor.create.mockResolvedValue({
      id: 2,
      license_number: 'MED1234567',
      phone: '5559876543',
      location_id: 1
    });
    
    // Implementación correcta de la transacción que devuelve un objeto con user y doctor
    prismaInstance.$transaction.mockImplementation(async (callback) => {
      const user = await prismaInstance.user.create({ data: {
        first_name: 'Luis',
        last_name: 'Pérez',
        email: 'luis2.perez@example.com',
        password_hash: 'hashed_StrongPass2!',
        role: 'doctor'
      }});
      const doctor = await prismaInstance.doctor.create({ data: {
        id: user.id,
        license_number: 'MED1234567',
        phone: '5559876543',
        location_id: 1
      }});
      return { user, doctor };
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
  });
});
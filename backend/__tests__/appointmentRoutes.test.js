const request = require('supertest');
const express = require('express');
const appointmentService = require('../src/domain/appointmentService');
const responseFormatter = require('../src/adapters/in/responseFormatter');
const errorHandler = require('../src/adapters/in/errorHandler');
const appointmentRoutes = require('../src/adapters/in/appointmentRoutes');
const authMiddleware = require('../src/adapters/in/authMiddleware');
const { ApiError } = require('../src/adapters/in/errorHandler');

// Mock del servicio de dominio
jest.mock('../src/domain/appointmentService');

const validToken = 'Bearer valid.jwt.token';
const invalidToken = 'Bearer doctor.jwt.token';
const patientUser = { id: 1, email: 'patient@example.com', role: 'patient' };
const doctorId = 2;
const appointmentDate = '2025-09-10T10:00:00.000Z';

// Mock de autenticación para pruebas
jest.mock('../src/adapters/in/authMiddleware', () => {
  return jest.fn((req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader === validToken) {
      req.user = patientUser;
    } else if (authHeader === invalidToken) {
      req.user = { id: 99, email: 'doctor@example.com', role: 'doctor' };
    } else {
      req.user = null;
    }
    next();
  });
});

// Crear app Express solo para pruebas
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(authMiddleware); // Aplica el mock de autenticación
  app.use(responseFormatter);
  app.use('/api/appointments', appointmentRoutes);
  app.use(errorHandler);
  return app;
};

describe('POST /api/appointments', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Agendamiento exitoso
  it('debe agendar cita con datos válidos y usuario paciente autenticado', async () => {
    appointmentService.createAppointment.mockResolvedValue({
      id: 10,
      doctor_id: doctorId,
      patient_id: patientUser.id,
      appointment_date: appointmentDate,
      status: 'pending',
      reason: 'Consulta general'
    });

    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', validToken)
      .send({
        doctor_id: doctorId,
        appointment_date: appointmentDate,
        reason: 'Consulta general'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.code).toBe(201);
    expect(res.body.message).toBe('success');
    expect(res.body.payload).toMatchObject({
      doctor_id: doctorId,
      patient_id: patientUser.id,
      appointment_date: appointmentDate,
      status: 'pending',
      reason: 'Consulta general'
    });
  });

  // Agendar cita con reason vacío/nulo
  it('debe agendar cita con reason vacío', async () => {
    appointmentService.createAppointment.mockResolvedValue({
      id: 11,
      doctor_id: doctorId,
      patient_id: patientUser.id,
      appointment_date: appointmentDate,
      status: 'pending',
      reason: null
    });

    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', validToken)
      .send({
        doctor_id: doctorId,
        appointment_date: appointmentDate
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.payload.reason).toBeNull();
  });

  // Validaciones de entrada
  it('debe retornar error si doctor_id no es número', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', validToken)
      .send({
        doctor_id: 'abc',
        appointment_date: appointmentDate
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.payload.error).toContain('doctor_id must be a number');
  });

  it('debe retornar error si appointment_date no es fecha válida', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', validToken)
      .send({
        doctor_id: doctorId,
        appointment_date: 'invalid-date'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.payload.error).toContain('appointment_date must be a valid ISO date');
  });

  it('debe retornar error si la cita no es al inicio de la hora', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', validToken)
      .send({
        doctor_id: doctorId,
        appointment_date: '2025-09-10T10:30:00.000Z'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.payload.error).toContain('Appointments must be scheduled at the start of the hour (e.g., 10:00, 11:00)');
  });

  it('debe retornar error si la fecha está en el pasado', async () => {
    const pastDate = new Date(Date.now() - 3600000).toISOString();
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', validToken)
      .send({
        doctor_id: doctorId,
        appointment_date: pastDate
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.payload.error).toContain('Appointment date cannot be in the past');
  });

  it('debe retornar error si la fecha es mayor a 3 meses en el futuro', async () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 100).toISOString();
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', validToken)
      .send({
        doctor_id: doctorId,
        appointment_date: futureDate
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.payload.error).toContain('Appointment date cannot be more than 3 months in the future');
  });

  it('debe retornar error si reason supera el límite de caracteres', async () => {
    const longReason = 'a'.repeat(256);
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', validToken)
      .send({
        doctor_id: doctorId,
        appointment_date: appointmentDate,
        reason: longReason
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.payload.error).toContain('reason must be at most 255 characters');
  });

  // Autenticación y autorización
  it('debe retornar error si no hay JWT', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({
        doctor_id: doctorId,
        appointment_date: appointmentDate
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.payload.error).toContain('Only patients can schedule appointments');
  });

  it('debe retornar error si el usuario no es paciente', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', invalidToken)
      .send({
        doctor_id: doctorId,
        appointment_date: appointmentDate
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.payload.error).toContain('Only patients can schedule appointments');
  });

  // Disponibilidad y conflictos
  it('debe retornar error si el doctor ya tiene cita en ese horario', async () => {
    appointmentService.createAppointment.mockImplementation(() => {
      throw new ApiError(409, 'Time slot not available', ['Doctor already has an appointment at this time']);
    });

    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', validToken)
      .send({
        doctor_id: doctorId,
        appointment_date: appointmentDate
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.payload.error).toContain('Doctor already has an appointment at this time');
  });

  it('debe retornar error si el paciente ya tiene cita en ese horario', async () => {
    appointmentService.createAppointment.mockImplementation(() => {
      throw new ApiError(409, 'Time slot not available', ['Patient already has an appointment at this time']);
    });

    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', validToken)
      .send({
        doctor_id: doctorId,
        appointment_date: appointmentDate
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.payload.error).toContain('Patient already has an appointment at this time');
  });

  // Existencia y estado de entidades
  it('debe retornar error si el doctor no existe o está inactivo', async () => {
    appointmentService.createAppointment.mockImplementation(() => {
      throw new ApiError(404, 'Doctor not found', ['Doctor not found or inactive']);
    });

    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', validToken)
      .send({
        doctor_id: 999,
        appointment_date: appointmentDate
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.payload.error).toContain('Doctor not found or inactive');
  });

  it('debe retornar error si el paciente no existe o está inactivo', async () => {
    appointmentService.createAppointment.mockImplementation(() => {
      throw new ApiError(404, 'Patient not found', ['Patient not found or inactive']);
    });

    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', validToken)
      .send({
        doctor_id: doctorId,
        appointment_date: appointmentDate
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.payload.error).toContain('Patient not found or inactive');
  });

  // Formato de respuesta
  it('debe retornar respuesta en formato estándar', async () => {
    appointmentService.createAppointment.mockResolvedValue({
      id: 12,
      doctor_id: doctorId,
      patient_id: patientUser.id,
      appointment_date: appointmentDate,
      status: 'pending',
      reason: 'Chequeo'
    });

    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', validToken)
      .send({
        doctor_id: doctorId,
        appointment_date: appointmentDate,
        reason: 'Chequeo'
      });

    expect(res.body).toHaveProperty('code');
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('payload');
  });
});
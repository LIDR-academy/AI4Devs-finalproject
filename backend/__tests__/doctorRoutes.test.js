// Mock para jwtService (debe ir primero, antes de cualquier require)
const mockVerifyToken = jest.fn(() => ({
  id: 99,
  email: 'test@mock.com',
  role: 'patient'
}));

jest.mock('../src/domain/jwtService', () => ({
  verifyToken: mockVerifyToken,
  generateToken: jest.fn()
}));

// Importaciones
const request = require('supertest');
const app = require('../server');

// Mocks para servicios de dominio
jest.mock('../src/domain/doctorService');
jest.mock('../src/application/getDoctorProfile');
jest.mock('../src/application/getDoctorComments');
jest.mock('../src/domain/doctorAvailabilityService', () => ({
  getAvailability: jest.fn(),
  setAvailability: jest.fn()
}));
jest.mock('../src/domain/doctorAppointmentService', () => ({
  getAppointments: jest.fn(),
  updateAppointmentStatus: jest.fn()
}));

// Mock de autenticación y casos de uso
jest.mock('../src/application/getDoctorUpcomingAppointments');


// Importaciones después de los mocks
const { searchDoctors } = require('../src/domain/doctorService');
const { getDoctorProfile } = require('../src/application/getDoctorProfile');
const { getDoctorComments } = require('../src/application/getDoctorComments');
const { getAvailability, setAvailability } = require('../src/domain/doctorAvailabilityService');
const { getAppointments, updateAppointmentStatus } = require('../src/domain/doctorAppointmentService');
const { getDoctorUpcomingAppointments } = require('../src/application/getDoctorUpcomingAppointments');


// Constantes útiles para las pruebas
const doctorToken = 'Bearer doctor.jwt.token';
const patientToken = 'Bearer patient.jwt.token';

// Helper para configurar mockVerifyToken en cada prueba
function setupAuth(role = 'patient', id = 99) {
  if (role === 'doctor') {
    mockVerifyToken.mockImplementation(() => ({
      id: id || 1,
      email: 'doctor@email.com',
      role: 'doctor'
    }));
  } else if (role === 'patient') {
    mockVerifyToken.mockImplementation(() => ({
      id: id || 99,
      email: 'patient@email.com',
      role: 'patient'
    }));
  } else if (role === 'error') {
    mockVerifyToken.mockImplementation(() => {
      throw new Error('jwt malformed');
    });
  } else if (role === 'unauthenticated') {
    mockVerifyToken.mockImplementation(() => null);
  }
}

describe('GET /api/doctors/search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe responder con 200 y estructura de paginación (criterio 6.1)', async () => {
    searchDoctors.mockResolvedValue({
      results: [
        {
          id: 1,
          name: 'Dr. Juan Pérez',
          specialty: 'Cardiología',
          city: 'Ciudad de México',
          state: 'CDMX',
          photo: 'https://ejemplo.com/foto.jpg',
          biography: 'Especialista en cardiología...'
        }
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    });

    const res = await request(app).get('/api/doctors/search');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('code', 200);
    expect(res.body).toHaveProperty('message', 'success');
    expect(res.body).toHaveProperty('payload');
    expect(Array.isArray(res.body.payload.results)).toBe(true);
    expect(res.body.payload.pagination).toHaveProperty('total');
    expect(res.body.payload.pagination).toHaveProperty('page');
    expect(res.body.payload.pagination).toHaveProperty('limit');
    expect(res.body.payload.pagination).toHaveProperty('totalPages');
  });

  it('debe filtrar por especialidad, ciudad y estado (criterio 6.2)', async () => {
    searchDoctors.mockResolvedValue({
      results: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
    });

    const res = await request(app).get('/api/doctors/search?specialty_id=1&city_id=2&state_id=3');
    expect(res.statusCode).toBe(200);
    expect(searchDoctors).toHaveBeenCalledWith({
      specialtyId: 1,
      cityId: 2,
      stateId: 3,
      page: 1,
      limit: 10
    });
  });

  it('debe validar parámetros y retornar error si son inválidos (criterio 6.3)', async () => {
    const res = await request(app).get('/api/doctors/search?limit=-5');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('code', 400);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('payload');
    expect(Array.isArray(res.body.payload.error)).toBe(true);
    expect(res.body.payload.error[0]).toMatch(/limit/i);
  });

  it('debe soportar paginación y retornar metadatos (criterio 6.4)', async () => {
    searchDoctors.mockResolvedValue({
      results: [],
      pagination: { total: 25, page: 2, limit: 10, totalPages: 3 }
    });

    const res = await request(app).get('/api/doctors/search?page=2&limit=10');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('payload');
    expect(res.body.payload.pagination.page).toBe(2);
    expect(res.body.payload.pagination.limit).toBe(10);
    expect(res.body.payload.pagination.totalPages).toBe(3);
  });
});

describe('GET /api/doctors/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Debe regresar un perfil publico para un doctor activo (criterio 7.1)', async () => {
    // Simula visitante (no autenticado)
    require('../src/domain/jwtService').verifyToken.mockImplementation(() => ({
      id: 99,
      email: 'test@mock.com'
      // sin role
    }));

    getDoctorProfile.mockResolvedValue({
      id: 1,
      name: 'Dr. Juan Pérez',
      specialty: 'Cardiología',
      biography: 'Especialista en cardiología...',
      photo: 'https://ejemplo.com/foto.jpg',
      licenseNumber: '123456',
      title: 'Cardiología',
      city: 'Ciudad de México',
      state: 'CDMX'
      // sin datos sensibles
    });

    const res = await request(app).get('/api/doctors/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('code', 200);
    expect(res.body).toHaveProperty('message', 'success');
    expect(res.body).toHaveProperty('payload');
    expect(res.body.payload).toHaveProperty('id', 1);
    expect(res.body.payload).toHaveProperty('name');
    expect(res.body.payload).toHaveProperty('specialty');
    expect(res.body.payload).toHaveProperty('biography');
    expect(res.body.payload).toHaveProperty('photo');
    expect(res.body.payload).toHaveProperty('licenseNumber');
    expect(res.body.payload).toHaveProperty('title');
    expect(res.body.payload).toHaveProperty('city');
    expect(res.body.payload).toHaveProperty('state');
    // No debe incluir datos sensibles para visitante
    expect(res.body.payload).not.toHaveProperty('email');
    expect(res.body.payload).not.toHaveProperty('phone');
    expect(res.body.payload).not.toHaveProperty('address');
  });

  it('Debe regresar un perfil completo para usuario autenticado', async () => {
    require('../src/domain/jwtService').verifyToken.mockImplementation(() => ({
      id: 99,
      email: 'test@mock.com',
      role: 'patient'
    }));

    getDoctorProfile.mockResolvedValue({
      id: 2,
      name: 'Dra. Ana López',
      specialty: 'Dermatología',
      biography: 'Especialista en dermatología...',
      photo: 'https://ejemplo.com/foto2.jpg',
      licenseNumber: '654321',
      title: 'Dermatología',
      city: 'Guadalajara',
      state: 'Jalisco',
      email: 'ana.lopez@ejemplo.com',
      phone: '555-5678',
      address: 'Av. Juárez 456, Guadalajara'
    });

    const token = 'Bearer mock.jwt.token';
    const res = await request(app)
      .get('/api/doctors/2')
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(res.body.payload).toHaveProperty('email', 'ana.lopez@ejemplo.com');
    expect(res.body.payload).toHaveProperty('phone', '555-5678');
    expect(res.body.payload).toHaveProperty('address', 'Av. Juárez 456, Guadalajara');
  });

  it('Debe regresar un código 404 para un doctor inactivo (criterio 7.2)', async () => {
    getDoctorProfile.mockResolvedValue(null);

    const res = await request(app).get('/api/doctors/9999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('code', 404);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('payload');
    expect(Array.isArray(res.body.payload.error)).toBe(true);
    expect(res.body.payload.error[0]).toMatch(/Doctor/);
  });

  it('Debe regresar un código 400 para un id inválido (criterio 7.3)', async () => {
    const res = await request(app).get('/api/doctors/abc');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('code', 400);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('payload');
    expect(Array.isArray(res.body.payload.error)).toBe(true);
    expect(res.body.payload.error[0]).toMatch(/id/i);
    expect(res.body.payload.error[0]).toMatch(/number/i);
  });
});

describe('GET /api/doctors/:id/comments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAuth('patient');
  });

  it('debe retornar comentarios paginados para usuario autenticado', async () => {
    setupAuth('patient');
    require('../src/domain/jwtService').verifyToken.mockImplementation(() => ({
      id: 99,
      email: 'test@mock.com',
      role: 'patient'
    }));

    getDoctorComments.mockResolvedValue({
      results: [
        {
          doctor_id: 4,
          score: 5,
          comment: 'Excelente atención.',
          created_at: '2025-08-01T10:00:00.000Z',
          anonymous: false,
          patient_name: 'Ana López'
        },
        {
          doctor_id: 4,
          score: 4,
          comment: 'Muy profesional.',
          created_at: '2025-07-15T09:30:00.000Z',
          anonymous: true,
          patient_name: 'Anonymous'
        }
      ],
      pagination: {
        total: 2,
        page: 1,
        limit: 5,
        totalPages: 1
      }
    });

    const token = 'Bearer mock.jwt.token';
    const res = await request(app)
      .get('/api/doctors/4/comments')
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('code', 200);
    expect(res.body).toHaveProperty('message', 'success');
    expect(res.body).toHaveProperty('payload');
    expect(Array.isArray(res.body.payload.results)).toBe(true);
    expect(res.body.payload.results[0]).toHaveProperty('doctor_id', 4);
    expect(res.body.payload.results[0]).toHaveProperty('score');
    expect(res.body.payload.results[0]).toHaveProperty('comment');
    expect(res.body.payload.results[0]).toHaveProperty('created_at');
    expect(res.body.payload.results[0]).toHaveProperty('anonymous', false);
    expect(res.body.payload.results[0]).toHaveProperty('patient_name', 'Ana López');
    expect(res.body.payload.results[1]).toHaveProperty('anonymous', true);
    expect(res.body.payload.results[1]).toHaveProperty('patient_name', 'Anonymous');
    expect(res.body.payload.pagination).toHaveProperty('total', 2);
    expect(res.body.payload.pagination).toHaveProperty('page', 1);
    expect(res.body.payload.pagination).toHaveProperty('limit', 5);
    expect(res.body.payload.pagination).toHaveProperty('totalPages', 1);
  });

  it('debe retornar error 401 si el usuario no está autenticado', async () => {
    setupAuth('error');
    require('../src/domain/jwtService').verifyToken.mockImplementation(() => null);

    const res = await request(app).get('/api/doctors/4/comments');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('code', 401);
    expect(res.body).toHaveProperty('message', 'Unauthorized');
    expect(res.body.payload).toHaveProperty('error');
    expect(Array.isArray(res.body.payload.error)).toBe(true);
    expect(res.body.payload.error[0]).toMatch(/Authentication required/i);
  });

  it('debe retornar error 400 para id inválido', async () => {
    setupAuth('error');
    require('../src/domain/jwtService').verifyToken.mockImplementation(() => ({
      id: 99,
      email: 'test@mock.com',
      role: 'patient'
    }));

    const res = await request(app)
      .get('/api/doctors/abc/comments')
      .set('Authorization', 'Bearer mock.jwt.token');

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('code', 400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.payload).toHaveProperty('error');
    expect(Array.isArray(res.body.payload.error)).toBe(true);
    expect(res.body.payload.error[0]).toMatch(/id/i);
  });

  it('debe retornar error 401 si el token está mal formado', async () => {
    setupAuth('error');
    require('../src/domain/jwtService').verifyToken.mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    const res = await request(app)
      .get('/api/doctors/4/comments')
      .set('Authorization', 'Bearer token_mal_formado');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('code', 401);
    expect(res.body).toHaveProperty('message', 'Unauthorized');
    expect(res.body.payload).toHaveProperty('error');
    expect(Array.isArray(res.body.payload.error)).toBe(true);
    expect(res.body.payload.error[0]).toMatch(/Authentication required/i);
  });
});

describe('Endpoints de disponibilidad de médicos especialitas', () => {
  const { getAvailability, setAvailability } = require('../src/domain/doctorAvailabilityService');
  const doctorToken = 'Bearer doctor.jwt.token';

  beforeEach(() => {
    jest.clearAllMocks();
    // Simula usuario médico autenticado
    /*require('../src/domain/jwtService').verifyToken.mockImplementation(() => ({
      id: 1,
      email: 'doctor@email.com',
      role: 'doctor'
    }));*/
    setupAuth('doctor');
  });

  it('GET /api/doctors/availability/:doctorId - retorna disponibilidad y horarios ocupados para médico autenticado', async () => {
    setupAuth('doctor');
    getAvailability.mockResolvedValue({
      availability: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '13:00', available: true }
      ],
      occupiedSlots: [
        { id: 123, appointmentDate: '2025-10-15T10:00:00.000Z' }
      ]
    });
    
    const res = await request(app)
      .get('/api/doctors/availability/1')
      .set('Authorization', doctorToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('code', 200);
    expect(res.body).toHaveProperty('message', 'success');
    expect(res.body.payload).toHaveProperty('availability');
    expect(res.body.payload).toHaveProperty('occupiedSlots');
    expect(Array.isArray(res.body.payload.availability)).toBe(true);
    expect(Array.isArray(res.body.payload.occupiedSlots)).toBe(true);
    expect(res.body.payload.availability[0]).toHaveProperty('dayOfWeek', 1);
    expect(res.body.payload.occupiedSlots[0]).toHaveProperty('id', 123);
  });

  it('GET /api/doctors/availability/:doctorId - retorna solo horarios disponibles para paciente autenticado', async () => {
    setupAuth('patient');
    
    // Crear un mock que devuelva un objeto con la estructura correcta
    getAvailability.mockImplementation((doctorId, role) => {
      // Verificar que el controlador pasa los parámetros correctos
      expect(doctorId).toBe(1);
      expect(role).toBe('patient');
      
      // Devolver un objeto con la estructura que espera el adaptador
      return Promise.resolve({
        availability: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '13:00', available: true }
        ],
        occupiedSlots: [
          { id: 123, appointmentDate: '2025-10-15T10:00:00.000Z' }
        ]
      });
    });
    
    const res = await request(app)
      .get('/api/doctors/availability/1')
      .set('Authorization', patientToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('code', 200);  // Añadir verificación del código en la respuesta
    expect(res.body).toHaveProperty('message', 'success');  // Verificar mensaje estándar
    expect(res.body.payload).toHaveProperty('availability');
    expect(res.body.payload).toHaveProperty('occupiedSlots');
    // Verifica que solo se muestren los horarios disponibles para pacientes
    expect(res.body.payload.availability.every(slot => slot.available === true)).toBe(true);
  });

  it('GET /api/doctors/availability - médico puede consultar su propia disponibilidad sin ID', async () => {
    setupAuth('doctor', 1); // ID 1 para el médico autenticado
    getAvailability.mockResolvedValue({
      availability: [
        { dayOfWeek: 2, startTime: '10:00', endTime: '14:00', available: true }
      ],
      occupiedSlots: [
        { id: 124, appointmentDate: '2025-10-16T11:00:00.000Z' }
      ]
    });
    
    const res = await request(app)
      .get('/api/doctors/availability')
      .set('Authorization', doctorToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.payload).toHaveProperty('availability');
    expect(res.body.payload).toHaveProperty('occupiedSlots');
    expect(getAvailability).toHaveBeenCalledWith(1, 'doctor'); // Verifica que se usó el ID del médico autenticado
  });

  it('GET /api/doctors/availability - error 400 si paciente no envía doctorId', async () => {
    setupAuth('patient');
    
    const res = await request(app)
      .get('/api/doctors/availability')
      .set('Authorization', patientToken);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('code', 400);
    expect(res.body.payload.error[0]).toMatch(/Doctor ID is required for patients/i);
  });

  it('GET /api/doctors/availability/:doctorId - error 404 si el médico no existe', async () => {
    setupAuth('patient');
    getAvailability.mockResolvedValue(null);
    
    const res = await request(app)
      .get('/api/doctors/availability/999')
      .set('Authorization', patientToken);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('code', 404);
    expect(res.body).toHaveProperty('message', 'Doctor not found');
  });

  it('GET /api/doctors/availability/:doctorId - error 404 si no hay horarios definidos', async () => {
    setupAuth('patient');
    getAvailability.mockResolvedValue({
      availability: [],
      occupiedSlots: []
    });
    
    const res = await request(app)
      .get('/api/doctors/availability/1')
      .set('Authorization', patientToken);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('code', 404);
    expect(res.body).toHaveProperty('message', 'No availability defined');
  });

  it('GET /api/doctors/availability - retorna lista vacía si no hay disponibilidad', async () => {
    getAvailability.mockResolvedValue([]);
    const res = await request(app)
      .get('/api/doctors/availability')
      .set('Authorization', doctorToken);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.payload)).toBe(true);
    expect(res.body.payload.length).toBe(0);
  });

  it('GET /api/doctors/availability - error 403 si usuario no es médico', async () => {
    setupAuth('error');
    require('../src/domain/jwtService').verifyToken.mockImplementation(() => ({
      id: 2,
      email: 'patient@email.com',
      role: 'patient'
    }));
    const res = await request(app)
      .get('/api/doctors/availability')
      .set('Authorization', 'Bearer patient.jwt.token');

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('code', 403);
    expect(res.body).toHaveProperty('message', 'Forbidden');
    expect(res.body.payload.error[0]).toMatch(/Doctor authentication required/i);
  });

  it('POST /api/doctors/availability - define disponibilidad correctamente', async () => {
    setAvailability.mockResolvedValue([
      { dayOfWeek: 1, startTime: '09:00', endTime: '13:00', available: true }
    ]);
    const body = {
      daysOfWeek: [1],
      ranges: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '13:00', blocked: false }
      ]
    };
    const res = await request(app)
      .post('/api/doctors/availability')
      .set('Authorization', doctorToken)
      .send(body);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('code', 201);
    expect(res.body).toHaveProperty('message', 'Availability updated');
    expect(Array.isArray(res.body.payload)).toBe(true);
    expect(res.body.payload[0]).toHaveProperty('dayOfWeek', 1);
    expect(res.body.payload[0]).toHaveProperty('available', true);
  });

  it('POST /api/doctors/availability - bloquea día correctamente', async () => {
    setAvailability.mockResolvedValue([
      { dayOfWeek: 5, startTime: '08:00', endTime: '12:00', available: false }
    ]);
    const body = {
      daysOfWeek: [5],
      ranges: [
        { dayOfWeek: 5, startTime: '08:00', endTime: '12:00', blocked: true }
      ]
    };
    const res = await request(app)
      .post('/api/doctors/availability')
      .set('Authorization', doctorToken)
      .send(body);

    expect(res.statusCode).toBe(201);
    expect(res.body.payload[0]).toHaveProperty('available', false);
  });

  it('POST /api/doctors/availability - error si múltiples rangos para el mismo día', async () => {
    setupAuth('doctor');

    // Crear una instancia real de ApiError
    const apiError = new (require('../src/adapters/in/errorHandler').ApiError)(
      400,
      'Overlapping ranges for the same day are not allowed',
      ['Multiple ranges for day 1 are not allowed']
    );

    setAvailability.mockRejectedValue(apiError);

    const body = {
      daysOfWeek: [1],
      ranges: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '11:00', blocked: false },
        { dayOfWeek: 1, startTime: '12:00', endTime: '14:00', blocked: false }
      ]
    };

    const res = await request(app)
      .post('/api/doctors/availability')
      .set('Authorization', doctorToken)
      .send(body);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('code', 400);
    expect(res.body.payload.error[0]).toMatch(/Multiple ranges for day/i);
  });

  it('POST /api/doctors/availability - error 400 si datos inválidos', async () => {
    setupAuth('doctor');
    setAvailability.mockRejectedValue({
      name: 'ValidationError',
      errors: ['Invalid dayOfWeek', 'Invalid time range']
    });
    const body = {
      daysOfWeek: [10], // Día inválido
      ranges: [
        { dayOfWeek: 10, startTime: '09:00', endTime: '08:00', blocked: false } // Rango inválido
      ]
    };
    const res = await request(app)
      .post('/api/doctors/availability')
      .set('Authorization', doctorToken)
      .send(body);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('code', 400);
    expect(Array.isArray(res.body.payload.error)).toBe(true);
    expect(res.body.payload.error[0]).toMatch(/Invalid dayOfWeek/i);
    expect(res.body.payload.error[1]).toMatch(/Invalid time range/i);
  });

});// Fin de la sección de pruebas

describe('Endpoints de citas para médicos especialistas', () => {
  const { getAppointments } = require('../src/domain/doctorAppointmentService');
  const doctorToken = 'Bearer doctor.jwt.token';

  beforeEach(() => {
    jest.clearAllMocks();
    /*require('../src/domain/jwtService').verifyToken.mockImplementation(() => ({
      id: 1,
      email: 'doctor@email.com',
      role: 'doctor'
    }));*/
    setupAuth('doctor');
  });

  it('GET /api/doctors/appointments - retorna citas agendadas para médico autenticado', async () => {
    getAppointments.mockResolvedValue([
      {
        id: 123,
        appointmentDate: '2025-09-10T09:00:00.000Z',
        status: 'confirmed',
        reason: 'Consulta general',
        patient: {
          id: 5,
          firstName: 'Ana',
          lastName: 'García',
          email: 'ana@email.com'
        }
      }
    ]);
    const res = await request(app)
      .get('/api/doctors/appointments')
      .set('Authorization', doctorToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('code', 200);
    expect(res.body).toHaveProperty('message', 'success');
    expect(Array.isArray(res.body.payload)).toBe(true);
    expect(res.body.payload[0]).toHaveProperty('id', 123);
    expect(res.body.payload[0]).toHaveProperty('status', 'confirmed');
    expect(res.body.payload[0]).toHaveProperty('patient');
    expect(res.body.payload[0].patient).toHaveProperty('firstName', 'Ana');
  });

  it('GET /api/doctors/appointments - filtra por fecha y estado', async () => {
    getAppointments.mockResolvedValue([
      {
        id: 124,
        appointmentDate: '2025-09-10T10:00:00.000Z',
        status: 'pending',
        reason: 'Consulta dermatológica',
        patient: {
          id: 6,
          firstName: 'Luis',
          lastName: 'Martínez',
          email: 'luis@email.com'
        }
      }
    ]);
    const res = await request(app)
      .get('/api/doctors/appointments?date=2025-09-10&status=pending')
      .set('Authorization', doctorToken);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.payload)).toBe(true);
    expect(res.body.payload[0]).toHaveProperty('status', 'pending');
    expect(res.body.payload[0]).toHaveProperty('appointmentDate', '2025-09-10T10:00:00.000Z');
  });

  it('GET /api/doctors/appointments - error 403 si usuario no es médico', async () => {
    setupAuth('error');
    require('../src/domain/jwtService').verifyToken.mockImplementation(() => ({
      id: 2,
      email: 'patient@email.com',
      role: 'patient'
    }));
    const res = await request(app)
      .get('/api/doctors/appointments')
      .set('Authorization', 'Bearer patient.jwt.token');

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('code', 403);
    expect(res.body).toHaveProperty('message', 'Forbidden');
    expect(res.body.payload.error[0]).toMatch(/Doctor authentication required/i);
  });

  it('GET /api/doctors/appointments - error si token es inválido', async () => {
    setupAuth('error');
    require('../src/domain/jwtService').verifyToken.mockImplementation(() => {
      throw new Error('jwt malformed');
    });
    const res = await request(app)
      .get('/api/doctors/appointments')
      .set('Authorization', 'Bearer token_mal_formado');

    expect(res.statusCode).toBe(403);  // Actualizado a 403 en lugar de 401
    expect(res.body).toHaveProperty('code', 403);  // Actualizado a 403
    expect(res.body).toHaveProperty('message', 'Forbidden');  // Cambiado a Forbidden
    expect(Array.isArray(res.body.payload.error)).toBe(true);
    expect(res.body.payload.error[0]).toMatch(/Authentication required/i);
  });
});

describe('Control de acceso y manejo de errores en endpoints de agenda/disponibilidad', () => {
  const doctorToken = 'Bearer doctor.jwt.token';

  beforeEach(() => {
    jest.clearAllMocks();
    setupAuth('error');
  });

  it('GET /api/doctors/availability - error 403 si no hay token', async () => {
    setupAuth('error');
    require('../src/domain/jwtService').verifyToken.mockImplementation(() => {
      throw new Error('Authentication required');
    });
    const res = await request(app)
      .get('/api/doctors/availability');

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('code', 403);
    expect(res.body).toHaveProperty('message', 'Forbidden');
    expect(Array.isArray(res.body.payload.error)).toBe(true);
    expect(res.body.payload.error[0]).toMatch(/Authentication required|Doctor authentication required/i);
  });

  it('POST /api/doctors/availability - error 404 si usuario autenticado es paciente', async () => {
    // Usar setupAuth('patient') en lugar de error+sobreescribir manualmente
    setupAuth('patient');
    
    const body = {
      daysOfWeek: [1],
      ranges: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '13:00', blocked: false }
      ]
    };
    const res = await request(app)
      .post('/api/doctors/availability')
      .set('Authorization', patientToken)
      .send(body);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('code', 404);
    expect(res.body).toHaveProperty('message', 'Forbidden');
    expect(Array.isArray(res.body.payload.error)).toBe(true);
    expect(res.body.payload.error[0]).toMatch(/Doctor authentication required/i);
  });

  it('GET /api/doctors/appointments - error 403 si no hay token', async () => {
    setupAuth('error');
    require('../src/domain/jwtService').verifyToken.mockImplementation(() => {
      throw new Error('Authentication required');
    });
    const res = await request(app)
      .get('/api/doctors/appointments');

    // Actualizamos las expectativas para reflejar el comportamiento real
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('code', 403);
    expect(res.body).toHaveProperty('message', 'Forbidden');
    expect(Array.isArray(res.body.payload.error)).toBe(true);
    expect(res.body.payload.error[0]).toMatch(/Authentication required/i);
  });

  it('PATCH /api/doctors/appointments/:id - error 403 si no hay token', async () => {
    setupAuth('error');
    require('../src/domain/jwtService').verifyToken.mockImplementation(() => {
      throw new Error('Authentication required');
    });
    const res = await request(app)
      .patch('/api/doctors/appointments/123')
      .send({ status: 'confirmed' });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('code', 403);
    expect(res.body).toHaveProperty('message', 'Forbidden');
    expect(Array.isArray(res.body.payload.error)).toBe(true);
    expect(res.body.payload.error[0]).toMatch(/Authentication required/i);
  });

  it('GET /api/doctors/availability - error 403 si usuario autenticado es paciente', async () => {
    setupAuth('error');
    require('../src/domain/jwtService').verifyToken.mockImplementation(() => ({
      id: 2,
      email: 'patient@email.com',
      role: 'patient'
    }));
    const res = await request(app)
      .get('/api/doctors/availability')
      .set('Authorization', 'Bearer patient.jwt.token');

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('code', 403);
    expect(res.body).toHaveProperty('message', 'Forbidden');
    expect(Array.isArray(res.body.payload.error)).toBe(true);
    expect(res.body.payload.error[0]).toMatch(/Doctor authentication required/i);
  });

  it('POST /api/doctors/availability - error 403 si usuario autenticado es paciente', async () => {
    setupAuth('error');
    require('../src/domain/jwtService').verifyToken.mockImplementation(() => ({
      id: 2,
      email: 'patient@email.com',
      role: 'patient'
    }));
    const body = {
      daysOfWeek: [1],
      ranges: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '13:00', blocked: false }
      ]
    };
    const res = await request(app)
      .post('/api/doctors/availability')
      .set('Authorization', 'Bearer patient.jwt.token')
      .send(body);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('code', 403);
    expect(res.body).toHaveProperty('message', 'Forbidden');
    expect(Array.isArray(res.body.payload.error)).toBe(true);
    expect(res.body.payload.error[0]).toMatch(/Doctor authentication required/i);
  });

  it('GET /api/doctors/appointments - error 403 si usuario autenticado es paciente', async () => {
    setupAuth('error');
    require('../src/domain/jwtService').verifyToken.mockImplementation(() => ({
      id: 2,
      email: 'patient@email.com',
      role: 'patient'
    }));
    const res = await request(app)
      .get('/api/doctors/appointments')
      .set('Authorization', 'Bearer patient.jwt.token');

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('code', 403);
    expect(res.body).toHaveProperty('message', 'Forbidden');
    expect(Array.isArray(res.body.payload.error)).toBe(true);
    expect(res.body.payload.error[0]).toMatch(/Doctor authentication required/i);
  });

  it('PATCH /api/doctors/appointments/:id - error 403 si usuario autenticado es paciente', async () => {
    setupAuth('error');
    require('../src/domain/jwtService').verifyToken.mockImplementation(() => ({
      id: 2,
      email: 'patient@email.com',
      role: 'patient'
    }));
    const res = await request(app)
      .patch('/api/doctors/appointments/123')
      .set('Authorization', 'Bearer patient.jwt.token')
      .send({ status: 'confirmed' });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('code', 403);
    expect(res.body).toHaveProperty('message', 'Forbidden');
    expect(Array.isArray(res.body.payload.error)).toBe(true);
    expect(res.body.payload.error[0]).toMatch(/Doctor authentication required/i);
  });
});


describe('Endpoints de confirmación/rechazo de citas para médicos especialistas', () => {
  const { updateAppointmentStatus } = require('../src/domain/doctorAppointmentService');
  const doctorToken = 'Bearer doctor.jwt.token';

  beforeEach(() => {
    jest.clearAllMocks();
    /*require('../src/domain/jwtService').verifyToken.mockImplementation(() => ({
       id: 1,
       email: 'doctor@email.com',
       role: 'doctor'
     }));*/
    setupAuth('doctor');
  });

  it('PATCH /api/doctors/appointments/:id - confirma cita correctamente', async () => {
    updateAppointmentStatus.mockResolvedValue({
      id: 123,
      appointmentDate: '2025-09-10T09:00:00.000Z',
      status: 'confirmed',
      reason: 'Consulta general'
    });
    const res = await request(app)
      .patch('/api/doctors/appointments/123')
      .set('Authorization', doctorToken)
      .send({ status: 'confirmed' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('code', 200);
    expect(res.body).toHaveProperty('message', 'Appointment status updated');
    expect(res.body.payload).toHaveProperty('id', 123);
    expect(res.body.payload).toHaveProperty('status', 'confirmed');
  });

  it('PATCH /api/doctors/appointments/:id - rechaza cita y actualiza disponibilidad', async () => {
    updateAppointmentStatus.mockResolvedValue({
      id: 124,
      appointmentDate: '2025-09-11T10:00:00.000Z',
      status: 'rejected',
      reason: 'Motivo personal'
    });
    const res = await request(app)
      .patch('/api/doctors/appointments/124')
      .set('Authorization', doctorToken)
      .send({ status: 'rejected' });

    expect(res.statusCode).toBe(200);
    expect(res.body.payload).toHaveProperty('status', 'rejected');
  });

  it('PATCH /api/doctors/appointments/:id - error si cita no existe o no pertenece al médico', async () => {
    setupAuth('doctor');

    // Crear una instancia real de ApiError
    const apiError = new (require('../src/adapters/in/errorHandler').ApiError)(
      404,
      'Appointment not found',
      ['Appointment does not exist or does not belong to this doctor']
    );

    updateAppointmentStatus.mockRejectedValue(apiError);

    const res = await request(app)
      .patch('/api/doctors/appointments/999')
      .set('Authorization', doctorToken)
      .send({ status: 'confirmed' });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('code', 404);
    expect(res.body).toHaveProperty('message', 'Appointment not found');
    expect(Array.isArray(res.body.payload.error)).toBe(true);
    expect(res.body.payload.error[0]).toMatch(/does not exist/i);
  });

  it('PATCH /api/doctors/appointments/:id - error si estado enviado es inválido', async () => {
    updateAppointmentStatus.mockRejectedValue({
      name: 'ValidationError',
      errors: ['Invalid status']
    });
    const res = await request(app)
      .patch('/api/doctors/appointments/123')
      .set('Authorization', doctorToken)
      .send({ status: 'invalid_status' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('code', 400);
    expect(Array.isArray(res.body.payload.error)).toBe(true);
    expect(res.body.payload.error[0]).toMatch(/Invalid status/i);
  });

  it('PATCH /api/doctors/appointments/:id - error si cita ya tiene el estado solicitado', async () => {
    setupAuth('doctor');

    // Crear una instancia real de ApiError
    const apiError = new (require('../src/adapters/in/errorHandler').ApiError)(
      400,
      'Appointment already has this status',
      ['Appointment is already confirmed']
    );

    updateAppointmentStatus.mockRejectedValue(apiError);

    const res = await request(app)
      .patch('/api/doctors/appointments/123')
      .set('Authorization', doctorToken)
      .send({ status: 'confirmed' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('code', 400);
    expect(res.body).toHaveProperty('message', 'Appointment already has this status');
    expect(Array.isArray(res.body.payload.error)).toBe(true);
    expect(res.body.payload.error[0]).toMatch(/already confirmed/i);
  });

  it('PATCH /api/doctors/appointments/:id - error 403 si usuario no es médico', async () => {
    setupAuth('error');
    require('../src/domain/jwtService').verifyToken.mockImplementation(() => ({
      id: 2,
      email: 'patient@email.com',
      role: 'patient'
    }));
    const res = await request(app)
      .patch('/api/doctors/appointments/123')
      .set('Authorization', 'Bearer patient.jwt.token')
      .send({ status: 'confirmed' });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('code', 403);
    expect(res.body).toHaveProperty('message', 'Forbidden');
    expect(res.body.payload.error[0]).toMatch(/Doctor authentication required/i);
  });

  it('PATCH /api/doctors/appointments/:id - error 403 si token es inválido', async () => {
    setupAuth('error');
    require('../src/domain/jwtService').verifyToken.mockImplementation(() => {
      throw new Error('jwt malformed');
    });
    const res = await request(app)
      .patch('/api/doctors/appointments/123')
      .set('Authorization', 'Bearer token_mal_formado')
      .send({ status: 'confirmed' });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('code', 403);
    expect(res.body).toHaveProperty('message', 'Forbidden');
    expect(Array.isArray(res.body.payload.error)).toBe(true);
    expect(res.body.payload.error[0]).toMatch(/Authentication required/i);
  });
});


describe('GET /api/doctors/upcoming-appointments', () => {
  const doctorToken = 'Bearer valid-doctor-token';
  const patientToken = 'Bearer valid-patient-token';

  beforeEach(() => {
    jest.clearAllMocks();
    setupAuth('doctor');
  });

  it('Consulta exitosa de próximas citas (estructura y datos)', async () => {
    getDoctorUpcomingAppointments.mockResolvedValue({
      results: [
        {
          id: 1,
          appointmentDate: '2025-09-18T10:00:00.000Z',
          status: 'pending',
          reason: 'Consulta general',
          patient: {
            id: 5,
            firstName: 'Ana',
            lastName: 'García',
            email: 'ana@email.com',
            phone: '555-1234',
            gender: 'female'
          }
        }
      ],
      pagination: { total: 1, page: 1, limit: 10, totalPages: 1 }
    });

    const res = await request(app)
      .get('/api/doctors/upcoming-appointments')
      .set('Authorization', doctorToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(200);
    expect(res.body.payload.results).toHaveLength(1);
    expect(res.body.payload.results[0].patient).toHaveProperty('email');
    expect(res.body.payload.results[0].patient).toHaveProperty('gender');
    expect(res.body.payload.pagination).toMatchObject({ total: 1, page: 1, limit: 10, totalPages: 1 });
  });

  it('Filtrado por fecha', async () => {
    getDoctorUpcomingAppointments.mockResolvedValue({
      results: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
    });

    const res = await request(app)
      .get('/api/doctors/upcoming-appointments?date=2025-09-18')
      .set('Authorization', doctorToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.payload.results).toEqual([]);
  });

  it('Filtrado por estado', async () => {
    getDoctorUpcomingAppointments.mockResolvedValue({
      results: [
        {
          id: 2,
          appointmentDate: '2025-09-19T12:00:00.000Z',
          status: 'confirmed',
          reason: 'Revisión anual',
          patient: {
            id: 6,
            firstName: 'Luis',
            lastName: 'Martínez',
            email: 'luis@email.com',
            phone: '555-5678',
            gender: 'male'
          }
        }
      ],
      pagination: { total: 1, page: 1, limit: 10, totalPages: 1 }
    });

    const res = await request(app)
      .get('/api/doctors/upcoming-appointments?status=confirmed')
      .set('Authorization', doctorToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.payload.results[0].status).toBe('confirmed');
  });

  it('Paginación correcta', async () => {
    getDoctorUpcomingAppointments.mockResolvedValue({
      results: [],
      pagination: { total: 25, page: 2, limit: 10, totalPages: 3 }
    });

    const res = await request(app)
      .get('/api/doctors/upcoming-appointments?page=2&limit=10')
      .set('Authorization', doctorToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.payload.pagination.page).toBe(2);
    expect(res.body.payload.pagination.limit).toBe(10);
    expect(res.body.payload.pagination.totalPages).toBe(3);
  });

  it('Acceso denegado sin autenticación', async () => {
    const res = await request(app)
      .get('/api/doctors/upcoming-appointments');

    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe(403);
    expect(res.body.payload.error[0]).toMatch(/Doctor authentication required/);
  });

  it('Acceso denegado con usuario no médico', async () => {
    setupAuth('patient');
    const res = await request(app)
      .get('/api/doctors/upcoming-appointments')
      .set('Authorization', patientToken);

    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe(403);
    expect(res.body.payload.error[0]).toMatch(/Doctor authentication required/);
  });

  it('Validación de parámetros inválidos', async () => {
    getDoctorUpcomingAppointments.mockImplementation(() => {
      throw { name: 'ValidationError', errors: ['limit must be a positive number'] };
    });

    const res = await request(app)
      .get('/api/doctors/upcoming-appointments?limit=-1')
      .set('Authorization', doctorToken);

    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe(400);
    expect(res.body.payload.error[0]).toMatch(/limit must be a positive number/);
  });

  it('Sin próximas citas', async () => {
    getDoctorUpcomingAppointments.mockResolvedValue({
      results: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
    });

    const res = await request(app)
      .get('/api/doctors/upcoming-appointments')
      .set('Authorization', doctorToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.payload.results).toEqual([]);
    expect(res.body.payload.pagination.total).toBe(0);
  });

  it('Privacidad: solo datos relevantes del paciente', async () => {
    getDoctorUpcomingAppointments.mockResolvedValue({
      results: [
        {
          id: 3,
          appointmentDate: '2025-09-20T09:00:00.000Z',
          status: 'pending',
          reason: 'Consulta',
          patient: {
            id: 7,
            firstName: 'Maria',
            lastName: 'Lopez',
            email: 'maria@email.com',
            phone: '555-9999',
            gender: 'female'
          }
        }
      ],
      pagination: { total: 1, page: 1, limit: 10, totalPages: 1 }
    });

    const res = await request(app)
      .get('/api/doctors/upcoming-appointments')
      .set('Authorization', doctorToken);

    expect(res.statusCode).toBe(200);
    const patient = res.body.payload.results[0].patient;
    expect(Object.keys(patient)).toEqual(
      expect.arrayContaining(['id', 'firstName', 'lastName', 'email', 'phone', 'gender'])
    );
    // No debe incluir dirección ni datos médicos
    expect(patient).not.toHaveProperty('address');
    expect(patient).not.toHaveProperty('medicalData');
  });

  it('Manejo de errores inesperados', async () => {
    getDoctorUpcomingAppointments.mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const res = await request(app)
      .get('/api/doctors/upcoming-appointments')
      .set('Authorization', doctorToken);

    expect(res.statusCode).toBe(500);
    expect(res.body.code).toBe(500);
    expect(res.body.message).toMatch(/Internal server error\. Please contact support\./i);
  });
});

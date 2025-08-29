jest.mock('../src/domain/jwtService', () => ({
  verifyToken: jest.fn(() => ({
    id: 99,
    email: 'test@mock.com',
    role: 'patient'
  })),
  generateToken: jest.fn()
}));

const request = require('supertest');
jest.mock('../src/domain/doctorService'); // Mock del servicio de dominio
jest.mock('../src/application/getDoctorProfile'); // Mock del caso de uso
const { searchDoctors } = require('../src/domain/doctorService');
const { getDoctorProfile } = require('../src/application/getDoctorProfile');
const app = require('../server');


jest.mock('../src/domain/jwtService', () => ({
  verifyToken: jest.fn(() => ({
    id: 99,
    email: 'test@mock.com',
    role: 'patient'
  })),
  generateToken: jest.fn()
}));

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
    getDoctorProfile.mockResolvedValue({
      id: 1,
      name: 'Dr. Juan Pérez',
      specialty: 'Cardiología',
      biography: 'Especialista en cardiología...',
      photo: 'https://ejemplo.com/foto.jpg',
      licenseNumber: '123456',
      title: 'Cardiología',
      city: 'Ciudad de México',
      state: 'CDMX',
      email: 'juan.perez@ejemplo.com',
      phone: '555-1234',
      address: 'Av. Reforma 123, Ciudad de México'
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

    // Simula autenticación agregando un token válido
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

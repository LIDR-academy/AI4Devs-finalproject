const request = require('supertest');
jest.mock('../src/domain/doctorService'); // Mock del servicio de dominio
const { searchDoctors } = require('../src/domain/doctorService');
const app = require('../server');

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
    expect(res.body).toHaveProperty('results');
    expect(res.body).toHaveProperty('pagination');
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('limit');
    expect(res.body.pagination).toHaveProperty('totalPages');
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
    expect(res.body.error).toHaveProperty('type', 'ValidationError');
    expect(res.body.error).toHaveProperty('details');
  });

  it('debe soportar paginación y retornar metadatos (criterio 6.4)', async () => {
    searchDoctors.mockResolvedValue({
      results: [],
      pagination: { total: 25, page: 2, limit: 10, totalPages: 3 }
    });

    const res = await request(app).get('/api/doctors/search?page=2&limit=10');
    expect(res.statusCode).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(10);
    expect(res.body.pagination.totalPages).toBe(3);
  });
});
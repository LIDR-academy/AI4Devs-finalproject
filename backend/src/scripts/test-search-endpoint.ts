import { AppDataSource } from '../config/database';
import { seedPatient } from '../seeds/seed-patient';
import { Specialty } from '../models/specialty.entity';
import { logger } from '../utils/logger';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:4000';

async function testSearchEndpoint() {
  try {
    // Inicializar base de datos
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('✅ Base de datos conectada');
    }

    // Obtener token de paciente
    const { token } = await seedPatient();
    logger.info('✅ Token obtenido');

    // Obtener especialidades para usar en las pruebas
    const specialtyRepository = AppDataSource.getRepository(Specialty);
    const specialties = await specialtyRepository.find({ where: { isActive: true } });
    const cardiologia = specialties.find((s) => s.nameEs === 'Cardiología');

    if (!cardiologia) {
      throw new Error('No se encontró la especialidad de Cardiología');
    }

    logger.info('\n🧪 Iniciando pruebas del endpoint de búsqueda...\n');

    // Test 1: Búsqueda por coordenadas y especialidad
    logger.info('Test 1: Búsqueda por coordenadas (CDMX centro) y especialidad');
    try {
      const response1 = await axios.get(`${API_URL}/api/v1/doctors`, {
        params: {
          lat: 19.4326,
          lng: -99.1332,
          radius: 10,
          specialty: cardiologia.id,
          page: 1,
          limit: 20,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logger.info(`✅ Status: ${response1.status}`);
      logger.info(`✅ Médicos encontrados: ${response1.data.doctors.length}`);
      logger.info(`✅ Total: ${response1.data.pagination.total}`);
      if (response1.data.doctors.length > 0) {
        const doctor = response1.data.doctors[0];
        logger.info(`   - ${doctor.firstName} ${doctor.lastName}`);
        logger.info(`   - Distancia: ${doctor.distanceKm?.toFixed(2)} km`);
        logger.info(`   - Rating: ${doctor.ratingAverage}`);
      }
    } catch (error: any) {
      logger.error(`❌ Error: ${error.response?.data?.error || error.message}`);
    }

    logger.info('\n');

    // Test 2: Búsqueda por código postal
    logger.info('Test 2: Búsqueda por código postal');
    try {
      const response2 = await axios.get(`${API_URL}/api/v1/doctors`, {
        params: {
          postalCode: '06000',
          specialty: cardiologia.id,
          page: 1,
          limit: 20,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logger.info(`✅ Status: ${response2.status}`);
      logger.info(`✅ Médicos encontrados: ${response2.data.doctors.length}`);
      logger.info(`✅ Total: ${response2.data.pagination.total}`);
      if (response2.data.doctors.length > 0) {
        const doctor = response2.data.doctors[0];
        logger.info(`   - ${doctor.firstName} ${doctor.lastName}`);
        logger.info(`   - Dirección: ${doctor.address}`);
      }
    } catch (error: any) {
      logger.error(`❌ Error: ${error.response?.data?.error || error.message}`);
    }

    logger.info('\n');

    // Test 3: Búsqueda sin especialidad (todos los médicos)
    logger.info('Test 3: Búsqueda sin filtro de especialidad');
    try {
      const response3 = await axios.get(`${API_URL}/api/v1/doctors`, {
        params: {
          lat: 19.4326,
          lng: -99.1332,
          radius: 20,
          page: 1,
          limit: 20,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logger.info(`✅ Status: ${response3.status}`);
      logger.info(`✅ Médicos encontrados: ${response3.data.doctors.length}`);
      logger.info(`✅ Total: ${response3.data.pagination.total}`);
    } catch (error: any) {
      logger.error(`❌ Error: ${error.response?.data?.error || error.message}`);
    }

    logger.info('\n');

    // Test 4: Error - Sin token
    logger.info('Test 4: Intentar búsqueda sin token (debe fallar)');
    try {
      await axios.get(`${API_URL}/api/v1/doctors`, {
        params: {
          lat: 19.4326,
          lng: -99.1332,
          radius: 10,
        },
      });
      logger.error('❌ Debería haber fallado sin token');
    } catch (error: any) {
      if (error.response?.status === 401) {
        logger.info(`✅ Correctamente rechazado: ${error.response.status}`);
      } else {
        logger.error(`❌ Error inesperado: ${error.message}`);
      }
    }

    logger.info('\n');

    // Test 5: Error - Sin coordenadas ni código postal
    logger.info('Test 5: Intentar búsqueda sin coordenadas ni código postal (debe fallar)');
    try {
      await axios.get(`${API_URL}/api/v1/doctors`, {
        params: {
          specialty: cardiologia.id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      logger.error('❌ Debería haber fallado sin ubicación');
    } catch (error: any) {
      if (error.response?.status === 400) {
        logger.info(`✅ Correctamente rechazado: ${error.response.status}`);
        logger.info(`   Mensaje: ${error.response.data.error}`);
      } else {
        logger.error(`❌ Error inesperado: ${error.message}`);
      }
    }

    logger.info('\n✅ Pruebas completadas\n');
  } catch (error) {
    logger.error('❌ Error en pruebas:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

testSearchEndpoint();

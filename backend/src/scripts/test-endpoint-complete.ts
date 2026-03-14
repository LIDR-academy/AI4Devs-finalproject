import { AppDataSource } from '../config/database';
import { seedPatient } from '../seeds/seed-patient';
import { Specialty } from '../models/specialty.entity';
import { logger } from '../utils/logger';
import axios from 'axios';

const API_URL = 'http://localhost:4000';

async function waitForServer(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.get(`${API_URL}/api/v1/health`, { timeout: 2000 });
      if (response.status === 200) {
        return true;
      }
    } catch (error) {
      // Servidor no disponible aún
    }
    if (i < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return false;
}

async function testSearchEndpoint() {
  try {
    logger.info('⏳ Esperando a que el servidor esté disponible...');
    const serverReady = await waitForServer();
    
    if (!serverReady) {
      logger.error('❌ El servidor no está disponible después de 30 segundos');
      logger.info('Por favor, verifica que el servidor esté corriendo con: npm run dev');
      process.exit(1);
    }

    logger.info('✅ Servidor disponible\n');

    // Inicializar base de datos para obtener token
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Obtener token de paciente
    const { token } = await seedPatient();
    logger.info('✅ Token obtenido\n');

    // Obtener especialidades
    const specialtyRepository = AppDataSource.getRepository(Specialty);
    const specialties = await specialtyRepository.find({ where: { isActive: true } });
    const cardiologia = specialties.find((s) => s.nameEs === 'Cardiología');

    if (!cardiologia) {
      throw new Error('No se encontró la especialidad de Cardiología');
    }

    logger.info('🧪 Iniciando pruebas del endpoint de búsqueda...\n');

    // Test 1: Búsqueda por coordenadas y especialidad
    logger.info('📋 Test 1: Búsqueda por coordenadas (CDMX centro) y especialidad');
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
        timeout: 10000,
      });

      logger.info(`✅ Status: ${response1.status}`);
      logger.info(`✅ Médicos encontrados: ${response1.data.doctors.length}`);
      logger.info(`✅ Total: ${response1.data.pagination.total}`);
      if (response1.data.doctors.length > 0) {
        const doctor = response1.data.doctors[0];
        logger.info(`   - ${doctor.firstName} ${doctor.lastName}`);
        if (doctor.distanceKm !== undefined) {
          logger.info(`   - Distancia: ${doctor.distanceKm.toFixed(2)} km`);
        }
        logger.info(`   - Rating: ${doctor.ratingAverage || 'N/A'}`);
        logger.info(`   - Especialidades: ${doctor.specialties.map((s: any) => s.nameEs).join(', ')}`);
      }
    } catch (error: any) {
      logger.error(`❌ Error: ${error.response?.data?.error || error.message}`);
      if (error.response?.data) {
        logger.error(`   Detalles: ${JSON.stringify(error.response.data)}`);
      }
    }

    logger.info('\n');

    // Test 2: Búsqueda por código postal
    logger.info('📋 Test 2: Búsqueda por código postal');
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
        timeout: 10000,
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

    // Test 3: Búsqueda sin especialidad
    logger.info('📋 Test 3: Búsqueda sin filtro de especialidad (todos los médicos)');
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
        timeout: 10000,
      });

      logger.info(`✅ Status: ${response3.status}`);
      logger.info(`✅ Médicos encontrados: ${response3.data.doctors.length}`);
      logger.info(`✅ Total: ${response3.data.pagination.total}`);
      if (response3.data.doctors.length > 0) {
        logger.info(`   Primeros 3 médicos:`);
        response3.data.doctors.slice(0, 3).forEach((doctor: any) => {
          logger.info(`   - ${doctor.firstName} ${doctor.lastName} (${doctor.distanceKm?.toFixed(2) || 'N/A'} km)`);
        });
      }
    } catch (error: any) {
      logger.error(`❌ Error: ${error.response?.data?.error || error.message}`);
    }

    logger.info('\n');

    // Test 4: Error - Sin token
    logger.info('📋 Test 4: Intentar búsqueda sin token (debe fallar con 401)');
    try {
      await axios.get(`${API_URL}/api/v1/doctors`, {
        params: {
          lat: 19.4326,
          lng: -99.1332,
          radius: 10,
        },
        timeout: 10000,
      });
      logger.error('❌ Debería haber fallado sin token');
    } catch (error: any) {
      if (error.response?.status === 401) {
        logger.info(`✅ Correctamente rechazado: ${error.response.status}`);
        logger.info(`   Mensaje: ${error.response.data.error}`);
      } else {
        logger.error(`❌ Error inesperado: ${error.message}`);
      }
    }

    logger.info('\n');

    // Test 5: Error - Sin coordenadas ni código postal
    logger.info('📋 Test 5: Intentar búsqueda sin coordenadas ni código postal (debe fallar con 400)');
    try {
      await axios.get(`${API_URL}/api/v1/doctors`, {
        params: {
          specialty: cardiologia.id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
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

    logger.info('\n✅ Todas las pruebas completadas\n');
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

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

async function testWithRegistration() {
  console.log('⏳ Esperando a que el servidor esté disponible...');
  const serverReady = await waitForServer();
  
  if (!serverReady) {
    console.error('❌ El servidor no está disponible');
    process.exit(1);
  }

  console.log('✅ Servidor disponible\n');

  try {
    // Registrar un paciente para obtener token válido
    console.log('📝 Registrando paciente de prueba...');
    const registerResponse = await axios.post(`${API_URL}/api/v1/auth/register`, {
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'patient',
      recaptchaToken: 'test-token', // En desarrollo puede no validarse
    }, {
      timeout: 10000,
    });

    const token = registerResponse.data.accessToken;
    console.log('✅ Token obtenido del registro\n');

    // Test 1: Búsqueda por coordenadas
    console.log('📋 Test 1: Búsqueda por coordenadas (CDMX centro)');
    try {
      const response1 = await axios.get(`${API_URL}/api/v1/doctors`, {
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

      console.log(`✅ Status: ${response1.status}`);
      console.log(`✅ Médicos encontrados: ${response1.data.doctors.length}`);
      console.log(`✅ Total: ${response1.data.pagination.total}`);
      if (response1.data.doctors.length > 0) {
        console.log('\n   Primeros 3 médicos:');
        response1.data.doctors.slice(0, 3).forEach((doctor: any) => {
          console.log(`   - ${doctor.firstName} ${doctor.lastName}`);
          if (doctor.distanceKm !== undefined) {
            console.log(`     Distancia: ${doctor.distanceKm.toFixed(2)} km`);
          }
          console.log(`     Rating: ${doctor.ratingAverage || 'N/A'}`);
          console.log(`     Especialidades: ${doctor.specialties.map((s: any) => s.nameEs).join(', ')}`);
        });
      }
    } catch (error: any) {
      console.error(`❌ Error: ${error.response?.data?.error || error.message}`);
      if (error.response?.data) {
        console.error(`   Detalles: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }

    console.log('\n✅ Prueba completada\n');
  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

testWithRegistration();

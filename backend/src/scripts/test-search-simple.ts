import axios from 'axios';

const API_URL = 'http://localhost:4000';

// Primero necesitamos obtener un token de autenticación
// Por ahora, vamos a probar directamente con curl o crear un token manualmente

async function waitForServer(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.get(`${API_URL}/api/v1/health`);
      if (response.status === 200) {
        console.log('✅ Servidor disponible');
        return true;
      }
    } catch (error) {
      // Servidor no disponible aún
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

async function testEndpoint() {
  console.log('Esperando a que el servidor esté disponible...');
  const serverReady = await waitForServer();
  
  if (!serverReady) {
    console.error('❌ El servidor no está disponible después de 30 segundos');
    console.log('\nPor favor, inicia el servidor manualmente con: npm run dev');
    console.log('Luego ejecuta este script nuevamente o prueba con curl:');
    console.log('\ncurl -X GET "http://localhost:4000/api/v1/doctors?lat=19.4326&lng=-99.1332&radius=10" \\');
    console.log('  -H "Authorization: Bearer YOUR_TOKEN_HERE"');
    process.exit(1);
  }

  console.log('\n📋 Instrucciones para probar el endpoint:');
  console.log('\n1. Primero, obtén un token de autenticación registrando un paciente o usando el paciente de prueba:');
  console.log('   Email: patient@test.com');
  console.log('   Password: password123');
  console.log('\n2. Luego prueba el endpoint con:');
  console.log('\n   curl -X GET "http://localhost:4000/api/v1/doctors?lat=19.4326&lng=-99.1332&radius=10&specialty=SPECIALTY_ID" \\');
  console.log('     -H "Authorization: Bearer YOUR_TOKEN"');
  console.log('\n   O usando Postman/Insomnia con:');
  console.log('   GET http://localhost:4000/api/v1/doctors');
  console.log('   Headers: Authorization: Bearer YOUR_TOKEN');
  console.log('   Query params: lat=19.4326, lng=-99.1332, radius=10');
}

testEndpoint();

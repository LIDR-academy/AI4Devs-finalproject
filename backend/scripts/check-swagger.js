const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function checkSwaggerEndpoints() {
  console.log('🔍 Verificando endpoints de documentación de la API...\n');
  
  const endpoints = [
    { name: 'Health Check', url: `${BASE_URL}/health` },
    { name: 'API Info', url: `${BASE_URL}/api` },
    { name: 'Swagger JSON', url: `${BASE_URL}/api/docs.json` },
    { name: 'Swagger UI', url: `${BASE_URL}/api/docs` }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`⏳ Verificando ${endpoint.name}...`);
      const response = await axios.get(endpoint.url, {
        timeout: 5000,
        headers: {
          'Accept': endpoint.name === 'Swagger UI' ? 'text/html' : 'application/json'
        }
      });
      
      if (response.status === 200) {
        console.log(`✅ ${endpoint.name}: OK (${response.status})`);
        
        if (endpoint.name === 'Swagger JSON') {
          const data = response.data;
          console.log(`   📝 Título: ${data.info?.title}`);
          console.log(`   📝 Versión: ${data.info?.version}`);
          console.log(`   📝 Endpoints documentados: ${Object.keys(data.paths || {}).length}`);
        }
      } else {
        console.log(`⚠️  ${endpoint.name}: Código inesperado (${response.status})`);
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${endpoint.name}: Servidor no disponible`);
        console.log(`   💡 Asegúrate de que el servidor esté ejecutándose en ${BASE_URL}`);
      } else if (error.response) {
        console.log(`❌ ${endpoint.name}: Error ${error.response.status}`);
      } else {
        console.log(`❌ ${endpoint.name}: ${error.message}`);
      }
    }
    console.log('');
  }
  
  console.log('📚 Instrucciones:');
  console.log(`   1. Ejecuta 'npm run dev' para iniciar el servidor`);
  console.log(`   2. Visita ${BASE_URL}/api/docs para ver la documentación interactiva`);
  console.log(`   3. Usa ${BASE_URL}/api/docs.json para obtener el esquema OpenAPI`);
}

// Ejecutar verificación si el script se ejecuta directamente
if (require.main === module) {
  checkSwaggerEndpoints().catch(console.error);
}

module.exports = { checkSwaggerEndpoints }; 
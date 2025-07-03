/**
 * deploy-to-iis.js
 * Script para generar la aplicación Nuxt y prepararla para despliegue en IIS
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

// Función para imprimir mensajes con color
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Función para ejecutar comandos
function runCommand(command) {
  log(`Ejecutando: ${command}`, colors.blue);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`Error al ejecutar: ${command}`, colors.red);
    log(error.message, colors.red);
    return false;
  }
}

// Función para copiar archivo
function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    log(`Archivo copiado: ${destination}`, colors.green);
    return true;
  } catch (error) {
    log(`Error al copiar ${source} a ${destination}`, colors.red);
    log(error.message, colors.red);
    return false;
  }
}

// Función principal
async function main() {
  log('=== Iniciando proceso de despliegue para IIS ===', colors.green);
  
  // Paso 1: Construir la aplicación (sin prerenderizado)
  log('\n1. Construyendo la aplicación...', colors.yellow);
  if (!runCommand('npx nuxt build --preset=static')) {
    return;
  }
  
  // Paso 2: Verificar que la carpeta .output/public existe
  const outputDir = path.join(__dirname, '.output', 'public');
  if (!fs.existsSync(outputDir)) {
    log(`La carpeta ${outputDir} no existe. La construcción falló.`, colors.red);
    return;
  }
  
  // Paso 3: Renombrar 200.html a index.html
  log('\n2. Preparando archivos para IIS...', colors.yellow);
  const file200 = path.join(outputDir, '200.html');
  const fileIndex = path.join(outputDir, 'index.html');
  
  if (fs.existsSync(file200)) {
    copyFile(file200, fileIndex);
  } else {
    log('Archivo 200.html no encontrado. Verificando si index.html ya existe...', colors.yellow);
    if (!fs.existsSync(fileIndex)) {
      log('No se encontró ni 200.html ni index.html. La construcción parece incompleta.', colors.red);
      return;
    }
  }
  
  // Paso 4: Copiar web.config si existe
  const webConfigSource = path.join(__dirname, 'web.config');
  const webConfigDest = path.join(outputDir, 'web.config');
  
  if (fs.existsSync(webConfigSource)) {
    copyFile(webConfigSource, webConfigDest);
  } else {
    log('Archivo web.config no encontrado en la raíz del proyecto.', colors.yellow);
    log('Deberás crear manualmente un archivo web.config en la carpeta de despliegue.', colors.yellow);
  }
  
  // Paso 5: Verificar estructura de carpetas
  const nuxtDir = path.join(outputDir, '_nuxt');
  if (!fs.existsSync(nuxtDir)) {
    log('La carpeta _nuxt no existe en la salida. Esto puede causar problemas.', colors.red);
  } else {
    log('Carpeta _nuxt encontrada correctamente.', colors.green);
  }
  
  // Finalización
  log('\n=== Proceso de despliegue completado ===', colors.green);
  log('\nPara probar localmente, ejecuta:', colors.yellow);
  log('npx serve .output/public', colors.blue);
  log('\nPara desplegar en IIS:', colors.yellow);
  log('1. Copia todo el contenido de la carpeta .output/public a tu carpeta de despliegue en IIS', colors.blue);
  log('2. Asegúrate de que el sitio en IIS esté configurado para la ruta /consultcore/', colors.blue);
  log('3. Reinicia el sitio web en IIS', colors.blue);
}

// Ejecutar la función principal
main().catch(error => {
  log('Error inesperado:', colors.red);
  log(error.message, colors.red);
});

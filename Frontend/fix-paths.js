/**
 * fix-paths.js
 * Script para corregir las rutas en los archivos HTML generados
 */

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

// Función para corregir las rutas en un archivo HTML
function fixPathsInFile(filePath) {
  try {
    log(`Procesando archivo: ${filePath}`, colors.blue);
    
    // Leer el contenido del archivo
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Corregir las rutas a los recursos estáticos
    // Reemplazar todas las ocurrencias de src="/_nuxt/ por src="/consultcore/_nuxt/
    content = content.replace(/src=\"\/_nuxt\//g, 'src="/consultcore/_nuxt/');
    
    // Reemplazar todas las ocurrencias de href="/_nuxt/ por href="/consultcore/_nuxt/
    content = content.replace(/href=\"\/_nuxt\//g, 'href="/consultcore/_nuxt/');
    
    // Reemplazar todas las ocurrencias de "/_nuxt/ en scripts por "/consultcore/_nuxt/
    content = content.replace(/\"\/_nuxt\//g, '"/consultcore/_nuxt/');
    
    // Escribir el contenido modificado de vuelta al archivo
    fs.writeFileSync(filePath, content, 'utf8');
    
    log(`✅ Rutas corregidas en: ${filePath}`, colors.green);
    return true;
  } catch (error) {
    log(`❌ Error al procesar ${filePath}`, colors.red);
    log(error.message, colors.red);
    return false;
  }
}

// Función principal
function main() {
  const outputDir = path.join(__dirname, '.output', 'public');
  
  // Lista de archivos HTML a procesar
  const htmlFiles = [
    path.join(outputDir, 'index.html'),
    path.join(outputDir, '200.html'),
    path.join(outputDir, '404.html')
  ];
  
  log('=== Corrigiendo rutas en archivos HTML ===', colors.green);
  
  // Procesar cada archivo HTML
  let success = true;
  for (const file of htmlFiles) {
    if (fs.existsSync(file)) {
      if (!fixPathsInFile(file)) {
        success = false;
      }
    } else {
      log(`❌ Archivo no encontrado: ${file}`, colors.red);
      success = false;
    }
  }
  
  if (success) {
    log('\n✅ Todas las rutas han sido corregidas correctamente', colors.green);
  } else {
    log('\n❌ Hubo errores al corregir algunas rutas', colors.red);
  }
}

// Ejecutar la función principal
main();

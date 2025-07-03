/**
 * Script para actualizar las importaciones de vue-toastification a nuestro nuevo composable
 * Este script busca todas las importaciones de vue-toastification y las reemplaza por
 * importaciones de nuestro nuevo composable useToast
 */

const fs = require('fs');
const path = require('path');

// Directorios a escanear
const directories = [
  path.join(__dirname, '..', 'pages'),
  path.join(__dirname, '..', 'components'),
  path.join(__dirname, '..', 'stores'),
  path.join(__dirname, '..', 'layouts'),
];

// Patrones de importación a reemplazar
const importPatterns = [
  {
    pattern: /import\s+\{\s*useToast\s*\}\s+from\s+['"]vue-toastification['"];?/g,
    replacement: "import { useToast } from '../composables/useToast';"
  },
  {
    pattern: /import\s+\{\s*useToast\s*\}\s+from\s+['"]@\/composables\/useToast\.js['"];?/g,
    replacement: "import { useToast } from '../composables/useToast';"
  },
  {
    pattern: /import\s+\{\s*useToast\s*\}\s+from\s+['"]@\/composables\/useToast['"];?/g,
    replacement: "import { useToast } from '../composables/useToast';"
  }
];

// Función para procesar un archivo
function processFile(filePath) {
  // Solo procesar archivos .vue, .js y .ts
  if (!filePath.match(/\.(vue|js|ts)$/)) return;
  
  // Leer el contenido del archivo
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Aplicar los reemplazos
  importPatterns.forEach(({ pattern, replacement }) => {
    content = content.replace(pattern, replacement);
  });
  
  // Si el contenido cambió, escribir el archivo
  if (content !== originalContent) {
    console.log(`Actualizando importaciones en: ${filePath}`);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

// Función para escanear un directorio recursivamente
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath); // Recursión para subdirectorios
    } else {
      processFile(filePath);
    }
  });
}

// Ejecutar el script
console.log('Iniciando actualización de importaciones de toast...');
directories.forEach(scanDirectory);
console.log('Actualización completada.');

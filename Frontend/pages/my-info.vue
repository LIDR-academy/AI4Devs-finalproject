<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Encabezado -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Mi Información
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Revisa y gestiona tu información personal y profesional
        </p>
      </div>

      <!-- Contenido -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Información personal -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <UserIcon class="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
              Información personal
            </h2>
            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Nombre completo
                </h3>
                <p class="text-base text-gray-900 dark:text-white">
                  {{ authStore.user?.name || 'No especificado' }}
                </p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Correo electrónico
                </h3>
                <p class="text-base text-gray-900 dark:text-white">
                  {{ authStore.user?.email || 'No especificado' }}
                </p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Teléfono
                </h3>
                <p class="text-base text-gray-900 dark:text-white">
                  {{ authStore.user?.phone || 'No especificado' }}
                </p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Fecha de nacimiento
                </h3>
                <p class="text-base text-gray-900 dark:text-white">
                  {{ authStore.user?.birthdate || 'No especificado' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Información profesional -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BriefcaseIcon class="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
              Información profesional
            </h2>
            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Cargo
                </h3>
                <p class="text-base text-gray-900 dark:text-white">
                  {{ authStore.user?.position || 'No especificado' }}
                </p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Departamento
                </h3>
                <p class="text-base text-gray-900 dark:text-white">
                  {{ authStore.user?.department || 'No especificado' }}
                </p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Rol
                </h3>
                <p class="text-base text-gray-900 dark:text-white">
                  {{ authStore.user?.role || 'No especificado' }}
                </p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Fecha de ingreso
                </h3>
                <p class="text-base text-gray-900 dark:text-white">
                  {{ authStore.user?.joinDate || 'No especificado' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Documentos -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <DocumentTextIcon class="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
          Mis documentos
        </h2>
        
        <div v-if="documents.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          No hay documentos disponibles
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="(doc, index) in documents" :key="index">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <component :is="getDocumentIcon(doc.type)" class="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <span class="text-sm text-gray-900 dark:text-white">{{ doc.name }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-500 dark:text-gray-400">{{ doc.type }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(doc.date) }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 mr-3">
                    Ver
                  </button>
                  <button class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
                    Descargar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Habilidades -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <AcademicCapIcon class="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
          Habilidades y certificaciones
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Habilidades -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Habilidades
            </h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="(skill, index) in skills" :key="index" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {{ skill }}
              </span>
              <button class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                <PlusIcon class="w-4 h-4 mr-1" />
                Añadir
              </button>
            </div>
          </div>
          
          <!-- Certificaciones -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Certificaciones
            </h3>
            <div class="space-y-3">
              <div v-for="(cert, index) in certifications" :key="index" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ cert.name }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ cert.issuer }} - {{ cert.year }}</p>
                </div>
                <BadgeCheckIcon class="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <button class="w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <PlusIcon class="w-4 h-4 mr-1" />
                Añadir certificación
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { 
  UserIcon,
  DocumentIcon,
  ChartBarIcon,
  PlusIcon,
  InformationCircleIcon,
  CogIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline';

// Reutilizamos iconos disponibles
const BriefcaseIcon = UserIcon;
const DocumentTextIcon = DocumentIcon;
const TableIcon = ChartBarIcon;
const PresentationChartLineIcon = ChartBarIcon;
const AcademicCapIcon = UserIcon;
const BadgeCheckIcon = CogIcon;

const authStore = useAuthStore();

// Documentos simulados
const documents = ref([
  {
    name: 'Contrato laboral',
    type: 'PDF',
    date: new Date(2023, 1, 15),
  },
  {
    name: 'Evaluación de desempeño 2024',
    type: 'DOCX',
    date: new Date(2024, 5, 10),
  },
  {
    name: 'Reporte de actividades Q1',
    type: 'XLSX',
    date: new Date(2024, 3, 5),
  },
  {
    name: 'Presentación de proyecto',
    type: 'PPTX',
    date: new Date(2024, 4, 20),
  }
]);

// Habilidades simuladas
const skills = ref([
  'Gestión de proyectos',
  'Análisis de datos',
  'Comunicación efectiva',
  'Liderazgo',
  'Resolución de problemas'
]);

// Certificaciones simuladas
const certifications = ref([
  {
    name: 'Project Management Professional (PMP)',
    issuer: 'PMI',
    year: '2023'
  },
  {
    name: 'Certified Scrum Master',
    issuer: 'Scrum Alliance',
    year: '2022'
  },
  {
    name: 'Data Analysis Fundamentals',
    issuer: 'DataCamp',
    year: '2021'
  }
]);

// Métodos
const getDocumentIcon = (type) => {
  const icons = {
    'PDF': DocumentTextIcon,
    'DOCX': DocumentIcon,
    'XLSX': TableIcon,
    'PPTX': PresentationChartLineIcon,
    'CSV': ChartBarIcon
  };
  
  return icons[type] || DocumentIcon;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>

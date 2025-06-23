<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Cabecera de la página -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Tipos de Documento</h1>
        <p class="text-gray-600 dark:text-gray-400">Gestión de tipos de documentos del sistema</p>
      </div>
      <button class="btn btn-primary" @click="abrirModalCrear">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nuevo Tipo
      </button>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="card p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="form-control w-full md:w-1/3">
          <label class="label">
            <span class="label-text">Buscar</span>
          </label>
          <input 
            type="text" 
            placeholder="Buscar por nombre o descripción..." 
            class="input input-bordered w-full" 
            v-model="filtros.busqueda"
            @input="aplicarFiltros"
          />
        </div>
        <div class="form-control w-full md:w-1/3">
          <label class="label">
            <span class="label-text">Estado</span>
          </label>
          <select 
            class="select select-bordered w-full" 
            v-model="filtros.estado"
            @change="aplicarFiltros"
          >
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </div>
        <div class="form-control w-full md:w-1/3 flex items-end">
          <button class="btn btn-outline w-full" @click="limpiarFiltros">
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de tipos de documento -->
    <div class="card p-4">
      <TipoDocumentoTable 
        :tiposDocumento="tiposDocumentoFiltrados" 
        @editar="editarTipoDocumento"
        @eliminar="eliminarTipoDocumento"
        @recargar="cargarTiposDocumento"
      />
    </div>

    <!-- Paginación -->
    <div class="flex justify-center my-6">
      <div class="join">
        <button 
          class="join-item btn" 
          :class="{ 'btn-disabled': paginacion.paginaActual === 1 }"
          @click="cambiarPagina(paginacion.paginaActual - 1)"
        >
          «
        </button>
        <button class="join-item btn">Página {{ paginacion.paginaActual }} de {{ paginacion.totalPaginas }}</button>
        <button 
          class="join-item btn" 
          :class="{ 'btn-disabled': paginacion.paginaActual === paginacion.totalPaginas }"
          @click="cambiarPagina(paginacion.paginaActual + 1)"
        >
          »
        </button>
      </div>
    </div>

    <!-- Modal para crear/editar tipo de documento -->
    <input type="checkbox" id="modal-form" class="modal-toggle" v-model="modalFormVisible" />
    <div class="modal" :class="{ 'modal-open': modalFormVisible }">
      <div class="modal-box">
        <h3 class="font-bold text-lg">{{ modoEdicion ? 'Editar' : 'Crear' }} Tipo de Documento</h3>
        <form @submit.prevent="guardarTipoDocumento" class="py-4">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">Nombre</span>
            </label>
            <input 
              type="text" 
              placeholder="Nombre del tipo de documento" 
              class="input input-bordered w-full" 
              v-model="formTipoDocumento.nombre"
              required
            />
          </div>
          
          <div class="form-control w-full mt-4">
            <label class="label">
              <span class="label-text">Descripción</span>
            </label>
            <textarea 
              placeholder="Descripción del tipo de documento" 
              class="textarea textarea-bordered w-full" 
              v-model="formTipoDocumento.descripcion"
            ></textarea>
          </div>
          
          <div class="form-control w-full mt-4">
            <label class="label">
              <span class="label-text">Extensiones permitidas</span>
            </label>
            <input 
              type="text" 
              placeholder="pdf,doc,docx,xls,xlsx" 
              class="input input-bordered w-full" 
              v-model="formTipoDocumento.extensionesPermitidas"
              required
            />
            <label class="label">
              <span class="label-text-alt">Separadas por comas, sin espacios</span>
            </label>
          </div>
          
          <div class="form-control w-full mt-4">
            <label class="label">
              <span class="label-text">Tamaño máximo (MB)</span>
            </label>
            <input 
              type="number" 
              placeholder="10" 
              class="input input-bordered w-full" 
              v-model="formTipoDocumento.tamanoMaximoMB"
              min="1"
              required
            />
          </div>
          
          <div class="form-control mt-4">
            <label class="label cursor-pointer">
              <span class="label-text">Activo</span>
              <input type="checkbox" class="toggle toggle-primary" v-model="formTipoDocumento.activo" />
            </label>
          </div>
          
          <div class="modal-action">
            <button type="submit" class="btn btn-primary">Guardar</button>
            <button type="button" class="btn" @click="cerrarModalForm">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'vue-toastification';
import TipoDocumentoTable from '~/components/TipoDocumentoTable.vue';

// Servicios
import { getAll, create, update, remove } from '~/services/documentTypeService';

// Estado
const tiposDocumento = ref([]);
const tiposDocumentoFiltrados = ref([]);
const modalFormVisible = ref(false);
const modoEdicion = ref(false);
const formTipoDocumento = ref({
  id: null,
  nombre: '',
  descripcion: '',
  extensionesPermitidas: '',
  tamanoMaximoMB: 10,
  activo: true
});
const filtros = ref({
  busqueda: '',
  estado: 'todos'
});
const paginacion = ref({
  paginaActual: 1,
  totalPaginas: 1,
  itemsPorPagina: 10
});
const toast = useToast();

// Cargar datos
onMounted(async () => {
  await cargarTiposDocumento();
});

const cargarTiposDocumento = async () => {
  try {
    const data = await getAll();
    tiposDocumento.value = data;
    aplicarFiltros();
    calcularPaginacion();
  } catch (error) {
    console.error('Error al cargar tipos de documento:', error);
    toast.error('Error al cargar los tipos de documento');
  }
};

// Filtros
const aplicarFiltros = () => {
  let resultado = [...tiposDocumento.value];
  
  // Filtrar por búsqueda
  if (filtros.value.busqueda) {
    const busqueda = filtros.value.busqueda.toLowerCase();
    resultado = resultado.filter(item => 
      item.nombre.toLowerCase().includes(busqueda) || 
      (item.descripcion && item.descripcion.toLowerCase().includes(busqueda))
    );
  }
  
  // Filtrar por estado
  if (filtros.value.estado !== 'todos') {
    const activo = filtros.value.estado === 'activos';
    resultado = resultado.filter(item => item.activo === activo);
  }
  
  tiposDocumentoFiltrados.value = resultado;
  calcularPaginacion();
};

const limpiarFiltros = () => {
  filtros.value = {
    busqueda: '',
    estado: 'todos'
  };
  aplicarFiltros();
};

// Paginación
const calcularPaginacion = () => {
  paginacion.value.totalPaginas = Math.ceil(tiposDocumentoFiltrados.value.length / paginacion.value.itemsPorPagina) || 1;
  if (paginacion.value.paginaActual > paginacion.value.totalPaginas) {
    paginacion.value.paginaActual = 1;
  }
};

const cambiarPagina = (pagina) => {
  if (pagina >= 1 && pagina <= paginacion.value.totalPaginas) {
    paginacion.value.paginaActual = pagina;
  }
};

// CRUD operaciones
const abrirModalCrear = () => {
  modoEdicion.value = false;
  formTipoDocumento.value = {
    id: null,
    nombre: '',
    descripcion: '',
    extensionesPermitidas: '',
    tamanoMaximoMB: 10,
    activo: true
  };
  modalFormVisible.value = true;
};

const editarTipoDocumento = (item) => {
  modoEdicion.value = true;
  formTipoDocumento.value = { ...item };
  modalFormVisible.value = true;
};

const cerrarModalForm = () => {
  modalFormVisible.value = false;
};

const guardarTipoDocumento = async () => {
  try {
    if (modoEdicion.value) {
      await update(formTipoDocumento.value.id, formTipoDocumento.value);
      toast.success(`Tipo de documento "${formTipoDocumento.value.nombre}" actualizado correctamente`);
    } else {
      await create(formTipoDocumento.value);
      toast.success(`Tipo de documento "${formTipoDocumento.value.nombre}" creado correctamente`);
    }
    
    modalFormVisible.value = false;
    await cargarTiposDocumento();
  } catch (error) {
    console.error('Error al guardar tipo de documento:', error);
    toast.error('Error al guardar el tipo de documento');
  }
};

const eliminarTipoDocumento = async (item) => {
  try {
    await remove(item.id);
    await cargarTiposDocumento();
  } catch (error) {
    console.error('Error al eliminar tipo de documento:', error);
    toast.error('Error al eliminar el tipo de documento');
  }
};
</script>

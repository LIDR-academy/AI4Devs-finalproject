// perfiles.ts
import { defineStore } from 'pinia';
import perfilService, { PerfilDto, PerfilFilterParams, PaginatedResponse, CreatePerfilDto, UpdatePerfilDto } from '../services/perfilService';
import { useToast } from '../composables/useToast';

const toast = useToast();

export const usePerfilesStore = defineStore('perfiles', {
  state: () => ({
    perfiles: [] as PerfilDto[],
    isLoading: false,
    error: null as string | null,
    paginationInfo: {
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0,
      totalCount: 0,
      hasPreviousPage: false,
      hasNextPage: false
    },
    cache: {
      timestamp: 0,
      data: [] as PerfilDto[],
      params: null as PerfilFilterParams | null
    }
  }),

  actions: {
    // Obtener todos los perfiles sin paginación
    async fetchAllPerfiles(includeInactive = false, forceRefresh = false) {
      console.log('fetchAllPerfiles iniciado con includeInactive:', includeInactive);
      
      // Si no se fuerza la actualización y hay datos en caché recientes
      const now = Date.now();
      const cacheAge = now - this.cache.timestamp;
      const cacheParams = { includeInactive };
      const sameParams = this.cache.params && 
        JSON.stringify({ includeInactive: this.cache.params.includeInactive }) === JSON.stringify({ includeInactive });

      if (!forceRefresh && sameParams && cacheAge < 30000 && this.cache.data.length > 0) {
        console.log('Usando datos en caché para perfiles (getAllPerfiles)');
        this.perfiles = [...this.cache.data];
        return this.perfiles;
      }
      
      this.isLoading = true;
      this.error = null;

      try {
        console.log('fetchAllPerfiles - llamando a perfilService.getAllPerfiles con includeInactive:', includeInactive);
        
        // Verificar si el servicio existe
        if (!perfilService || !perfilService.getAllPerfiles) {
          console.error('fetchAllPerfiles - perfilService o getAllPerfiles no está definido');
          throw new Error('Servicio de perfiles no disponible');
        }
        
        // Llamar al servicio y obtener la respuesta
        const perfilesData = await perfilService.getAllPerfiles(includeInactive);
        console.log('fetchAllPerfiles - respuesta procesada del servicio:', perfilesData);
        
        // Verificar si la respuesta es válida
        if (!perfilesData) {
          console.error('fetchAllPerfiles - respuesta undefined o null después de procesamiento');
          this.perfiles = [];
          this.error = 'No se recibieron datos del servidor';
          toast.error(this.error);
          return [];
        }
        
        // Asignar los perfiles al estado
        console.log('fetchAllPerfiles - asignando perfiles al estado:', perfilesData);
        this.perfiles = [...perfilesData];
        console.log('fetchAllPerfiles - perfiles asignados:', this.perfiles);
        
        // Actualizar información de paginación para reflejar todos los resultados en una página
        const totalItems = this.perfiles.length;
        console.log('fetchAllPerfiles - total de perfiles:', totalItems);
        this.paginationInfo = {
          pageNumber: 1,
          pageSize: totalItems,
          totalPages: 1,
          totalCount: totalItems,
          hasPreviousPage: false,
          hasNextPage: false
        };
        
        // Actualizar caché
        this.cache = {
          timestamp: now,
          data: [...this.perfiles],
          params: { includeInactive }
        };
        
        console.log('fetchAllPerfiles - estado actualizado:', this.perfiles);
        return this.perfiles;
      } catch (error: any) {
        console.error('fetchAllPerfiles - error:', error);
        this.error = error.message || 'Error al cargar todos los perfiles';
        toast.error(this.error);
        throw error;
      } finally {
        this.isLoading = false;
        console.log('fetchAllPerfiles finalizado, isLoading:', this.isLoading);
      }
    },

    // Obtener perfiles con paginación y filtros
    async fetchPerfiles(params: PerfilFilterParams, forceRefresh = false) {
      // Si no se fuerza la actualización y los parámetros son los mismos que la última vez
      // y la caché tiene menos de 30 segundos, usar los datos en caché
      const now = Date.now();
      const cacheAge = now - this.cache.timestamp;
      const sameParams = this.cache.params && 
        JSON.stringify(this.cache.params) === JSON.stringify(params);

      if (!forceRefresh && sameParams && cacheAge < 30000 && this.cache.data.length > 0) {
        console.log('Usando datos en caché para perfiles');
        this.perfiles = [...this.cache.data];
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        const response: PaginatedResponse<PerfilDto> = await perfilService.getPerfiles(params);
        
        this.perfiles = response.items;
        this.paginationInfo = {
          pageNumber: response.pageNumber,
          pageSize: response.pageSize,
          totalPages: response.totalPages,
          totalCount: response.totalCount,
          hasPreviousPage: response.hasPreviousPage,
          hasNextPage: response.hasNextPage
        };

        // Actualizar caché
        this.cache = {
          timestamp: now,
          data: [...this.perfiles],
          params: { ...params }
        };
      } catch (error: any) {
        this.error = error.message || 'Error al cargar los perfiles';
        toast.error(this.error);
      } finally {
        this.isLoading = false;
      }
    },

    // Obtener un perfil por ID
    async fetchPerfilById(id: number) {
      console.log(`fetchPerfilById - Iniciando búsqueda de perfil con ID: ${id}`);
      this.isLoading = true;
      this.error = null;

      try {
        // Primero verificamos si el perfil ya está en el estado actual
        console.log('fetchPerfilById - Verificando si el perfil está en el estado actual');
        const perfilEnEstado = this.perfiles.find(p => p.id === id);
        
        if (perfilEnEstado) {
          console.log('fetchPerfilById - Perfil encontrado en el estado actual:', perfilEnEstado);
          return perfilEnEstado;
        }
        
        console.log('fetchPerfilById - Perfil no encontrado en el estado, solicitando al servicio');
        const perfil = await perfilService.getPerfilById(id);
        console.log('fetchPerfilById - Respuesta del servicio:', perfil);
        
        if (!perfil) {
          console.error(`fetchPerfilById - No se encontró el perfil con ID ${id}`);
          throw new Error(`No se encontró el perfil con ID ${id}`);
        }
        
        return perfil;
      } catch (error: any) {
        console.error(`fetchPerfilById - Error al obtener el perfil con ID ${id}:`, error);
        this.error = error.message || `Error al obtener el perfil con ID ${id}`;
        toast.error(this.error);
        throw error;
      } finally {
        this.isLoading = false;
        console.log('fetchPerfilById - Finalizado');
      }
    },

    // Crear un nuevo perfil
    async createPerfil(perfil: CreatePerfilDto) {
      console.log('createPerfil - Iniciando creación de perfil:', perfil);
      this.isLoading = true;
      this.error = null;

      try {
        const newPerfil = await perfilService.createPerfil(perfil);
        console.log('createPerfil - Perfil creado correctamente:', newPerfil);
        
        // Verificar si el perfil fue creado correctamente
        if (!newPerfil) {
          console.warn('createPerfil - No se recibió el perfil creado del servidor');
          // Forzar una recarga para obtener el perfil recién creado
          await this.fetchAllPerfiles(true, true);
          toast.success('Perfil creado correctamente. Actualizando lista...');
          this.cache.timestamp = 0;
          return null;
        }
        
        // Actualizar el estado local añadiendo el nuevo perfil al array
        if (newPerfil.id) {
          console.log('createPerfil - Actualizando el estado local con el nuevo perfil');
          this.perfiles = [...this.perfiles, newPerfil];
          console.log('createPerfil - Estado actualizado, perfiles:', this.perfiles.length);
        }
        
        toast.success('Perfil creado correctamente');
        // Invalidar caché
        this.cache.timestamp = 0;
        return newPerfil;
      } catch (error: any) {
        console.error('createPerfil - Error:', error);
        this.error = error.message || 'Error al crear el perfil';
        toast.error(this.error);
        throw error;
      } finally {
        this.isLoading = false;
        console.log('createPerfil - Finalizado');
      }
    },

    // Actualizar un perfil existente
    async updatePerfil(id: number, perfil: UpdatePerfilDto) {
      console.log(`updatePerfil - Iniciando actualización de perfil con ID ${id}:`, perfil);
      this.isLoading = true;
      this.error = null;

      try {
        await perfilService.updatePerfil(id, perfil);
        console.log('updatePerfil - Perfil actualizado correctamente en el servidor');
        
        // Actualizar el estado local modificando el perfil en el array
        const perfilIndex = this.perfiles.findIndex(p => p.id === id);
        console.log(`updatePerfil - Índice del perfil en el array: ${perfilIndex}`);
        
        if (perfilIndex !== -1) {
          console.log('updatePerfil - Actualizando perfil en el estado local');
          // Crear una copia del array de perfiles
          const perfilesActualizados = [...this.perfiles];
          
          // Actualizar el perfil específico
          perfilesActualizados[perfilIndex] = {
            ...perfilesActualizados[perfilIndex],
            ...perfil,
            id: id // Asegurarse de que el ID se mantiene
          };
          
          // Asignar el array actualizado al estado
          this.perfiles = perfilesActualizados;
          console.log('updatePerfil - Estado actualizado, perfiles:', this.perfiles.length);
        } else {
          console.warn(`updatePerfil - No se encontró el perfil con ID ${id} en el estado local`);
          // Si no encontramos el perfil en el estado, forzar una recarga completa
          await this.fetchAllPerfiles(true, true);
        }
        
        toast.success('Perfil actualizado correctamente');
        // Invalidar caché
        this.cache.timestamp = 0;
      } catch (error: any) {
        console.error(`updatePerfil - Error al actualizar perfil con ID ${id}:`, error);
        this.error = error.message || `Error al actualizar el perfil con ID ${id}`;
        toast.error(this.error);
        throw error;
      } finally {
        this.isLoading = false;
        console.log('updatePerfil - Finalizado');
      }
    },

    // Eliminar un perfil
    async deletePerfil(id: number) {
      console.log(`deletePerfil - Iniciando eliminación de perfil con ID ${id}`);
      this.isLoading = true;
      this.error = null;

      try {
        await perfilService.deletePerfil(id);
        console.log('deletePerfil - Perfil eliminado correctamente en el servidor');
        
        // Actualizar el estado local eliminando el perfil del array
        console.log('deletePerfil - Actualizando el estado local');
        const perfilIndex = this.perfiles.findIndex(p => p.id === id);
        
        if (perfilIndex !== -1) {
          console.log(`deletePerfil - Perfil encontrado en el índice ${perfilIndex}, eliminando...`);
          // Crear una copia del array sin el perfil eliminado
          this.perfiles = this.perfiles.filter(p => p.id !== id);
          console.log('deletePerfil - Estado actualizado, perfiles:', this.perfiles.length);
        } else {
          console.warn(`deletePerfil - No se encontró el perfil con ID ${id} en el estado local`);
        }
        
        toast.success('Perfil eliminado correctamente');
        // Invalidar caché
        this.cache.timestamp = 0;
      } catch (error: any) {
        console.error(`deletePerfil - Error al eliminar perfil con ID ${id}:`, error);
        this.error = error.message || `Error al eliminar el perfil con ID ${id}`;
        toast.error(this.error);
        throw error;
      } finally {
        this.isLoading = false;
        console.log('deletePerfil - Finalizado');
      }
    },

    // Limpiar el estado
    clearState() {
      this.perfiles = [];
      this.error = null;
      this.paginationInfo = {
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
        totalCount: 0,
        hasPreviousPage: false,
        hasNextPage: false
      };
      this.cache = {
        timestamp: 0,
        data: [],
        params: null
      };
    }
  }
});

import type { Pin, CreatePinDto, AddCommentDto, UpdatePinStatusDto } from '~/types/pin';
import { useAuthStore } from '~/stores/auth';
import { useGuestStore } from '~/stores/guest';
import { useToastStore } from '~/stores/toast';

export const usePins = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const guestStore = useGuestStore();
  const toastStore = useToastStore();

  const pins = ref<Pin[]>([]);
  const selectedPin = ref<Pin | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed: Determinar si el usuario actual es guest
  const isGuest = computed(() => guestStore.isGuest);

  // Computed: Puede resolver pines (solo no-guest)
  const canResolve = computed(() => !isGuest.value && authStore.isAuthenticated);

  /**
   * Obtener el token apropiado (guest o auth)
   */
  const getToken = () => {
    return guestStore.guestToken || authStore.token || null;
  };

  /**
   * Headers de autenticación
   */
  const getHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  /**
   * Cargar pines de una capa específica
   */
  const fetchPinsByLayer = async (layerId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<{ pins: Pin[] }>(
        `${config.public.apiBase}/layers/${layerId}/pins`,
        { headers: getHeaders() }
      );

      pins.value = response.pins;
      return response.pins;
    } catch (e: any) {
      error.value = e.data?.error || 'Error al cargar pines';
      toastStore.add({ type: 'error', message: error.value });
      throw e;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Crear nuevo pin con comentario inicial
   */
  const createPin = async (layerId: string, dto: CreatePinDto): Promise<Pin> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<Pin>(
        `${config.public.apiBase}/layers/${layerId}/pins`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: dto,
        }
      );

      // Agregar a la lista local
      pins.value.push(response);
      toastStore.add({ type: 'success', message: 'Pin creado correctamente' });
      
      return response;
    } catch (e: any) {
      error.value = e.data?.error || 'Error al crear pin';
      toastStore.add({ type: 'error', message: error.value });
      throw e;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Obtener detalle completo de un pin (con comentarios)
   */
  const fetchPinDetail = async (pinId: string): Promise<Pin> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<Pin>(
        `${config.public.apiBase}/pins/${pinId}`,
        { headers: getHeaders() }
      );

      selectedPin.value = response;
      
      // Actualizar en la lista si existe
      const index = pins.value.findIndex(p => p.id === pinId);
      if (index !== -1) {
        pins.value[index] = response;
      }

      return response;
    } catch (e: any) {
      error.value = e.data?.error || 'Error al cargar pin';
      toastStore.add({ type: 'error', message: error.value });
      throw e;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Añadir comentario a un pin existente
   */
  const addComment = async (pinId: string, dto: AddCommentDto) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<{ id: string; content: string; createdAt: string }>(
        `${config.public.apiBase}/pins/${pinId}/comments`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: dto,
        }
      );

      // Re-fetch del pin para obtener comentarios actualizados
      await fetchPinDetail(pinId);
      
      toastStore.add({ type: 'success', message: 'Comentario añadido' });
      return response;
    } catch (e: any) {
      error.value = e.data?.error || 'Error al añadir comentario';
      toastStore.add({ type: 'error', message: error.value });
      throw e;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Actualizar estado de pin (solo no-guest)
   */
  const updatePinStatus = async (pinId: string, dto: UpdatePinStatusDto) => {
    if (isGuest.value) {
      toastStore.add({ 
        type: 'error', 
        message: 'Los invitados no pueden resolver pines' 
      });
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<{ id: string; status: string; updatedAt: string }>(
        `${config.public.apiBase}/pins/${pinId}/status`,
        {
          method: 'PATCH',
          headers: getHeaders(),
          body: dto,
        }
      );

      // Actualizar estado localmente
      const pin = pins.value.find(p => p.id === pinId);
      if (pin) {
        pin.status = dto.status;
        pin.updatedAt = response.updatedAt;
      }

      if (selectedPin.value?.id === pinId) {
        selectedPin.value.status = dto.status;
        selectedPin.value.updatedAt = response.updatedAt;
      }

      const statusText = dto.status === 'RESOLVED' ? 'resuelto' : 'reabierto';
      toastStore.add({ type: 'success', message: `Pin ${statusText}` });
      
      return response;
    } catch (e: any) {
      error.value = e.data?.error || 'Error al actualizar estado';
      toastStore.add({ type: 'error', message: error.value });
      throw e;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Eliminar pin (solo creador)
   */
  const deletePin = async (pinId: string) => {
    loading.value = true;
    error.value = null;

    try {
      await $fetch(`${config.public.apiBase}/pins/${pinId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      // Remover de la lista local
      pins.value = pins.value.filter(p => p.id !== pinId);
      
      if (selectedPin.value?.id === pinId) {
        selectedPin.value = null;
      }

      toastStore.add({ type: 'success', message: 'Pin eliminado' });
    } catch (e: any) {
      error.value = e.data?.error || 'Error al eliminar pin';
      toastStore.add({ type: 'error', message: error.value });
      throw e;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Seleccionar un pin (abre el drawer)
   */
  const selectPin = async (pinId: string) => {
    await fetchPinDetail(pinId);
  };

  /**
   * Deseleccionar pin (cierra el drawer)
   */
  const deselectPin = () => {
    selectedPin.value = null;
  };

  return {
    // State
    pins,
    selectedPin,
    loading,
    error,
    
    // Computed
    isGuest,
    canResolve,

    // Actions
    fetchPinsByLayer,
    createPin,
    fetchPinDetail,
    addComment,
    updatePinStatus,
    deletePin,
    selectPin,
    deselectPin,
  };
};

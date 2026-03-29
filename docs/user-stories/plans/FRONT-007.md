# Plan de Implementación: FRONT-007 - UI Pines y Drawer de Comentarios

Este documento detalla los pasos para implementar la funcionalidad de colaboración mediante pines y comentarios en el visor de planos, permitiendo a usuarios autenticados y guests marcar puntos específicos y mantener hilos de discusión.

## 1. Resumen de la Tarea

- **Objetivo**: Permitir que usuarios (autenticados y guests) coloquen pines en coordenadas específicas de planos para iniciar hilos de comentarios y mantener conversaciones contextuales.
- **Tecnología**: Nuxt 3 / Vue 3 Composition API, Tailwind CSS, Pinia, TypeScript.
- **Enfoque**: Coordenadas relativas (porcentaje 0-1), carga de pines por capa visible, navegación entre pines, sin tiempo real (refresh manual).
- **User Story**: US-006 - Colaboración Contextual
- **Ticket**: FRONT-007
- **Estimación**: 8 pts

## 2. Contexto y Requisitos

### 2.1 API Backend Disponible

Las siguientes APIs ya están implementadas y deben utilizarse:

```
POST   /api/layers/:layerId/pins           - Crear pin con comentario inicial
GET    /api/layers/:layerId/pins           - Listar pines de una capa
GET    /api/pins/:pinId                    - Obtener detalle de pin con comentarios
PATCH  /api/pins/:pinId/status             - Actualizar estado (solo no-guest)
DELETE /api/pins/:pinId                    - Eliminar pin (solo creador)
POST   /api/pins/:pinId/comments           - Añadir comentario a un pin
DELETE /api/comments/:commentId            - Eliminar comentario (solo creador)
```

### 2.2 Modelos de Datos

**Pin**:
```typescript
{
  id: string
  layerId: string
  xCoord: number        // Coordenada X (0-1, porcentaje)
  yCoord: number        // Coordenada Y (0-1, porcentaje)
  status: 'OPEN' | 'RESOLVED'
  createdBy: string | null
  guestName: string | null
  createdAt: string
  updatedAt: string
  comments?: Comment[]
}
```

**Comment**:
```typescript
{
  id: string
  pinId: string
  content: string
  authorId: string | null
  guestName: string | null
  createdAt: string
}
```

### 2.3 Reglas de Negocio

1. **Coordinadas**: Relativas (0-1 como porcentaje de ancho/alto de la imagen)
2. **Permisos**:
   - Guests y usuarios autenticados pueden crear pines y comentarios
   - Solo usuarios autenticados (no-guest) pueden marcar pines como resueltos
   - Solo creadores pueden eliminar sus propios pines/comentarios
3. **Visibilidad**: Los pines se cargan por capa visible
4. **Actualización**: Sin tiempo real, requiere refresh manual de página
5. **Navegación**: Debe haber controles next/prev para navegar entre pines
6. **Estados visuales**:
   - OPEN: Color llamativo (naranja/amarillo)
   - RESOLVED: Color atenuado (gris)

### 2.4 Criterios de Aceptación

- [ ] Al hacer clic en el plano, aparece un marcador visual (pin) en ese punto
- [ ] Se abre un panel lateral o modal para escribir el primer comentario
- [ ] Al hacer clic en un pin existente, se despliega el historial cronológico
- [ ] Se puede añadir respuestas nuevas al hilo
- [ ] Usuarios no-guest pueden marcar hilos como "Resueltos"
- [ ] El pin cambia de estado visual cuando se resuelve
- [ ] Navegación next/prev entre pines funciona correctamente

## 3. Arquitectura de la Solución

### 3.1 Estructura de Archivos

```
apps/frontend/
├── components/
│   └── pins/
│       ├── PinMarker.vue              # Componente visual del pin
│       ├── PinList.vue                # Lista/navegación de pines
│       ├── CommentsDrawer.vue         # Panel lateral de comentarios
│       └── CreatePinModal.vue         # Modal para crear nuevo pin
├── composables/
│   └── usePins.ts                     # Lógica de negocio de pines
├── types/
│   └── pin.ts                         # Tipos TypeScript
└── tests/
    └── unit/
        └── components/
            └── pins/
                ├── PinMarker.spec.ts
                ├── CommentsDrawer.spec.ts
                └── CreatePinModal.spec.ts
```

### 3.2 Flujo de Usuario

```
1. Usuario visualiza plano → Ve pines existentes renderizados
2. Click en zona vacía → Modal para escribir comentario inicial
3. Confirma → POST /layers/:id/pins → Pin aparece en el plano
4. Click en pin existente → Drawer se desliza desde la derecha
5. Muestra historial de comentarios + input para responder
6. Escribe respuesta → POST /pins/:id/comments → Actualiza vista
7. Usuario no-guest puede → PATCH /pins/:id/status → Pin cambia color
8. Navegación → Botones prev/next ciclan entre pines
```

## 4. Pasos de Implementación

### Paso 1: Crear Types y Composable Base

**Archivo**: `apps/frontend/types/pin.ts`

```typescript
export type PinStatus = 'OPEN' | 'RESOLVED';

export interface Comment {
  id: string;
  pinId: string;
  content: string;
  authorId: string | null;
  guestName: string | null;
  createdAt: string;
}

export interface Pin {
  id: string;
  layerId: string;
  xCoord: number;        // 0-1 (porcentaje)
  yCoord: number;        // 0-1 (porcentaje)
  status: PinStatus;
  createdBy: string | null;
  guestName: string | null;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
}

export interface CreatePinDto {
  xCoord: number;
  yCoord: number;
  content: string;
}

export interface AddCommentDto {
  content: string;
}

export interface UpdatePinStatusDto {
  status: PinStatus;
}
```

**Archivo**: `apps/frontend/composables/usePins.ts`

```typescript
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
```

### Paso 2: Componente PinMarker

**Archivo**: `apps/frontend/components/pins/PinMarker.vue`

Este componente representa visualmente un pin en el plano usando coordenadas relativas.

```vue
<template>
  <button
    class="pin-marker absolute z-20 transition-all duration-200 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-offset-1"
    :class="pinClasses"
    :style="pinPosition"
    :aria-label="`Pin ${pin.status === 'RESOLVED' ? 'resuelto' : 'abierto'}`"
    @click="$emit('click', pin.id)"
  >
    <!-- Icono de pin -->
    <svg
      class="w-6 h-6"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
      />
    </svg>

    <!-- Badge de comentarios (opcional) -->
    <span
      v-if="commentCount > 0"
      class="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold"
    >
      {{ commentCount > 9 ? '9+' : commentCount }}
    </span>
  </button>
</template>

<script setup lang="ts">
import type { Pin } from '~/types/pin';

interface Props {
  pin: Pin;
}

const props = defineProps<Props>();

defineEmits<{
  click: [pinId: string];
}>();

// Posición absoluta en porcentaje
const pinPosition = computed(() => ({
  left: `${props.pin.xCoord * 100}%`,
  top: `${props.pin.yCoord * 100}%`,
  transform: 'translate(-50%, -100%)', // Centrar horizontalmente, anclar abajo
}));

// Clases dinámicas según estado
const pinClasses = computed(() => ({
  'text-orange-500 hover:text-orange-600': props.pin.status === 'OPEN',
  'text-gray-400 hover:text-gray-500 opacity-60': props.pin.status === 'RESOLVED',
}));

// Contador de comentarios
const commentCount = computed(() => props.pin.comments?.length || 0);
</script>

<style scoped>
.pin-marker {
  cursor: pointer;
}
</style>
```

### Paso 3: Componente CreatePinModal

**Archivo**: `apps/frontend/components/pins/CreatePinModal.vue`

Modal para crear un nuevo pin con su comentario inicial.

```vue
<template>
  <UiModal v-model="localShow" @update:modelValue="handleClose">
    <template #title>
      Nuevo Comentario
    </template>

    <div class="space-y-4">
      <p class="text-sm text-gray-600">
        Escribe tu comentario sobre este punto del plano:
      </p>

      <UiInput
        v-model="content"
        label="Comentario"
        placeholder="Ej: ¿Esta pared puede moverse 20cm a la izquierda?"
        :error-message="contentError"
        type="textarea"
        rows="4"
      />

      <div class="text-xs text-gray-500">
        Coordenadas: X: {{ Math.round(coords.x * 100) }}%, Y: {{ Math.round(coords.y * 100) }}%
      </div>
    </div>

    <template #footer>
      <div class="flex gap-2 justify-end w-full">
        <UiButton variant="outline" @click="handleClose">
          Cancelar
        </UiButton>
        <UiButton
          variant="primary"
          :loading="loading"
          :disabled="!isValid"
          @click="handleSubmit"
        >
          Crear Pin
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  coords: { x: number; y: number }; // Coordenadas relativas 0-1
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  submit: [content: string];
}>();

const localShow = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const content = ref('');
const contentError = ref('');

const isValid = computed(() => {
  return content.value.trim().length >= 3;
});

const validate = () => {
  contentError.value = '';
  
  if (content.value.trim().length < 3) {
    contentError.value = 'El comentario debe tener al menos 3 caracteres';
    return false;
  }

  return true;
};

const handleSubmit = () => {
  if (!validate()) return;
  
  emit('submit', content.value.trim());
};

const handleClose = () => {
  content.value = '';
  contentError.value = '';
  emit('update:modelValue', false);
};

// Reset al abrir
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    content.value = '';
    contentError.value = '';
  }
});
</script>
```

### Paso 4: Componente CommentsDrawer

**Archivo**: `apps/frontend/components/pins/CommentsDrawer.vue`

Panel lateral deslizable que muestra el hilo de comentarios.

```vue
<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-40 bg-black bg-opacity-30 transition-opacity"
      @click="close"
    ></div>

    <!-- Drawer -->
    <div
      v-if="modelValue"
      class="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300"
      :class="{ 'translate-x-full': !modelValue }"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">
            Comentarios
          </h3>
          <p class="text-xs text-gray-500 mt-1">
            {{ pin ? formatDate(pin.createdAt) : '' }}
            <span v-if="pin?.status === 'RESOLVED'" class="ml-2 text-green-600">✓ Resuelto</span>
          </p>
        </div>
        <button
          class="text-gray-400 hover:text-gray-600 focus:outline-none"
          @click="close"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Comments List -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <div
          v-for="comment in pin?.comments"
          :key="comment.id"
          class="bg-gray-50 rounded-lg p-3"
        >
          <div class="flex items-start justify-between mb-2">
            <span class="text-sm font-semibold text-gray-900">
              {{ getAuthorName(comment) }}
            </span>
            <span class="text-xs text-gray-500">
              {{ formatTime(comment.createdAt) }}
            </span>
          </div>
          <p class="text-sm text-gray-700 whitespace-pre-wrap">
            {{ comment.content }}
          </p>
        </div>

        <div v-if="!pin?.comments?.length" class="text-center text-gray-400 py-8">
          No hay comentarios aún
        </div>
      </div>

      <!-- Input Area -->
      <div class="border-t border-gray-200 p-4 space-y-3">
        <textarea
          v-model="newComment"
          placeholder="Escribe una respuesta..."
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
        ></textarea>

        <div class="flex gap-2">
          <UiButton
            variant="primary"
            class="flex-1"
            :loading="loading"
            :disabled="!newComment.trim()"
            @click="handleAddComment"
          >
            Enviar
          </UiButton>

          <!-- Botón resolver (solo no-guest) -->
          <UiButton
            v-if="canResolve"
            variant="outline"
            :disabled="loading"
            @click="handleToggleStatus"
          >
            {{ pin?.status === 'RESOLVED' ? 'Reabrir' : 'Resolver' }}
          </UiButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Pin, Comment } from '~/types/pin';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  modelValue: boolean;
  pin: Pin | null;
  loading?: boolean;
  canResolve?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  canResolve: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'add-comment': [content: string];
  'toggle-status': [];
}>();

const newComment = ref('');

const close = () => {
  emit('update:modelValue', false);
};

const handleAddComment = () => {
  if (!newComment.value.trim()) return;
  
  emit('add-comment', newComment.value.trim());
  newComment.value = '';
};

const handleToggleStatus = () => {
  emit('toggle-status');
};

const getAuthorName = (comment: Comment) => {
  return comment.guestName || comment.authorId || 'Usuario';
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
};

const formatTime = (dateString: string) => {
  return formatDistanceToNow(new Date(dateString), { 
    addSuffix: true, 
    locale: es 
  });
};

// Reset al cerrar
watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    newComment.value = '';
  }
});
</script>
```

### Paso 5: Componente PinList (Navegación)

**Archivo**: `apps/frontend/components/pins/PinList.vue`

Componente para listar y navegar entre pines.

```vue
<template>
  <div
    v-if="pins.length > 0"
    class="absolute top-4 left-4 z-30 bg-white rounded-lg shadow-lg p-3 space-y-2 max-w-xs"
  >
    <div class="flex items-center justify-between">
      <h4 class="text-sm font-semibold text-gray-700">
        Pines ({{ currentIndex + 1 }}/{{ pins.length }})
      </h4>
      <button
        class="text-gray-400 hover:text-gray-600 text-xs"
        @click="$emit('toggle-list')"
      >
        {{ showList ? 'Ocultar' : 'Mostrar' }}
      </button>
    </div>

    <!-- Navegación -->
    <div class="flex gap-2">
      <button
        class="flex-1 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="currentIndex <= 0"
        @click="$emit('navigate', 'prev')"
      >
        ← Anterior
      </button>
      <button
        class="flex-1 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="currentIndex >= pins.length - 1"
        @click="$emit('navigate', 'next')"
      >
        Siguiente →
      </button>
    </div>

    <!-- Lista expandible -->
    <div v-if="showList" class="max-h-60 overflow-y-auto space-y-1 pt-2 border-t">
      <button
        v-for="(pin, index) in pins"
        :key="pin.id"
        class="w-full text-left px-3 py-2 text-xs rounded hover:bg-gray-50 transition-colors"
        :class="{
          'bg-blue-50 border border-blue-200': index === currentIndex,
          'border border-transparent': index !== currentIndex,
        }"
        @click="$emit('select', pin.id)"
      >
        <div class="flex items-center justify-between">
          <span class="font-medium">Pin #{{ index + 1 }}</span>
          <span
            class="text-xs px-2 py-0.5 rounded"
            :class="{
              'bg-orange-100 text-orange-700': pin.status === 'OPEN',
              'bg-gray-100 text-gray-600': pin.status === 'RESOLVED',
            }"
          >
            {{ pin.status === 'RESOLVED' ? 'Resuelto' : 'Abierto' }}
          </span>
        </div>
        <p class="text-gray-600 truncate mt-1">
          {{ getFirstComment(pin) }}
        </p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Pin } from '~/types/pin';

interface Props {
  pins: Pin[];
  currentIndex: number;
  showList?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showList: false,
});

defineEmits<{
  navigate: [direction: 'prev' | 'next'];
  select: [pinId: string];
  'toggle-list': [];
}>();

const getFirstComment = (pin: Pin) => {
  const firstComment = pin.comments?.[0];
  return firstComment?.content || 'Sin comentarios';
};
</script>
```

### Paso 6: Integración en PlanViewer

**Archivo**: `apps/frontend/components/plans/PlanViewer.vue` (modificaciones)

Integrar la funcionalidad de pines en el visor existente.

**Cambios necesarios**:

1. Importar composable y componentes
2. Manejar eventos de clic para crear pines
3. Renderizar pines sobre el plano
4. Gestionar estados de modales/drawers

```vue
<template>
  <div class="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-100"> 
    <!-- Sidebar existente -->
    <LayerSidebar 
      :layers="currentPlan?.layers || []" 
      @add-layer="!isGuestMode && (showUploadModal = true)"
    />

    <!-- Main Stage Area -->
    <div class="flex-1 relative flex flex-col">
       <!-- Toolbar existente -->
       <div class="h-12 bg-white border-b border-gray-200 flex items-center px-4 shadow-sm z-10">
          <h2 class="text-sm font-semibold text-gray-800 mr-4">
             {{ currentPlan?.sheetName }} <span class="text-gray-400 font-normal">v{{ currentPlan?.version }}</span>
          </h2>
          <div class="flex-1"></div>
          
          <!-- Toggle modo de creación de pines -->
          <button
            v-if="hasLayers"
            class="mr-4 px-3 py-1.5 text-xs font-medium rounded transition-colors"
            :class="{
              'bg-primary text-white': isPinMode,
              'bg-gray-100 text-gray-700 hover:bg-gray-200': !isPinMode,
            }"
            @click="togglePinMode"
          >
            {{ isPinMode ? '✓ Modo Pin' : '+ Añadir Pin' }}
          </button>

          <div class="text-xs text-gray-500 font-mono">
             Zoom: {{ Math.round(scale * 100) }}%
          </div>
       </div>

       <!-- Canvas Container -->
       <div 
         ref="containerRef"
         class="flex-1 overflow-hidden p-0 relative flex items-center justify-center bg-gray-50 bg-dots z-0 select-none"
         :class="{ 
           'cursor-grab': !isDragging && !isPinMode,
           'cursor-grabbing': isDragging && !isPinMode,
           'cursor-crosshair': isPinMode,
         }"
         @wheel.prevent="onWheel"
         @pointerdown="onPointerDown"
         @pointermove="onPointerMove"
         @pointerup="onPointerUp"
         @pointercancel="onPointerUp"
       >
          <div v-if="loading" class="text-gray-500 animate-pulse">Cargando plano...</div>
          <div v-else-if="error" class="text-red-500 bg-red-50 p-4 rounded border border-red-200">
             Error: {{ error }}
          </div>
          <div v-else-if="!hasLayers" class="text-center text-gray-400">
             <p class="mb-2">El plano está vacío.</p>
             <button v-if="!isGuestMode" @click="showUploadModal = true" class="text-primary hover:underline">Sube una capa base</button>
          </div>
          <div v-else>
             <!-- Transform Layer -->
             <div 
               ref="planContentRef"
               class="plan-content origin-top-left will-change-transform absolute top-0 left-0"
               :style="transformStyle"
             >
                <!-- Renderizado de capas superpuestas -->
                <div class="relative w-full h-full"> 
                  <template v-for="layer in currentPlan?.layers?.filter(l => l.status === 'READY')" :key="layer.id">
                    <img 
                      :src="getImageUrl(layer.imageUrl)" 
                      class="max-w-none pointer-events-none absolute top-0 left-0" 
                      draggable="false"
                      @load="onImageLoad" 
                    />
                  </template>

                  <!-- Renderizado de Pines -->
                  <PinMarker
                    v-for="pin in visiblePins"
                    :key="pin.id"
                    :pin="pin"
                    @click="handlePinClick"
                  />
                </div>
             </div>

             <!-- Controls Overlay existentes -->
             <div class="absolute bottom-6 right-6 z-10 transition-opacity duration-300 hover:opacity-100 opacity-90">
               <PlanControls 
                 :zoom-level="scale"
                 @zoom-in="handleZoomIn"
                 @zoom-out="handleZoomOut" 
                 @reset="reset"
                 @fit="handleFit"
               />
             </div>

             <!-- Pin List & Navigation -->
             <PinList
               v-if="visiblePins.length > 0"
               :pins="visiblePins"
               :current-index="currentPinIndex"
               :show-list="showPinList"
               @navigate="handlePinNavigation"
               @select="handlePinSelect"
               @toggle-list="showPinList = !showPinList"
             />
          </div>
       </div>
    </div>

    <!-- Modals y Drawers -->
    <LayerUploadModal 
       v-if="currentPlan && !isGuestMode"
       v-model="showUploadModal" 
       :plan-id="currentPlan.id"
       @success="onUploadSuccess"
    />

    <CreatePinModal
      v-model="showCreatePinModal"
      :coords="pendingPinCoords"
      :loading="pinsLoading"
      @submit="handleCreatePin"
    />

    <CommentsDrawer
      v-model="showCommentsDrawer"
      :pin="selectedPin"
      :loading="pinsLoading"
      :can-resolve="canResolve"
      @add-comment="handleAddComment"
      @toggle-status="handleToggleStatus"
    />
  </div>
</template>

<script setup lang="ts">
import LayerSidebar from '@/components/layers/LayerSidebar.vue'
import LayerUploadModal from '@/components/layers/LayerUploadModal.vue'
import PlanControls from '@/components/plans/PlanControls.vue'
import PinMarker from '@/components/pins/PinMarker.vue'
import PinList from '@/components/pins/PinList.vue'
import CreatePinModal from '@/components/pins/CreatePinModal.vue'
import CommentsDrawer from '@/components/pins/CommentsDrawer.vue'

const props = defineProps<{
    planId: string
    projectId?: string
    isGuestMode?: boolean
}>()

const { setCurrentPlan, currentPlan, loading, error } = usePlans()
const showUploadModal = ref(false)
const config = useRuntimeConfig()

// --- Composable de Pines ---
const {
  pins,
  selectedPin,
  loading: pinsLoading,
  isGuest,
  canResolve,
  fetchPinsByLayer,
  createPin,
  addComment,
  updatePinStatus,
  selectPin,
  deselectPin,
} = usePins()

// --- Estados de UI para Pines ---
const isPinMode = ref(false)
const showCreatePinModal = ref(false)
const showCommentsDrawer = ref(false)
const showPinList = ref(false)
const pendingPinCoords = ref({ x: 0, y: 0 })
const currentPinIndex = ref(0)
const planContentRef = ref<HTMLElement | null>(null)

// --- Navigation Logic (US-004) existente ---
const containerRef = ref<HTMLElement | null>(null)
const baseImageRef = ref<HTMLImageElement | null>(null)

const { 
  scale, 
  position,
  transformStyle, 
  isDragging,
  zoomToPoint, 
  startDrag, 
  onDrag, 
  stopDrag, 
  reset,
  fitToScreen
} = usePlanNavigation()

const onWheel = (e: WheelEvent) => {
  if (!containerRef.value || isPinMode.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const point = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  const delta = Math.sign(e.deltaY) 
  zoomToPoint(delta, point)
}

const onPointerDown = (e: PointerEvent) => {
  if (!containerRef.value) return
  
  // Modo creación de pin
  if (isPinMode.value) {
    handleCanvasClick(e)
    return
  }
  
  // Modo navegación
  (e.target as Element).setPointerCapture(e.pointerId)
  startDrag({ x: e.clientX, y: e.clientY })
}

const onPointerMove = (e: PointerEvent) => {
  if (!isPinMode.value) {
    onDrag({ x: e.clientX, y: e.clientY })
  }
}

const onPointerUp = (e: PointerEvent) => {
  if (!isPinMode.value && e.target) {
    (e.target as Element).releasePointerCapture(e.pointerId)
  }
  stopDrag()
}

// --- Lógica de Pines ---

const togglePinMode = () => {
  isPinMode.value = !isPinMode.value
  if (isPinMode.value) {
    // Cerrar drawer si está abierto
    showCommentsDrawer.value = false
  }
}

/**
 * Convertir coordenadas de click a coordenadas relativas (0-1)
 */
const getRelativeCoords = (e: PointerEvent): { x: number; y: number } | null => {
  if (!planContentRef.value || !baseImageRef.value) return null

  const planRect = planContentRef.value.getBoundingClientRect()
  const containerRect = containerRef.value!.getBoundingClientRect()

  // Coordenadas del click relativas al contenedor
  const clickX = e.clientX - containerRect.left
  const clickY = e.clientY - containerRect.top

  // Coordenadas del plano transformado relativas al contenedor
  const planX = planRect.left - containerRect.left
  const planY = planRect.top - containerRect.top

  // Coordenadas relativas al plano (antes del scale)
  const relativeX = (clickX - planX) / scale.value
  const relativeY = (clickY - planY) / scale.value

  // Normalizar a 0-1
  const normalizedX = relativeX / baseImageRef.value.naturalWidth
  const normalizedY = relativeY / baseImageRef.value.naturalHeight

  // Validar que está dentro de los límites
  if (normalizedX < 0 || normalizedX > 1 || normalizedY < 0 || normalizedY > 1) {
    return null
  }

  return { x: normalizedX, y: normalizedY }
}

const handleCanvasClick = (e: PointerEvent) => {
  if (!isPinMode.value) return

  const coords = getRelativeCoords(e)
  if (!coords) {
    // Click fuera del plano
    return
  }

  // Abrir modal para escribir comentario
  pendingPinCoords.value = coords
  showCreatePinModal.value = true
}

const handleCreatePin = async (content: string) => {
  if (!currentVisibleLayer.value) return

  try {
    await createPin(currentVisibleLayer.value.id, {
      xCoord: pendingPinCoords.value.x,
      yCoord: pendingPinCoords.value.y,
      content,
    })

    showCreatePinModal.value = false
    isPinMode.value = false
  } catch (e) {
    console.error('Error creating pin:', e)
  }
}

const handlePinClick = async (pinId: string) => {
  await selectPin(pinId)
  showCommentsDrawer.value = true
  
  // Actualizar índice actual
  currentPinIndex.value = visiblePins.value.findIndex(p => p.id === pinId)
}

const handlePinSelect = async (pinId: string) => {
  await handlePinClick(pinId)
}

const handleAddComment = async (content: string) => {
  if (!selectedPin.value) return

  try {
    await addComment(selectedPin.value.id, { content })
  } catch (e) {
    console.error('Error adding comment:', e)
  }
}

const handleToggleStatus = async () => {
  if (!selectedPin.value) return

  const newStatus = selectedPin.value.status === 'RESOLVED' ? 'OPEN' : 'RESOLVED'

  try {
    await updatePinStatus(selectedPin.value.id, { status: newStatus })
  } catch (e) {
    console.error('Error updating status:', e)
  }
}

const handlePinNavigation = (direction: 'prev' | 'next') => {
  const newIndex = direction === 'prev' 
    ? Math.max(0, currentPinIndex.value - 1)
    : Math.min(visiblePins.value.length - 1, currentPinIndex.value + 1)

  currentPinIndex.value = newIndex
  const pinId = visiblePins.value[newIndex]?.id
  if (pinId) {
    handlePinClick(pinId)
  }
}

// --- Computed ---

const hasLayers = computed(() => {
    return currentPlan.value?.layers && currentPlan.value.layers.length > 0
})

const currentVisibleLayer = computed(() => {
  // Obtener la primera capa visible (lógica simplificada)
  // En una implementación más compleja, podrías tener un selector de capa activa
  return currentPlan.value?.layers?.find(l => l.status === 'READY') || null
})

const visiblePins = computed(() => {
  if (!currentVisibleLayer.value) return []
  return pins.value.filter(pin => pin.layerId === currentVisibleLayer.value!.id)
})

// --- Helpers existentes ---

const getCenterPoint = () => {
  if (!containerRef.value) return { x: 0, y: 0 }
  const rect = containerRef.value.getBoundingClientRect()
  return { x: rect.width / 2, y: rect.height / 2 }
}

const handleZoomIn = () => zoomToPoint(-1, getCenterPoint())
const handleZoomOut = () => zoomToPoint(1, getCenterPoint())

const handleFit = () => {
    if (!containerRef.value || !baseImageRef.value) return
    const rect = containerRef.value.getBoundingClientRect()
    const img = baseImageRef.value
    
    if (img.naturalWidth && img.naturalHeight) {
       scale.value = Math.min(rect.width / img.naturalWidth, rect.height / img.naturalHeight) * 0.9
       position.value.x = (rect.width - img.naturalWidth * scale.value) / 2
       position.value.y = (rect.height - img.naturalHeight * scale.value) / 2
    }
}

const onImageLoad = (e: Event) => {
    const img = e.target as HTMLImageElement
    if (!baseImageRef.value) {
        baseImageRef.value = img
        handleFit()
    }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return
  const center = getCenterPoint()
  switch(e.key) {
    case '+': case '=': zoomToPoint(-1, center); break
    case '-': zoomToPoint(1, center); break
    case '0': case 'r': case 'R': reset(); break
  }
}

const getImageUrl = (path?: string) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    const configuredUrl = config.public.socketUrl || 'http://localhost:4000'
    const baseUrl = configuredUrl.replace(/\/$/, '')
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${baseUrl}${cleanPath}`
}

// --- Lifecycle ---

onMounted(async () => {
    await setCurrentPlan(props.planId, props.projectId)
    window.addEventListener('keydown', handleKeydown)

    // Cargar pines de la capa visible
    if (currentVisibleLayer.value) {
      await fetchPinsByLayer(currentVisibleLayer.value.id)
    }
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
})

const onUploadSuccess = () => {
    // Refresh
}

// Watch para cargar pines cuando cambia la capa visible
watch(currentVisibleLayer, async (newLayer) => {
  if (newLayer) {
    await fetchPinsByLayer(newLayer.id)
  }
}, { immediate: false })
</script>

<style scoped>
.bg-dots {
  background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
```

### Paso 7: Ajustes en UiInput para Textarea

**Archivo**: `apps/frontend/components/common/UiInput.vue` (modificación)

Asegurar que el componente UiInput soporte tipo `textarea`.

```vue
<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>
    
    <textarea
      v-if="type === 'textarea'"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
      :class="{ 'border-red-500': errorMessage, 'border-gray-300': !errorMessage }"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      @keyup.enter="$emit('keyup.enter')"
    />
    
    <input
      v-else
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      :class="{ 'border-red-500': errorMessage, 'border-gray-300': !errorMessage }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @keyup.enter="$emit('keyup.enter')"
    />

    <p v-if="errorMessage" class="mt-1 text-sm text-red-600">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number
  label?: string
  placeholder?: string
  errorMessage?: string
  type?: string
  disabled?: boolean
  rows?: number
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  rows: 3,
})

defineEmits<{
  'update:modelValue': [value: string | number]
  'keyup.enter': []
}>()
</script>
```

### Paso 8: Instalar Dependencia date-fns

**Comando**: 
```bash
cd apps/frontend
npm install date-fns
```

## 5. Testing

### 5.1 Test: PinMarker.spec.ts

**Archivo**: `apps/frontend/tests/unit/components/pins/PinMarker.spec.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PinMarker from '~/components/pins/PinMarker.vue';
import type { Pin } from '~/types/pin';

describe('PinMarker', () => {
  const mockPin: Pin = {
    id: '1',
    layerId: 'layer1',
    xCoord: 0.5,
    yCoord: 0.3,
    status: 'OPEN',
    createdBy: 'user1',
    guestName: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    comments: [
      { id: 'c1', pinId: '1', content: 'Test', authorId: 'user1', guestName: null, createdAt: '2024-01-01T00:00:00Z' }
    ]
  };

  it('should render correctly', () => {
    const wrapper = mount(PinMarker, {
      props: { pin: mockPin }
    });

    expect(wrapper.find('.pin-marker').exists()).toBe(true);
  });

  it('should apply correct position styles', () => {
    const wrapper = mount(PinMarker, {
      props: { pin: mockPin }
    });

    const button = wrapper.find('.pin-marker');
    const style = button.attributes('style');
    
    expect(style).toContain('left: 50%');
    expect(style).toContain('top: 30%');
  });

  it('should apply OPEN status classes', () => {
    const wrapper = mount(PinMarker, {
      props: { pin: mockPin }
    });

    const button = wrapper.find('.pin-marker');
    expect(button.classes()).toContain('text-orange-500');
  });

  it('should apply RESOLVED status classes', () => {
    const resolvedPin = { ...mockPin, status: 'RESOLVED' as const };
    const wrapper = mount(PinMarker, {
      props: { pin: resolvedPin }
    });

    const button = wrapper.find('.pin-marker');
    expect(button.classes()).toContain('text-gray-400');
    expect(button.classes()).toContain('opacity-60');
  });

  it('should show comment count badge', () => {
    const wrapper = mount(PinMarker, {
      props: { pin: mockPin }
    });

    const badge = wrapper.find('.bg-red-600');
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe('1');
  });

  it('should show 9+ for more than 9 comments', () => {
    const pinWithManyComments = {
      ...mockPin,
      comments: Array(15).fill(null).map((_, i) => ({
        id: `c${i}`,
        pinId: '1',
        content: 'Test',
        authorId: 'user1',
        guestName: null,
        createdAt: '2024-01-01T00:00:00Z'
      }))
    };

    const wrapper = mount(PinMarker, {
      props: { pin: pinWithManyComments }
    });

    const badge = wrapper.find('.bg-red-600');
    expect(badge.text()).toBe('9+');
  });

  it('should emit click event with pin id', async () => {
    const wrapper = mount(PinMarker, {
      props: { pin: mockPin }
    });

    await wrapper.find('.pin-marker').trigger('click');
    
    expect(wrapper.emitted('click')).toBeTruthy();
    expect(wrapper.emitted('click')?.[0]).toEqual(['1']);
  });

  it('should not show badge when no comments', () => {
    const pinNoComments = { ...mockPin, comments: [] };
    const wrapper = mount(PinMarker, {
      props: { pin: pinNoComments }
    });

    const badge = wrapper.find('.bg-red-600');
    expect(badge.exists()).toBe(false);
  });
});
```

### 5.2 Test: CreatePinModal.spec.ts

**Archivo**: `apps/frontend/tests/unit/components/pins/CreatePinModal.spec.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import CreatePinModal from '~/components/pins/CreatePinModal.vue';

// Mock components
vi.mock('~/components/common/UiModal.vue', () => ({
  default: {
    name: 'UiModal',
    template: '<div><slot name="title" /><slot /><slot name="footer" /></div>',
    props: ['modelValue'],
    emits: ['update:modelValue']
  }
}));

vi.mock('~/components/common/UiInput.vue', () => ({
  default: {
    name: 'UiInput',
    props: ['modelValue', 'label', 'placeholder', 'errorMessage', 'type', 'rows'],
    emits: ['update:modelValue'],
    template: '<textarea v-if="type === \'textarea\'" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><input v-else :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
  }
}));

vi.mock('~/components/common/UiButton.vue', () => ({
  default: {
    name: 'UiButton',
    props: ['variant', 'loading', 'disabled'],
    template: '<button :disabled="disabled"><slot /></button>'
  }
}));

describe('CreatePinModal', () => {
  const mockCoords = { x: 0.5, y: 0.3 };

  it('should render correctly', () => {
    const wrapper = mount(CreatePinModal, {
      props: {
        modelValue: true,
        coords: mockCoords
      }
    });

    expect(wrapper.find('textarea').exists()).toBe(true);
  });

  it('should validate minimum content length', async () => {
    const wrapper = mount(CreatePinModal, {
      props: {
        modelValue: true,
        coords: mockCoords
      }
    });

    const textarea = wrapper.find('textarea');
    const submitButton = wrapper.findAll('button').find(b => b.text().includes('Crear'));

    // Content muy corto
    await textarea.setValue('Ab');
    await wrapper.vm.$nextTick();
    expect(submitButton?.attributes('disabled')).toBeDefined();

    // Content válido
    await textarea.setValue('Este es un comentario válido');
    await wrapper.vm.$nextTick();
    expect(submitButton?.attributes('disabled')).toBeUndefined();
  });

  it('should emit submit with trimmed content', async () => {
    const wrapper = mount(CreatePinModal, {
      props: {
        modelValue: true,
        coords: mockCoords
      }
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('  Test comment  ');
    
    const submitButton = wrapper.findAll('button').find(b => b.text().includes('Crear'));
    await submitButton?.trigger('click');

    expect(wrapper.emitted('submit')).toBeTruthy();
    expect(wrapper.emitted('submit')?.[0]).toEqual(['Test comment']);
  });

  it('should display coordinates info', () => {
    const wrapper = mount(CreatePinModal, {
      props: {
        modelValue: true,
        coords: mockCoords
      }
    });

    const text = wrapper.text();
    expect(text).toContain('X: 50%');
    expect(text).toContain('Y: 30%');
  });

  it('should reset content when modal closes', async () => {
    const wrapper = mount(CreatePinModal, {
      props: {
        modelValue: true,
        coords: mockCoords
      }
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('Some content');

    // Cerrar modal
    await wrapper.setProps({ modelValue: false });
    await wrapper.vm.$nextTick();

    // Reabrir
    await wrapper.setProps({ modelValue: true });
    await wrapper.vm.$nextTick();

    expect(textarea.element.value).toBe('');
  });

  it('should emit close on cancel button', async () => {
    const wrapper = mount(CreatePinModal, {
      props: {
        modelValue: true,
        coords: mockCoords
      }
    });

    const cancelButton = wrapper.findAll('button').find(b => b.text().includes('Cancelar'));
    await cancelButton?.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });
});
```

### 5.3 Test: CommentsDrawer.spec.ts

**Archivo**: `apps/frontend/tests/unit/components/pins/CommentsDrawer.spec.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import CommentsDrawer from '~/components/pins/CommentsDrawer.vue';
import type { Pin } from '~/types/pin';

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn(() => '1 de enero, 2024'),
  formatDistanceToNow: vi.fn(() => 'hace 2 horas'),
}));

vi.mock('date-fns/locale', () => ({
  es: {}
}));

// Mock components
vi.mock('~/components/common/UiButton.vue', () => ({
  default: {
    name: 'UiButton',
    props: ['variant', 'loading', 'disabled'],
    template: '<button :disabled="disabled"><slot /></button>'
  }
}));

describe('CommentsDrawer', () => {
  const mockPin: Pin = {
    id: '1',
    layerId: 'layer1',
    xCoord: 0.5,
    yCoord: 0.3,
    status: 'OPEN',
    createdBy: 'user1',
    guestName: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    comments: [
      {
        id: 'c1',
        pinId: '1',
        content: 'Primer comentario',
        authorId: 'user1',
        guestName: null,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'c2',
        pinId: '1',
        content: 'Segundo comentario',
        authorId: null,
        guestName: 'Invitado',
        createdAt: '2024-01-01T01:00:00Z'
      }
    ]
  };

  it('should render comments list', () => {
    const wrapper = mount(CommentsDrawer, {
      props: {
        modelValue: true,
        pin: mockPin
      },
      attachTo: document.body
    });

    const comments = wrapper.findAll('.bg-gray-50');
    expect(comments.length).toBe(2);
    expect(wrapper.text()).toContain('Primer comentario');
    expect(wrapper.text()).toContain('Segundo comentario');

    wrapper.unmount();
  });

  it('should display author names correctly', () => {
    const wrapper = mount(CommentsDrawer, {
      props: {
        modelValue: true,
        pin: mockPin
      },
      attachTo: document.body
    });

    const text = wrapper.text();
    expect(text).toContain('Invitado');

    wrapper.unmount();
  });

  it('should show resolved badge when status is RESOLVED', () => {
    const resolvedPin = { ...mockPin, status: 'RESOLVED' as const };
    const wrapper = mount(CommentsDrawer, {
      props: {
        modelValue: true,
        pin: resolvedPin
      },
      attachTo: document.body
    });

    expect(wrapper.text()).toContain('Resuelto');

    wrapper.unmount();
  });

  it('should emit add-comment event', async () => {
    const wrapper = mount(CommentsDrawer, {
      props: {
        modelValue: true,
        pin: mockPin
      },
      attachTo: document.body
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('Nuevo comentario');

    const sendButton = wrapper.findAll('button').find(b => b.text() === 'Enviar');
    await sendButton?.trigger('click');

    expect(wrapper.emitted('add-comment')).toBeTruthy();
    expect(wrapper.emitted('add-comment')?.[0]).toEqual(['Nuevo comentario']);

    wrapper.unmount();
  });

  it('should disable send button when textarea is empty', () => {
    const wrapper = mount(CommentsDrawer, {
      props: {
        modelValue: true,
        pin: mockPin
      },
      attachTo: document.body
    });

    const sendButton = wrapper.findAll('button').find(b => b.text() === 'Enviar');
    expect(sendButton?.attributes('disabled')).toBeDefined();

    wrapper.unmount();
  });

  it('should show resolve button only when canResolve is true', () => {
    const wrapper = mount(CommentsDrawer, {
      props: {
        modelValue: true,
        pin: mockPin,
        canResolve: true
      },
      attachTo: document.body
    });

    const resolveButton = wrapper.findAll('button').find(b => 
      b.text() === 'Resolver' || b.text() === 'Reabrir'
    );
    expect(resolveButton).toBeDefined();

    wrapper.unmount();
  });

  it('should not show resolve button when canResolve is false', () => {
    const wrapper = mount(CommentsDrawer, {
      props: {
        modelValue: true,
        pin: mockPin,
        canResolve: false
      },
      attachTo: document.body
    });

    const buttons = wrapper.findAll('button');
    const resolveButton = buttons.find(b => 
      b.text() === 'Resolver' || b.text() === 'Reabrir'
    );
    expect(resolveButton).toBeUndefined();

    wrapper.unmount();
  });

  it('should emit toggle-status event', async () => {
    const wrapper = mount(CommentsDrawer, {
      props: {
        modelValue: true,
        pin: mockPin,
        canResolve: true
      },
      attachTo: document.body
    });

    const resolveButton = wrapper.findAll('button').find(b => b.text() === 'Resolver');
    await resolveButton?.trigger('click');

    expect(wrapper.emitted('toggle-status')).toBeTruthy();

    wrapper.unmount();
  });

  it('should emit close on backdrop click', async () => {
    const wrapper = mount(CommentsDrawer, {
      props: {
        modelValue: true,
        pin: mockPin
      },
      attachTo: document.body
    });

    const backdrop = wrapper.find('.bg-black');
    await backdrop.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);

    wrapper.unmount();
  });

  it('should clear textarea after emitting add-comment', async () => {
    const wrapper = mount(CommentsDrawer, {
      props: {
        modelValue: true,
        pin: mockPin
      },
      attachTo: document.body
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('Test');

    const sendButton = wrapper.findAll('button').find(b => b.text() === 'Enviar');
    await sendButton?.trigger('click');

    await wrapper.vm.$nextTick();
    expect((textarea.element as HTMLTextAreaElement).value).toBe('');

    wrapper.unmount();
  });
});
```

### 5.4 Test: usePins.spec.ts

**Archivo**: `apps/frontend/tests/unit/composables/usePins.spec.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePins } from '~/composables/usePins';

// Mock $fetch
global.$fetch = vi.fn();

// Mock stores
vi.mock('~/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    token: 'auth-token',
    isAuthenticated: true
  }))
}));

vi.mock('~/stores/guest', () => ({
  useGuestStore: vi.fn(() => ({
    guestToken: null,
    isGuest: false
  }))
}));

vi.mock('~/stores/toast', () => ({
  useToastStore: vi.fn(() => ({
    add: vi.fn()
  }))
}));

// Mock runtime config
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      apiBase: 'http://localhost:4000/api'
    }
  })
}));

describe('usePins', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { pins, selectedPin, loading, error } = usePins();

    expect(pins.value).toEqual([]);
    expect(selectedPin.value).toBeNull();
    expect(loading.value).toBe(false);
    expect(error.value).toBeNull();
  });

  it('should fetch pins by layer', async () => {
    const mockPins = [
      { id: '1', layerId: 'layer1', xCoord: 0.5, yCoord: 0.3, status: 'OPEN' }
    ];

    (global.$fetch as any).mockResolvedValueOnce({ pins: mockPins });

    const { fetchPinsByLayer, pins } = usePins();
    await fetchPinsByLayer('layer1');

    expect(pins.value).toEqual(mockPins);
    expect(global.$fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/layers/layer1/pins',
      expect.objectContaining({
        headers: { Authorization: 'Bearer auth-token' }
      })
    );
  });

  it('should create pin', async () => {
    const mockPin = {
      id: '1',
      layerId: 'layer1',
      xCoord: 0.5,
      yCoord: 0.3,
      status: 'OPEN',
      comments: [{ id: 'c1', content: 'Test' }]
    };

    (global.$fetch as any).mockResolvedValueOnce(mockPin);

    const { createPin, pins } = usePins();
    const result = await createPin('layer1', {
      xCoord: 0.5,
      yCoord: 0.3,
      content: 'Test comment'
    });

    expect(result).toEqual(mockPin);
    expect(pins.value).toContainEqual(mockPin);
  });

  it('should update pin status', async () => {
    const { updatePinStatus, pins } = usePins();
    
    pins.value = [
      { id: '1', layerId: 'layer1', xCoord: 0.5, yCoord: 0.3, status: 'OPEN', createdBy: 'user1', guestName: null, createdAt: '', updatedAt: '' }
    ];

    (global.$fetch as any).mockResolvedValueOnce({
      id: '1',
      status: 'RESOLVED',
      updatedAt: '2024-01-01T00:00:00Z'
    });

    await updatePinStatus('1', { status: 'RESOLVED' });

    expect(pins.value[0].status).toBe('RESOLVED');
  });

  it('should compute canResolve correctly', () => {
    const { canResolve } = usePins();
    
    // Should be true for non-guest authenticated users
    expect(canResolve.value).toBe(true);
  });
});
```

## 6. Flujo de UX y Feedback

### 6.1 Estados de Carga

- **Cargando pines**: Mostrar spinner en lista de pines
- **Creando pin**: Deshabilitar botón de crear y mostrar loading
- **Añadiendo comentario**: Deshabilitar textarea y botón de enviar
- **Actualizando estado**: Deshabilitar botón de resolver

### 6.2 Feedback Visual

1. **Pin creado**: Toast verde "Pin creado correctamente"
2. **Comentario añadido**: Toast verde "Comentario añadido"
3. **Pin resuelto**: Toast verde "Pin resuelto"
4. **Error genérico**: Toast rojo con mensaje de error
5. **Guest intenta resolver**: Toast rojo "Los invitados no pueden resolver pines"

### 6.3 Animaciones

- **Drawer**: Transición slide-in desde la derecha (300ms)
- **Pin hover**: Scale 1.25 con transition
- **Toast**: Fade in/out
- **Backdrop**: Fade opacity

## 7. Ajustes de UI según Tipo de Usuario

### 7.1 Usuario Guest

- **Puede**: Crear pines, añadir comentarios
- **NO puede**: Resolver pines (botón oculto)
- **Identificación**: Se muestra `guestName` en comentarios

### 7.2 Usuario Autenticado

- **Puede**: Crear pines, añadir comentarios, resolver pines
- **Identificación**: Se muestra `authorId` (o nombre de usuario si está disponible)

### 7.3 Detección de Guest

```typescript
// En cualquier componente
const guestStore = useGuestStore()
const authStore = useAuthStore()

const isGuest = computed(() => guestStore.isGuest)
const isAuthenticated = computed(() => authStore.isAuthenticated && !isGuest.value)
```

## 8. Validación de la Tarea

### 8.1 Checklist de Funcionalidad

- [ ] Al hacer clic en el plano (modo pin), se abre modal para escribir comentario
- [ ] Pin aparece en coordenadas correctas (relativas al zoom/pan)
- [ ] Al hacer clic en pin existente, se abre drawer con comentarios
- [ ] Se puede añadir comentario nuevo desde el drawer
- [ ] Comentarios muestran autor (guest o usuario) y timestamp
- [ ] Usuario autenticado puede marcar pin como resuelto
- [ ] Pin resuelto cambia de color (naranja → gris)
- [ ] Usuario guest NO ve botón de resolver
- [ ] Navegación prev/next funciona correctamente
- [ ] Lista de pines muestra todos los pines de la capa visible
- [ ] Coordenadas se calculan correctamente independiente del zoom

### 8.2 Checklist de Testing

- [ ] Tests unitarios de PinMarker pasan (8 tests)
- [ ] Tests unitarios de CreatePinModal pasan (6 tests)
- [ ] Tests unitarios de CommentsDrawer pasan (10 tests)
- [ ] Tests unitarios de usePins pasan (5 tests)
- [ ] Coverage > 80% en nuevos componentes

### 8.3 Checklist de Diseño

- [ ] Colores consistentes con paleta del proyecto (primary, secondary)
- [ ] Tipografía consistente (font-sizes, weights)
- [ ] Espaciado consistente (padding, margins)
- [ ] Componentes responsive (mobile, tablet, desktop)
- [ ] Animaciones suaves y no intrusivas
- [ ] Estados de hover/focus claros
- [ ] Feedback visual inmediato en todas las acciones

### 8.4 Checklist de Arquitectura

- [ ] Composable `usePins` encapsula toda la lógica de negocio
- [ ] Componentes siguen patrón de componentes "tontos" (reciben props, emiten eventos)
- [ ] Types definidos en archivo separado
- [ ] No hay lógica de negocio en componentes Vue
- [ ] Uso correcto de computed, watch y refs
- [ ] Manejo de errores apropiado en todas las peticiones
- [ ] Toast notifications en todas las acciones

### 8.5 Validación Manual

1. **Crear Pin**:
   - Click en "Añadir Pin"
   - Click en zona del plano
   - Escribir comentario (mín 3 chars)
   - Verificar que pin aparece
   - Verificar toast de éxito

2. **Ver Comentarios**:
   - Click en pin existente
   - Verificar que drawer se abre
   - Verificar lista de comentarios ordenados
   - Verificar nombres de autores

3. **Añadir Comentario**:
   - Con drawer abierto, escribir respuesta
   - Click en "Enviar"
   - Verificar que comentario aparece
   - Verificar toast de éxito

4. **Resolver Pin** (solo no-guest):
   - Con drawer abierto, click en "Resolver"
   - Verificar que pin cambia de color
   - Verificar badge "Resuelto" en header
   - Verificar toast de éxito

5. **Navegación**:
   - Verificar que prev/next cicla entre pines
   - Verificar que índice actual se actualiza
   - Verificar que drawer actualiza contenido

6. **Guest Mode**:
   - Acceder como guest
   - Crear pin → debe funcionar
   - Añadir comentario → debe funcionar
   - Verificar que NO hay botón "Resolver"

7. **Responsive**:
   - Verificar en mobile (drawer full-width)
   - Verificar en tablet
   - Verificar en desktop

### 8.6 Criterios de Aceptación (Gherkin)

#### Escenario 1: Crear un Pin ✅
```gherkin
Dado que estoy viendo un plano
Cuando hago clic en una zona (coordenada X,Y)
Entonces aparece un marcador visual (Pin) en ese punto
Y se abre un panel lateral o modal para escribir texto
```

#### Escenario 2: Hilo de discusión ✅
```gherkin
Dado un pin existente con comentarios previos
Cuando hago clic en el pin
Entonces se despliega el historial de la conversación ordenado cronológicamente
Y puedo añadir una respuesta nueva
```

#### Escenario 3: Resolver comentario (Solo Arquitecto) ✅
```gherkin
Dado un comentario pendiente que ya ha sido atendido en el diseño
Cuando el Arquitecto marca el hilo como "Resuelto"
Entonces el pin cambia de estado visualmente (se atenúa o cambia de color)
Y se considera cerrado
```

## 9. Comandos de Ejecución

### Desarrollo
```bash
cd apps/frontend
npm run dev
```

### Testing
```bash
cd apps/frontend
npm run test:unit
```

### Testing con Coverage
```bash
cd apps/frontend
npm run test:unit -- --coverage
```

### Build
```bash
cd apps/frontend
npm run build
```

## 10. Notas Adicionales

### 10.1 Mejoras Futuras (Fuera de Scope)

- [ ] Adjuntar imágenes en comentarios
- [ ] Notificaciones en tiempo real via WebSockets
- [ ] Sistema de "no leídos" persistente
- [ ] Editar/eliminar comentarios propios
- [ ] Menciones a otros usuarios (@usuario)
- [ ] Filtros de pines (por estado, por autor, por fecha)
- [ ] Búsqueda de pines por contenido

### 10.2 Consideraciones Técnicas

1. **Performance**: Los pines se renderizan como componentes Vue individuales. Para planos con >100 pines, considerar virtualización.

2. **Coordenadas Relativas**: El uso de porcentajes (0-1) garantiza que los pines se mantengan en posición correcta independientemente del zoom o tamaño de ventana.

3. **Carga por Capa**: Los pines se cargan solo para la capa visible. Si se implementa selector de capas múltiples, ajustar la lógica de `visiblePins`.

4. **Refresh Manual**: Sin WebSockets, los usuarios deben refrescar la página para ver nuevos pines/comentarios de otros usuarios.

5. **Detección de Guest**: Se basa en `guestStore.isGuest` que verifica la presencia de `guestToken` y rol 'GUEST'.

---

## 11. Resumen Ejecutivo

**Ticket**: FRONT-007  
**Story**: US-006  
**Estimación**: 8 pts  
**Archivos Nuevos**: 9  
**Archivos Modificados**: 2  
**Tests Nuevos**: 4 (29 test cases)  

**Componentes Creados**:
- PinMarker.vue
- CreatePinModal.vue
- CommentsDrawer.vue
- PinList.vue

**Composables Creados**:
- usePins.ts

**Types Creados**:
- types/pin.ts

**Dependencias**:
- date-fns (formateo de fechas)

**APIs Utilizadas**:
- POST /api/layers/:layerId/pins
- GET /api/layers/:layerId/pins
- GET /api/pins/:pinId
- POST /api/pins/:pinId/comments
- PATCH /api/pins/:pinId/status

**Características Principales**:
✅ Creación de pines con coordenadas relativas  
✅ Hilos de comentarios contextuales  
✅ Resolución de pines (solo no-guest)  
✅ Navegación entre pines (prev/next)  
✅ UI diferenciada por estado (OPEN/RESOLVED)  
✅ Soporte completo para usuarios guest  
✅ Testing unitario completo  
✅ Feedback visual inmediato  

**Tiempo Estimado de Implementación**: 2-3 días

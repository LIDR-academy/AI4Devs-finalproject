# Plan de Implementación: FRONT-006 - Layout Público (Guest) y Flujo de Invitación

**Estado:** Pendiente  
**Estimación:** 5 puntos  
**Prioridad:** Media (P2)

## 1. Resumen de la Tarea

Implementar el sistema completo de acceso público para invitados (guests) a proyectos compartidos, incluyendo:
- Ruta pública independiente `/p/:token`
- Modal de gestión de enlace compartido para arquitectos
- Layout simplificado para modo invitado
- Flujo de autenticación guest (intercambio token por JWT)
- Identificación del invitado (alias/nombre) con persistencia en localStorage
- Interfaz de visor preparada para comentarios futuros

## 2. Objetivos y Criterios de Aceptación

### Funcionalidades Requeridas:
✅ Arquitectos pueden activar/desactivar el acceso público desde un modal "Compartir"  
✅ El switch de activación llama al backend inmediatamente (sin botón guardar)  
✅ URL generada se puede copiar con feedback visual (toast)  
✅ Invitados acceden vía `/p/:token` sin necesidad de registro  
✅ Al primer acceso, se solicita nombre/alias en un modal  
✅ El nombre se persiste en localStorage para futuras visitas  
✅ Layout guest muestra versión simplificada del visor  
✅ Enlaces inválidos/revocados muestran página de error amigable  
✅ Cumplimiento de arquitectura Nuxt 3 + TypeScript + Tailwind  

## 3. Arquitectura y Componentes

### 3.1. Nuevos Archivos a Crear

```
apps/frontend/
├── pages/
│   └── p/
│       └── [token].vue                    # Ruta pública de invitado
├── components/
│   ├── projects/
│   │   └── ShareProjectModal.vue          # Modal para generar/gestionar enlace
│   └── guest/
│       ├── GuestNamePrompt.vue            # Modal para capturar nombre
│       └── GuestHeader.vue                # Header simplificado para modo guest
├── layouts/
│   └── guest.vue                          # Layout específico para invitados
├── composables/
│   └── useGuestAuth.ts                    # Lógica de autenticación guest
├── stores/
│   └── guest.ts                           # Store para estado de invitado
├── middleware/
│   └── guest-auth.ts                      # Middleware para validar acceso guest
├── types/
│   └── guest.ts                           # Tipos TypeScript para guest
└── tests/
    └── unit/
        ├── composables/
        │   └── useGuestAuth.spec.ts
        ├── stores/
        │   └── guest.spec.ts
        └── components/
            ├── ShareProjectModal.spec.ts
            └── GuestNamePrompt.spec.ts
```

## 4. Pasos de Implementación Detallados

### Paso 1: Definir Tipos TypeScript

**Archivo:** `apps/frontend/types/guest.ts`

**Tareas:**
- [ ] Crear interface `GuestUser` con propiedades: `name`, `projectId`, `token`
- [ ] Crear interface `ShareTokenResponse` con: `token`, `shareUrl`, `isActive`
- [ ] Crear interface `GuestLoginPayload` con: `token` (shareToken)
- [ ] Crear interface `GuestLoginResponse` con: `accessToken`, `user` (role: GUEST, projectId)
- [ ] Exportar tipos para uso en composables y stores

**Código Base:**
```typescript
// apps/frontend/types/guest.ts
export interface GuestUser {
  name: string;
  projectId: string;
  token: string;
  role: 'GUEST';
}

export interface ShareTokenResponse {
  token: string;
  shareUrl: string;
  isActive: boolean;
}

export interface GuestLoginPayload {
  token: string;
}

export interface GuestLoginResponse {
  accessToken: string;
  user: {
    role: 'GUEST';
    projectId: string;
  };
}

export interface RevokeShareResponse {
  success: boolean;
  message: string;
}
```

**Validación:**
- ✓ Los tipos compilan sin errores
- ✓ Interfaces coherentes con la especificación del backend (BACK-006)

---

### Paso 2: Crear Store de Guest

**Archivo:** `apps/frontend/stores/guest.ts`

**Tareas:**
- [ ] Crear store Pinia `useGuestStore`
- [ ] Estado: `guestUser`, `guestToken` (cookie), `isGuest` (computed)
- [ ] Métodos: `setGuestUser`, `setGuestToken`, `clearGuest`, `loadGuestName` (localStorage)
- [ ] Método `saveGuestName(name)` que persiste en localStorage con key `guest_name`
- [ ] Método `getPersistedGuestName()` que recupera de localStorage

**Código Base:**
```typescript
// apps/frontend/stores/guest.ts
import { defineStore } from 'pinia';
import type { GuestUser } from '~/types/guest';

export const useGuestStore = defineStore('guest', () => {
  const guestUser = ref<GuestUser | null>(null);
  const guestToken = useCookie<string | null>('guest_token');

  const isGuest = computed(() => !!guestToken.value && guestUser.value?.role === 'GUEST');

  function setGuestUser(user: GuestUser | null) {
    guestUser.value = user;
  }

  function setGuestToken(token: string | null) {
    guestToken.value = token;
  }

  function clearGuest() {
    guestUser.value = null;
    guestToken.value = null;
  }

  function saveGuestName(name: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('guest_name', name);
    }
  }

  function getPersistedGuestName(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('guest_name');
    }
    return null;
  }

  return {
    guestUser,
    guestToken,
    isGuest,
    setGuestUser,
    setGuestToken,
    clearGuest,
    saveGuestName,
    getPersistedGuestName,
  };
});
```

**Validación:**
- ✓ Store se puede importar sin errores
- ✓ `isGuest` retorna `true` solo cuando hay token y role es GUEST
- ✓ localStorage funciona correctamente (verificar con unit test)

---

### Paso 3: Crear Composable useGuestAuth

**Archivo:** `apps/frontend/composables/useGuestAuth.ts`

**Tareas:**
- [ ] Implementar método `loginAsGuest(token)` que llama a `POST /auth/guest/login`
- [ ] Intercambia shareToken por accessToken JWT
- [ ] Guarda el JWT en el store guest
- [ ] Manejo de errores (token inválido/expirado → retorna error específico)
- [ ] Estados reactivos `loading` y `error`
- [ ] Método `logout()` que limpia el store

**Código Base:**
```typescript
// apps/frontend/composables/useGuestAuth.ts
import type { GuestLoginResponse } from '~/types/guest';
import { useGuestStore } from '~/stores/guest';

export const useGuestAuth = () => {
  const config = useRuntimeConfig();
  const guestStore = useGuestStore();
  
  const loading = ref(false);
  const error = ref<string | null>(null);

  const apiBase = config.public.apiBase;

  const loginAsGuest = async (shareToken: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await $fetch<GuestLoginResponse>(`${apiBase}/auth/guest/login`, {
        method: 'POST',
        body: { token: shareToken },
      });

      guestStore.setGuestToken(response.accessToken);
      
      // Recuperar nombre persistido si existe
      const persistedName = guestStore.getPersistedGuestName();
      
      if (persistedName) {
        guestStore.setGuestUser({
          name: persistedName,
          projectId: response.user.projectId,
          token: response.accessToken,
          role: 'GUEST',
        });
      }

      return response;
    } catch (e: any) {
      const errorMessage = e.data?.message || e.message || 'Enlace inválido o expirado';
      error.value = errorMessage;
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  };

  const setGuestName = (name: string, projectId: string) => {
    guestStore.saveGuestName(name);
    guestStore.setGuestUser({
      name,
      projectId,
      token: guestStore.guestToken.value!,
      role: 'GUEST',
    });
  };

  const logout = () => {
    guestStore.clearGuest();
  };

  return {
    loading,
    error,
    loginAsGuest,
    setGuestName,
    logout,
  };
};
```

**Validación:**
- ✓ `loginAsGuest` intercambia token correctamente
- ✓ Errores 401/404 se manejan apropiadamente
- ✓ `setGuestName` persiste en localStorage

---

### Paso 4: Crear Middleware guest-auth

**Archivo:** `apps/frontend/middleware/guest-auth.ts`

**Tareas:**
- [ ] Validar que existe `guestToken` en cookies
- [ ] Si no existe, redirigir a página de error o login
- [ ] Si existe, permitir acceso
- [ ] Este middleware se aplicará a las rutas `/p/:token`

**Código Base:**
```typescript
// apps/frontend/middleware/guest-auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const guestToken = useCookie('guest_token');

  // Si no hay token de guest, el usuario no está autenticado como guest
  if (!guestToken.value) {
    // En este caso, la página p/[token] manejará el login
    // Este middleware es opcional o puede ser más permisivo
    return;
  }

  // Si hay token, continuar
  return;
});
```

**Nota:** Este middleware es opcional ya que el flujo de autenticación se manejará directamente en la página `/p/:token`.

**Validación:**
- ✓ No bloquea el acceso inicial a `/p/:token`
- ✓ Permite navegación con token válido

---

### Paso 5: Crear Componente GuestNamePrompt

**Archivo:** `apps/frontend/components/guest/GuestNamePrompt.vue`

**Tareas:**
- [ ] Modal simple usando `UiModal` base
- [ ] Input para capturar nombre/alias (usar `UiInput`)
- [ ] Validación: nombre no vacío, mínimo 2 caracteres
- [ ] Botón "Continuar" que emite evento `@submit` con el nombre
- [ ] No se puede cerrar sin proporcionar nombre (prop `closable: false`)
- [ ] Diseño coherente con la identidad del proyecto

**Código Base:**
```vue
<!-- apps/frontend/components/guest/GuestNamePrompt.vue -->
<template>
  <UiModal :model-value="true" @update:model-value="() => {}">
    <template #title>
      Bienvenido al Proyecto
    </template>
    
    <div class="space-y-4">
      <p class="text-sm text-gray-600">
        Para continuar, ingresa tu nombre o alias para identificar tus comentarios.
      </p>
      
      <UiInput
        v-model="name"
        label="Nombre o Alias"
        placeholder="Ej: Juan Pérez"
        :error-message="errorMessage"
        @keyup.enter="handleSubmit"
      />
    </div>

    <template #footer>
      <button
        type="button"
        :disabled="!isValid"
        class="inline-flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
        @click="handleSubmit"
      >
        Continuar
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  submit: [name: string]
}>();

const name = ref('');
const errorMessage = ref('');

const isValid = computed(() => name.value.trim().length >= 2);

const handleSubmit = () => {
  if (!isValid.value) {
    errorMessage.value = 'Por favor ingresa un nombre válido (mínimo 2 caracteres)';
    return;
  }
  
  errorMessage.value = '';
  emit('submit', name.value.trim());
};
</script>
```

**Validación:**
- ✓ Modal no se puede cerrar sin nombre
- ✓ Validación de mínimo 2 caracteres funciona
- ✓ Enter dispara el submit
- ✓ Diseño consistente con `UiModal` y `UiInput`

---

### Paso 6: Crear GuestHeader

**Archivo:** `apps/frontend/components/guest/GuestHeader.vue`

**Tareas:**
- [ ] Header simplificado: Logo + Nombre del proyecto + Badge "Modo Invitado"
- [ ] Sin navegación a dashboard ni configuración
- [ ] Mostrar nombre del invitado en la esquina superior derecha
- [ ] Diseño minimalista y limpio

**Código Base:**
```vue
<!-- apps/frontend/components/guest/GuestHeader.vue -->
<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo y Nombre del Proyecto -->
        <div class="flex items-center space-x-4">
          <img src="/trace-logo.png" alt="Trace" class="h-8 w-auto" />
          <div class="flex items-center space-x-2">
            <h1 class="text-lg font-semibold text-gray-900">{{ projectName }}</h1>
            <span class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              Modo Invitado
            </span>
          </div>
        </div>

        <!-- Info del Invitado -->
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span class="text-sm font-medium text-gray-600">
                {{ guestInitials }}
              </span>
            </div>
            <span class="text-sm text-gray-700">{{ guestName }}</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const props = defineProps<{
  projectName: string;
  guestName: string;
}>();

const guestInitials = computed(() => {
  const names = props.guestName.split(' ');
  if (names.length >= 2) {
    return names[0][0].toUpperCase() + names[1][0].toUpperCase();
  }
  return props.guestName.substring(0, 2).toUpperCase();
});
</script>
```

**Validación:**
- ✓ Se muestra logo y nombre del proyecto
- ✓ Badge "Modo Invitado" es visible
- ✓ Iniciales del invitado se calculan correctamente
- ✓ Diseño responsive

---

### Paso 7: Crear Layout Guest

**Archivo:** `apps/frontend/layouts/guest.vue`

**Tareas:**
- [ ] Layout minimalista sin sidebar de navegación
- [ ] Usar `GuestHeader` en lugar del header normal
- [ ] Sin footer de administración
- [ ] Slot principal para el contenido del visor

**Código Base:**
```vue
<!-- apps/frontend/layouts/guest.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <GuestHeader 
      :project-name="projectName"
      :guest-name="guestName"
    />
    
    <main class="h-[calc(100vh-4rem)]">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useGuestStore } from '~/stores/guest';

const guestStore = useGuestStore();

// Estas props deberían venir del contexto de la página
const projectName = ref('Proyecto Compartido');
const guestName = computed(() => guestStore.guestUser?.name || 'Invitado');

// Escuchar eventos para actualizar el nombre del proyecto
provide('setProjectName', (name: string) => {
  projectName.value = name;
});
</script>
```

**Validación:**
- ✓ Layout ocupa toda la altura de la pantalla
- ✓ Header guest se muestra correctamente
- ✓ Sin elementos de navegación de dashboard

---

### Paso 8: Crear Página Pública `/p/:token`

**Archivo:** `apps/frontend/pages/p/[token].vue`

**Tareas:**
- [ ] Capturar token de la URL
- [ ] Intentar login automático con `useGuestAuth`
- [ ] Si el token es inválido, mostrar página de error
- [ ] Si es válido y no hay nombre persistido, mostrar `GuestNamePrompt`
- [ ] Una vez con nombre, cargar el visor del proyecto
- [ ] Usar layout `guest`
- [ ] Pasar `projectId` a componentes hijo

**Código Base:**
```vue
<!-- apps/frontend/pages/p/[token].vue -->
<template>
  <div class="h-full">
    <!-- Estado de Carga -->
    <div v-if="isAuthenticating" class="flex items-center justify-center h-full">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-gray-600">Verificando acceso...</p>
      </div>
    </div>

    <!-- Error: Enlace Inválido -->
    <div v-else-if="authError" class="flex items-center justify-center h-full">
      <div class="text-center max-w-md px-4">
        <div class="mb-4">
          <svg class="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Enlace Inválido o Expirado</h2>
        <p class="text-gray-600 mb-6">
          Este enlace ha caducado o ha sido revocado por el propietario del proyecto.
        </p>
        <a href="/" class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90">
          Ir al Inicio
        </a>
      </div>
    </div>

    <!-- Prompt para Nombre -->
    <GuestNamePrompt 
      v-else-if="needsName" 
      @submit="handleNameSubmit"
    />

    <!-- Visor del Proyecto -->
    <div v-else class="h-full">
      <PlanViewer 
        v-if="currentPlanId"
        :plan-id="currentPlanId" 
        :project-id="projectId"
        :is-guest-mode="true"
      />
      <div v-else class="flex items-center justify-center h-full">
        <p class="text-gray-600">Cargando proyecto...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGuestAuth } from '~/composables/useGuestAuth';
import { useGuestStore } from '~/stores/guest';

definePageMeta({
  layout: 'guest',
  middleware: [] // Sin middleware de autenticación normal
});

const route = useRoute();
const shareToken = computed(() => route.params.token as string);

const guestAuth = useGuestAuth();
const guestStore = useGuestStore();

const isAuthenticating = ref(true);
const authError = ref<string | null>(null);
const needsName = ref(false);
const projectId = ref<string>('');
const currentPlanId = ref<string | null>(null);

// Inyectar función para actualizar nombre del proyecto en el layout
const setProjectName = inject<(name: string) => void>('setProjectName');

onMounted(async () => {
  await authenticateGuest();
});

async function authenticateGuest() {
  try {
    isAuthenticating.value = true;
    const response = await guestAuth.loginAsGuest(shareToken.value);
    
    projectId.value = response.user.projectId;

    // Verificar si necesita nombre
    if (!guestStore.guestUser?.name) {
      needsName.value = true;
    } else {
      // Cargar el proyecto
      await loadProject();
    }
  } catch (error: any) {
    authError.value = error.message;
  } finally {
    isAuthenticating.value = false;
  }
}

function handleNameSubmit(name: string) {
  guestAuth.setGuestName(name, projectId.value);
  needsName.value = false;
  loadProject();
}

async function loadProject() {
  try {
    const config = useRuntimeConfig();
    
    // Cargar datos básicos del proyecto
    const project = await $fetch(`${config.public.apiBase}/projects/${projectId.value}`, {
      headers: {
        Authorization: `Bearer ${guestStore.guestToken.value}`
      }
    });

    if (setProjectName && project.name) {
      setProjectName(project.name);
    }

    // Cargar el primer plan disponible
    const plans = await $fetch(`${config.public.apiBase}/projects/${projectId.value}/plans`, {
      headers: {
        Authorization: `Bearer ${guestStore.guestToken.value}`
      }
    });

    if (plans && plans.length > 0) {
      currentPlanId.value = plans[0].id;
    }
  } catch (error) {
    console.error('Error loading project:', error);
    authError.value = 'No se pudo cargar el proyecto';
  }
}
</script>
```

**Validación:**
- ✓ Token se captura de la URL
- ✓ Estados de carga se muestran correctamente
- ✓ Error por token inválido muestra página amigable
- ✓ Prompt de nombre aparece cuando corresponde
- ✓ Visor se carga con el plan correcto

---

### Paso 9: Crear Modal ShareProjectModal

**Archivo:** `apps/frontend/components/projects/ShareProjectModal.vue`

**Tareas:**
- [ ] Modal con switch "Acceso Público Activado"
- [ ] Al activar, llama a `POST /projects/:id/share-token` inmediatamente
- [ ] Al desactivar, llama a `DELETE /projects/:id/share-token`
- [ ] Muestra URL generada en campo read-only
- [ ] Botón "Copiar Enlace" con feedback (toast)
- [ ] Texto de ayuda sobre permisos

**Código Base:**
```vue
<!-- apps/frontend/components/projects/ShareProjectModal.vue -->
<template>
  <UiModal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <template #title>
      Compartir Proyecto
    </template>
    
    <div class="space-y-4">
      <!-- Switch de Activación -->
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-sm font-medium text-gray-900">Acceso Público</h4>
          <p class="text-sm text-gray-500">Permitir acceso mediante enlace compartido</p>
        </div>
        <button
          type="button"
          :class="[
            isActive ? 'bg-primary' : 'bg-gray-200',
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
          ]"
          :disabled="isToggling"
          @click="toggleShare"
        >
          <span
            :class="[
              isActive ? 'translate-x-5' : 'translate-x-0',
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
            ]"
          />
        </button>
      </div>

      <!-- URL Generada -->
      <div v-if="isActive && shareUrl" class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Enlace de Acceso
        </label>
        <div class="flex gap-2">
          <input
            :value="shareUrl"
            readonly
            type="text"
            class="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
          />
          <button
            type="button"
            class="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
            @click="copyToClipboard"
          >
            Copiar
          </button>
        </div>
        <p class="text-xs text-gray-500">
          Cualquier persona con este enlace podrá ver el plano y dejar comentarios.
        </p>
      </div>

      <!-- Estado de Carga -->
      <div v-if="isToggling" class="text-center py-2">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
      </div>

      <!-- Error -->
      <div v-if="error" class="rounded-md bg-red-50 p-3">
        <p class="text-sm text-red-800">{{ error }}</p>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        class="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto"
        @click="$emit('update:modelValue', false)"
      >
        Cerrar
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import type { ShareTokenResponse } from '~/types/guest';
import { useToastStore } from '~/stores/toast';

const props = defineProps<{
  modelValue: boolean;
  projectId: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>();

const config = useRuntimeConfig();
const { token } = useAuthStore();
const toastStore = useToastStore();

const isActive = ref(false);
const shareUrl = ref('');
const isToggling = ref(false);
const error = ref('');

// Cargar estado actual al abrir el modal
watch(() => props.modelValue, async (newValue) => {
  if (newValue) {
    await loadShareStatus();
  }
});

async function loadShareStatus() {
  try {
    const response = await $fetch<ShareTokenResponse>(
      `${config.public.apiBase}/projects/${props.projectId}/share-token`,
      {
        headers: { Authorization: `Bearer ${token.value}` }
      }
    );
    
    if (response.isActive && response.shareUrl) {
      isActive.value = true;
      shareUrl.value = response.shareUrl;
    }
  } catch (e: any) {
    // Si no existe token, está desactivado
    if (e.status !== 404) {
      error.value = 'Error al cargar el estado de compartición';
    }
  }
}

async function toggleShare() {
  isToggling.value = true;
  error.value = '';

  try {
    if (isActive.value) {
      // Desactivar
      await $fetch(
        `${config.public.apiBase}/projects/${props.projectId}/share-token`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token.value}` }
        }
      );
      
      isActive.value = false;
      shareUrl.value = '';
      
      toastStore.add({
        type: 'success',
        message: 'Acceso público desactivado'
      });
    } else {
      // Activar
      const response = await $fetch<ShareTokenResponse>(
        `${config.public.apiBase}/projects/${props.projectId}/share-token`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token.value}` }
        }
      );
      
      isActive.value = true;
      shareUrl.value = response.shareUrl;
      
      toastStore.add({
        type: 'success',
        message: 'Enlace generado correctamente'
      });
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Error al cambiar el estado de compartición';
    toastStore.add({
      type: 'error',
      message: error.value
    });
  } finally {
    isToggling.value = false;
  }
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(shareUrl.value);
    toastStore.add({
      type: 'success',
      message: 'Enlace copiado al portapapeles'
    });
  } catch (e) {
    toastStore.add({
      type: 'error',
      message: 'Error al copiar el enlace'
    });
  }
}
</script>
```

**Validación:**
- ✓ Switch activa/desactiva inmediatamente sin botón guardar
- ✓ URL se genera y muestra correctamente
- ✓ Botón copiar funciona y muestra toast
- ✓ Errores se manejan apropiadamente

---

### Paso 10: Integrar Botón Compartir en Vista de Proyecto

**Archivo:** `apps/frontend/pages/dashboard/project/[id]/index.vue`

**Tareas:**
- [ ] Agregar botón "Compartir" en el header de la página
- [ ] Estado local para controlar visibilidad del modal
- [ ] Solo visible para usuarios con role OWNER o EDITOR

**Modificación:**
```vue
<!-- Agregar en el header, antes de las pestañas -->
<div class="flex justify-between items-center mb-6">
  <div>
    <h1 class="text-2xl font-bold text-gray-900">Detalle del Proyecto</h1>
    <p class="mt-1 text-sm text-gray-500">ID: {{ projectId }}</p>
  </div>
  
  <button
    v-if="canShare"
    type="button"
    class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
    @click="showShareModal = true"
  >
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
    Compartir
  </button>
</div>

<ShareProjectModal 
  v-model="showShareModal"
  :project-id="projectId"
/>

<script setup lang="ts">
// ... código existente ...
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const showShareModal = ref(false);

const canShare = computed(() => {
  const role = authStore.user?.role;
  return role === 'ADMIN' || role === 'ARCHITECT';
});
</script>
```

**Validación:**
- ✓ Botón se muestra solo para OWNER/EDITOR
- ✓ Modal se abre y cierra correctamente
- ✓ Diseño coherente con el resto de la página

---

### Paso 11: Modificar PlanViewer para Modo Guest

**Archivo:** `apps/frontend/components/plans/PlanViewer.vue`

**Tareas:**
- [ ] Agregar prop `isGuestMode: boolean`
- [ ] Ocultar controles de administración cuando `isGuestMode === true`
- [ ] Mantener controles de zoom, pan, capas visibles
- [ ] Preparar sección de comentarios (placeholder para futura implementación)

**Modificación:**
```vue
<!-- En PlanViewer.vue -->
<script setup lang="ts">
const props = defineProps<{
  planId: string;
  projectId: string;
  isGuestMode?: boolean; // Nueva prop
}>();

// ... resto del código ...
</script>

<template>
  <div class="relative h-full">
    <!-- Controles de Administración (Solo Owner) -->
    <div v-if="!isGuestMode" class="absolute top-4 right-4 z-10 space-x-2">
      <button class="...">Subir Nueva Versión</button>
      <button class="...">Configuración</button>
    </div>

    <!-- Visor de Plano -->
    <div class="plan-container">
      <!-- ... código existente del visor ... -->
    </div>

    <!-- Panel de Capas (Visible para todos) -->
    <div class="absolute left-4 top-4 z-10">
      <!-- ... controles de capas ... -->
    </div>

    <!-- Panel de Comentarios (Placeholder) -->
    <div v-if="showComments" class="absolute right-4 bottom-4 z-10 bg-white rounded-lg shadow-lg p-4">
      <p class="text-sm text-gray-500">Comentarios disponibles próximamente</p>
    </div>
  </div>
</template>
```

**Validación:**
- ✓ Controles de admin no visibles en modo guest
- ✓ Zoom y pan funcionan normalmente
- ✓ Navegación de capas funciona

---

## 5. Testing Unitario

### 5.1. Store Guest - `tests/unit/stores/guest.spec.ts`

**Casos de Prueba:**
- [ ] `setGuestUser` actualiza el estado correctamente
- [ ] `setGuestToken` actualiza la cookie
- [ ] `isGuest` retorna `true` solo con token válido y role GUEST
- [ ] `clearGuest` limpia todo el estado
- [ ] `saveGuestName` persiste en localStorage
- [ ] `getPersistedGuestName` recupera de localStorage

**Código Base:**
```typescript
// tests/unit/stores/guest.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGuestStore } from '~/stores/guest';

describe('Guest Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('should set guest user', () => {
    const store = useGuestStore();
    const mockUser = {
      name: 'Test Guest',
      projectId: '123',
      token: 'abc',
      role: 'GUEST' as const
    };

    store.setGuestUser(mockUser);
    expect(store.guestUser).toEqual(mockUser);
  });

  it('should compute isGuest correctly', () => {
    const store = useGuestStore();
    expect(store.isGuest).toBe(false);

    store.setGuestToken('test-token');
    store.setGuestUser({
      name: 'Test',
      projectId: '123',
      token: 'test-token',
      role: 'GUEST'
    });

    expect(store.isGuest).toBe(true);
  });

  it('should save and retrieve guest name from localStorage', () => {
    const store = useGuestStore();
    const testName = 'John Doe';

    store.saveGuestName(testName);
    expect(localStorage.getItem('guest_name')).toBe(testName);
    expect(store.getPersistedGuestName()).toBe(testName);
  });

  it('should clear guest state', () => {
    const store = useGuestStore();
    store.setGuestToken('token');
    store.setGuestUser({
      name: 'Test',
      projectId: '123',
      token: 'token',
      role: 'GUEST'
    });

    store.clearGuest();
    expect(store.guestUser).toBeNull();
    expect(store.guestToken.value).toBeNull();
  });
});
```

---

### 5.2. Composable useGuestAuth - `tests/unit/composables/useGuestAuth.spec.ts`

**Casos de Prueba:**
- [ ] `loginAsGuest` llama al endpoint correcto
- [ ] Guarda token en el store después del login
- [ ] Recupera nombre persistido si existe
- [ ] Maneja errores 401 correctamente
- [ ] `setGuestName` persiste y actualiza el store
- [ ] `logout` limpia el estado

**Código Base:**
```typescript
// tests/unit/composables/useGuestAuth.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGuestAuth } from '~/composables/useGuestAuth';
import { useGuestStore } from '~/stores/guest';

// Mock $fetch
global.$fetch = vi.fn();

describe('useGuestAuth', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should login as guest successfully', async () => {
    const mockResponse = {
      accessToken: 'jwt-token',
      user: { role: 'GUEST', projectId: 'proj-123' }
    };

    vi.mocked($fetch).mockResolvedValueOnce(mockResponse);

    const { loginAsGuest } = useGuestAuth();
    const store = useGuestStore();

    await loginAsGuest('share-token-123');

    expect($fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/guest/login'),
      expect.objectContaining({
        method: 'POST',
        body: { token: 'share-token-123' }
      })
    );

    expect(store.guestToken.value).toBe('jwt-token');
  });

  it('should handle login error', async () => {
    vi.mocked($fetch).mockRejectedValueOnce({
      data: { message: 'Invalid token' }
    });

    const { loginAsGuest, error } = useGuestAuth();

    await expect(loginAsGuest('bad-token')).rejects.toThrow();
    expect(error.value).toBe('Invalid token');
  });

  it('should set guest name and persist', () => {
    const { setGuestName } = useGuestAuth();
    const store = useGuestStore();
    store.setGuestToken('token-123');

    setGuestName('Jane Doe', 'proj-456');

    expect(localStorage.getItem('guest_name')).toBe('Jane Doe');
    expect(store.guestUser?.name).toBe('Jane Doe');
    expect(store.guestUser?.projectId).toBe('proj-456');
  });
});
```

---

### 5.3. Componentes

#### ShareProjectModal - `tests/unit/components/ShareProjectModal.spec.ts`

**Casos de Prueba:**
- [ ] Renderiza correctamente
- [ ] Switch activa/desactiva el acceso
- [ ] Llama a la API al cambiar el switch
- [ ] Botón copiar funciona y muestra toast
- [ ] Muestra errores apropiadamente

**Código Base:**
```typescript
// tests/unit/components/ShareProjectModal.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ShareProjectModal from '~/components/projects/ShareProjectModal.vue';

vi.mock('~/stores/toast', () => ({
  useToastStore: () => ({
    add: vi.fn()
  })
}));

describe('ShareProjectModal', () => {
  it('should render when modelValue is true', () => {
    const wrapper = mount(ShareProjectModal, {
      props: {
        modelValue: true,
        projectId: 'proj-123'
      }
    });

    expect(wrapper.find('h3').text()).toContain('Compartir Proyecto');
  });

  it('should toggle share status', async () => {
    global.$fetch = vi.fn().mockResolvedValue({
      token: 'abc123',
      shareUrl: 'https://trace.app/p/abc123',
      isActive: true
    });

    const wrapper = mount(ShareProjectModal, {
      props: {
        modelValue: true,
        projectId: 'proj-123'
      }
    });

    // Simular clic en el switch
    await wrapper.find('button[type="button"]').trigger('click');

    expect($fetch).toHaveBeenCalled();
  });
});
```

---

#### GuestNamePrompt - `tests/unit/components/GuestNamePrompt.spec.ts`

**Casos de Prueba:**
- [ ] Renderiza correctamente
- [ ] Validación de nombre mínimo 2 caracteres
- [ ] Emite evento submit con el nombre
- [ ] Botón deshabilitado con nombre inválido

**Código Base:**
```typescript
// tests/unit/components/GuestNamePrompt.spec.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import GuestNamePrompt from '~/components/guest/GuestNamePrompt.vue';

describe('GuestNamePrompt', () => {
  it('should validate minimum name length', async () => {
    const wrapper = mount(GuestNamePrompt);
    const input = wrapper.find('input');
    const button = wrapper.find('button[type="button"]');

    // Nombre muy corto
    await input.setValue('A');
    expect(button.attributes('disabled')).toBeDefined();

    // Nombre válido
    await input.setValue('John Doe');
    expect(button.attributes('disabled')).toBeUndefined();
  });

  it('should emit submit event with valid name', async () => {
    const wrapper = mount(GuestNamePrompt);
    const input = wrapper.find('input');
    const button = wrapper.find('button[type="button"]');

    await input.setValue('Jane Smith');
    await button.trigger('click');

    expect(wrapper.emitted('submit')).toBeTruthy();
    expect(wrapper.emitted('submit')?.[0]).toEqual(['Jane Smith']);
  });
});
```

---

## 6. Guía de Validación de la Tarea

### 6.1. Checklist Funcional

**Arquitecto (Owner/Editor):**
- [ ] Desde `/dashboard/project/:id`, aparece botón "Compartir"
- [ ] Al hacer clic, se abre modal de compartir
- [ ] Switch "Acceso Público" se puede activar/desactivar
- [ ] Al activar, se genera URL inmediatamente (sin botón guardar)
- [ ] URL se muestra en campo read-only
- [ ] Botón "Copiar Enlace" copia al portapapeles
- [ ] Toast de éxito aparece al copiar
- [ ] Al desactivar, URL desaparece y acceso se revoca

**Invitado (Guest):**
- [ ] Puede acceder a `/p/:token` sin estar registrado
- [ ] Si el token es válido, sistema autentica automáticamente
- [ ] Si no hay nombre guardado, aparece modal de nombre
- [ ] Modal no se puede cerrar sin ingresar nombre válido (mín. 2 chars)
- [ ] Nombre se guarda en localStorage
- [ ] En visitas posteriores, no se pide nombre de nuevo
- [ ] Header muestra "Modo Invitado" y nombre del invitado
- [ ] Visor muestra plano completo con zoom y pan
- [ ] No aparecen controles de administración (subir, eliminar)
- [ ] Navegación de capas funciona correctamente

**Errores:**
- [ ] Token inválido muestra página de error amigable
- [ ] Token revocado muestra página de error
- [ ] Errores de red se manejan apropiadamente con mensajes claros

### 6.2. Checklist Técnico

**Arquitectura:**
- [ ] Código sigue estructura de Nuxt 3 + TypeScript
- [ ] Composables separados de componentes
- [ ] Store Pinia para estado de guest
- [ ] Tipos TypeScript definidos en `/types/guest.ts`
- [ ] Layout guest independiente del dashboard

**Estilo y UI:**
- [ ] Tailwind CSS con variables corporativas
- [ ] Componentes reutilizan `UiModal`, `UiInput`, `UiButton`
- [ ] Diseño responsive (mobile, tablet, desktop)
- [ ] Consistencia visual con resto de la aplicación

**Testing:**
- [ ] Tests unitarios de store pasan correctamente
- [ ] Tests de composable pasan
- [ ] Tests de componentes clave pasan
- [ ] Cobertura mínima >80% en archivos nuevos

**Seguridad:**
- [ ] JWT guest solo permite acceso al proyecto compartido
- [ ] No hay middleware de autenticación normal en `/p/:token`
- [ ] Tokens se manejan de forma segura (cookies, no localStorage)

### 6.3. Comandos de Validación

```bash
# 1. Ejecutar Tests Unitarios
cd apps/frontend
npm run test:unit

# 2. Verificar Linting
npm run lint

# 3. Compilación TypeScript
npm run build

# 4. Ejecutar en Desarrollo y Probar Manualmente
npm run dev
# Abrir http://localhost:3000/dashboard/project/{id}
# Generar enlace de compartir
# Abrir en navegador incógnito: http://localhost:3000/p/{token}
```

### 6.4. Escenarios de Prueba Manual

#### Escenario 1: Flujo Completo Arquitecto → Invitado
1. Login como arquitecto en `/login`
2. Navegar a un proyecto existente
3. Clic en "Compartir"
4. Activar switch "Acceso Público"
5. Copiar URL generada
6. Abrir en ventana incógnita
7. Ingresar nombre de invitado
8. Verificar visor funciona correctamente

#### Escenario 2: Revocar Acceso
1. Con enlace activo y funcionando
2. Volver como arquitecto
3. Desactivar switch en modal de compartir
4. Intentar acceder con el enlace anterior
5. Verificar error "Enlace inválido o expirado"

#### Escenario 3: Persistencia de Nombre
1. Acceder como invitado por primera vez
2. Ingresar nombre "Test User"
3. Cerrar navegador
4. Volver a abrir el mismo enlace
5. Verificar que NO se pide nombre de nuevo
6. Verificar que nombre aparece en header

---

## 7. Consideraciones Adicionales

### 7.1. Limitaciones Conocidas
- Los comentarios son placeholder para futura implementación
- No hay límite de tiempo para los enlaces (se gestiona en backend)
- No hay analytics de acceso de invitados (futura mejora)

### 7.2. Mejoras Futuras
- Estadísticas de acceso por enlace
- Opción de caducidad personalizada
- Envío de enlace por email desde la UI
- Notificaciones cuando un invitado accede
- Integración completa de comentarios

### 7.3. Dependencias Backend
Este ticket depende de que **BACK-006** esté completamente implementado:
- Endpoints de gestión de tokens (`POST`, `GET`, `DELETE /projects/:id/share-token`)
- Endpoint de login guest (`POST /auth/guest/login`)
- Middleware de autorización para usuarios GUEST
- Validación de permisos (READ_PROJECT, COMMENT para guests)

---

## 8. Estimación de Tiempo

| Paso | Descripción | Tiempo Estimado |
|------|-------------|-----------------|
| 1 | Tipos TypeScript | 30 min |
| 2 | Store Guest | 1 h |
| 3 | Composable useGuestAuth | 1.5 h |
| 4 | Middleware guest-auth | 30 min |
| 5 | GuestNamePrompt | 1 h |
| 6 | GuestHeader | 1 h |
| 7 | Layout Guest | 45 min |
| 8 | Página `/p/:token` | 2 h |
| 9 | ShareProjectModal | 2 h |
| 10 | Integración botón compartir | 45 min |
| 11 | Modificar PlanViewer | 1 h |
| 12 | Testing Unitario | 3 h |
| 13 | Testing Manual y Ajustes | 2 h |
| **TOTAL** | | **~17 horas** |

---

## 9. Checklist de Implementación

- [ ] Paso 1: Tipos TypeScript creados
- [ ] Paso 2: Store Guest implementado
- [ ] Paso 3: Composable useGuestAuth implementado
- [ ] Paso 4: Middleware creado
- [ ] Paso 5: GuestNamePrompt creado
- [ ] Paso 6: GuestHeader creado
- [ ] Paso 7: Layout Guest creado
- [ ] Paso 8: Página `/p/:token` implementada
- [ ] Paso 9: ShareProjectModal implementado
- [ ] Paso 10: Botón compartir integrado
- [ ] Paso 11: PlanViewer adaptado para guest
- [ ] Paso 12: Tests unitarios escritos y pasando
- [ ] Paso 13: Validación manual completada
- [ ] Documentación actualizada
- [ ] Code review aprobado
- [ ] Merge a rama principal

---

## 10. Notas Finales

Este plan está diseñado para ser ejecutado de forma **incremental y testeada**. Cada paso puede ser validado de forma independiente antes de continuar con el siguiente.

**Prioridad de Implementación:**
1. Core (Pasos 1-4): Base de autenticación guest
2. UI Guest (Pasos 5-8): Experiencia de usuario invitado
3. UI Owner (Pasos 9-10): Herramientas de compartir
4. Adaptación (Paso 11): Integración con visor existente
5. QA (Pasos 12-13): Testing y validación

**Comunicación con Backend:**
Asegurarse de que los endpoints de BACK-006 estén disponibles antes de iniciar las pruebas de integración. Coordinar con el equipo backend para:
- Formato exacto de respuestas de API
- Códigos de error esperados
- Estructura del JWT para guests

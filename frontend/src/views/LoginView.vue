<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { LogIn } from '@lucide/vue';
import { ApiError } from '@/core/api';
import { useAuthStore } from '@/core/auth.store';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('ventas@tejaflow.test');
const password = ref('Ventas123!');
const loading = ref(false);
const error = ref<string | null>(null);

async function submit(): Promise<void> {
  if (!email.value || !password.value) {
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    await authStore.login(email.value, password.value);
    await router.push({ name: 'inventario' });
  } catch (exception) {
    error.value = exception instanceof ApiError ? exception.message : 'No fue posible iniciar sesion.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="login-page">
    <section class="login-panel">
      <h1>TejaFlow</h1>
      <p>Administracion, inventario y ventas de tejas</p>

      <form class="form-grid" @submit.prevent="submit">
        <div class="field">
          <label for="email">Correo</label>
          <input id="email" v-model="email" type="email" autocomplete="username" />
        </div>

        <div class="field">
          <label for="password">Contrasena</label>
          <input id="password" v-model="password" type="password" autocomplete="current-password" />
        </div>

        <p v-if="error" class="error-text">{{ error }}</p>

        <button class="primary-button" type="submit" :disabled="loading || !email || !password">
          <LogIn :size="18" aria-hidden="true" />
          <span>{{ loading ? 'Entrando...' : 'Entrar' }}</span>
        </button>
      </form>
    </section>
  </main>
</template>

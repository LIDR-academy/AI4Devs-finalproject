<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { useAuth } from '~/composables/useAuth';

definePageMeta({
  layout: false,
  middleware: ['guest']
});

const { login, loading, error } = useAuth();

const validationSchema = toTypedSchema(
  z.object({
    email: z.string().min(1, 'El correo es obligatorio').email('Correo electrónico inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  })
);

const { handleSubmit, errors } = useForm({
  validationSchema,
});

const onSubmit = handleSubmit(async (values) => {
  await login(values);
});
</script>

<template>
  <div>
    <NuxtLayout name="auth">
      <template #title>Accede a tu cuenta</template>
      <template #subtitle>
        O bien
        <NuxtLink to="/register" class="font-medium text-primary hover:text-secondary">
          crea una cuenta nueva
        </NuxtLink>
      </template>

      <form data-testid="login-form" class="space-y-6" @submit.prevent="onSubmit">
        <!-- Error global -->
        <div v-if="error" data-testid="login-error-alert" class="p-4 rounded-md bg-red-50 border border-red-200">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
            </div>
          </div>
        </div>

        <UiInput
          name="email"
          label="Correo electrónico"
          type="email"
          placeholder="tu@email.com"
        />

        <div class="space-y-1">
          <UiInput
            name="password"
            label="Contraseña"
            type="password"
            placeholder="••••••••"
          />
          <div class="flex items-center justify-end">
            <div class="text-sm">
              <a href="#" class="font-medium text-primary hover:text-secondary">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>
        </div>

        <div>
          <UiButton type="submit" :test-id="'login-submit-button'" class="w-full" :loading="loading">
            Iniciar sesión
          </UiButton>
        </div>
      </form>
    </NuxtLayout>
  </div>
</template>

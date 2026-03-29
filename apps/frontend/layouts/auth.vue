<template>
  <div class="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center">
        <NuxtLink to="/" class="text-4xl font-bold tracking-widest text-primary hover:opacity-70 transition-opacity">TRACÉ</NuxtLink>
      </div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-text">
        <slot name="title">Bienvenido de nuevo</slot>
      </h2>
      <p class="mt-2 text-center text-sm text-secondary">
        <slot name="subtitle"></slot>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-secondary/20">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: [],
})

useHead({
  title: 'Revisión colaborativa de planos de arquitectura',
  meta: [
    {
      name: 'description',
      content:
        'TRACÉ centraliza la revisión de planos para arquitectos y diseñadores de interior. Compara versiones, comenta directamente sobre el plano y comparte con clientes sin registro.',
    },
    {
      property: 'og:title',
      content: 'TRACÉ — Revisión colaborativa de planos de arquitectura',
    },
    {
      property: 'og:description',
      content:
        'TRACÉ centraliza la revisión de planos para arquitectos y diseñadores de interior. Compara versiones, comenta directamente sobre el plano y comparte con clientes sin registro.',
    },
    { property: 'og:type', content: 'website' },
    { name: 'robots', content: 'index, follow' },
  ],
})
</script>

<template>
  <main class="snap-container" role="main">

    <!-- Sección 1: Hero — dark -->
    <section
      class="snap-section bg-primary"
      aria-labelledby="hero-heading"
    >
      <div class="section-content">
        <h1
          id="hero-heading"
          class="text-accent text-7xl font-bold tracking-widest mb-6"
        >
          TRACÉ
        </h1>
        <p class="text-white text-xl max-w-xl leading-relaxed mb-10">
          La plataforma de revisión de planos para arquitectos y diseñadores de interior. 
          Sustituye el caos del correo electrónico por un entorno visual compartido.
        </p>
        <nav aria-label="Acciones principales" class="flex gap-4 justify-center">
          <NuxtLink
            to="/register"
            class="bg-accent text-primary font-semibold px-8 py-3 rounded hover:opacity-80 transition-opacity"
          >
            Registrarse
          </NuxtLink>
          <NuxtLink
            to="/login"
            class="border border-accent text-accent font-semibold px-8 py-3 rounded hover:bg-accent hover:text-primary transition-colors"
          >
            Iniciar sesión
          </NuxtLink>
        </nav>
      </div>
    </section>

    <!-- Sección 2: Comparador de Capas — light -->
    <section
      class="snap-section bg-secondary"
      aria-labelledby="comparador-heading"
    >
      <div class="section-content">
        <h2
          id="comparador-heading"
          class="text-primary text-4xl font-bold mb-6"
        >
          Compara versiones en tiempo real
        </h2>
        <p class="text-primary text-lg max-w-xl leading-relaxed">
          Superpón dos versiones de un plano y ajusta la opacidad con un deslizador. 
          Detecta cualquier cambio al instante, sin exportar ni comparar PDFs manualmente.
        </p>
      </div>
    </section>

    <!-- Sección 3: Pins y Comentarios — dark -->
    <section
      class="snap-section bg-primary"
      aria-labelledby="pins-heading"
    >
      <div class="section-content">
        <h2
          id="pins-heading"
          class="text-accent text-4xl font-bold mb-6"
        >
          Feedback exacto, sin ambigüedades
        </h2>
        <p class="text-white text-lg max-w-xl leading-relaxed">
          Ancla comentarios a cualquier punto del plano y gestiona los hilos directamente 
          sobre el área afectada. Nada se pierde entre correos ni en documentos externos.
        </p>
      </div>
    </section>

    <!-- Sección 4: Acceso para Clientes — light -->
    <section
      class="snap-section bg-secondary"
      aria-labelledby="clientes-heading"
    >
      <div class="section-content">
        <h2
          id="clientes-heading"
          class="text-primary text-4xl font-bold mb-6"
        >
          Clientes colaboran sin registrarse
        </h2>
        <p class="text-primary text-lg max-w-xl leading-relaxed">
          Comparte un enlace único con tu cliente. Acceden directamente al visor, 
          revisan los planos y añaden comentarios — sin cuentas, sin instalaciones.
        </p>
      </div>
    </section>

    <!-- Sección 5: Control de Versiones — dark -->
    <section
      class="snap-section bg-primary"
      aria-labelledby="versiones-heading"
    >
      <div class="section-content">
        <h2
          id="versiones-heading"
          class="text-accent text-4xl font-bold mb-6"
        >
          Historial completo de cada plano
        </h2>
        <p class="text-white text-lg max-w-xl leading-relaxed">
          Cada actualización genera una nueva versión con trazabilidad total.<br />
          Consulta el estado anterior del proyecto en modo lectura, sin perder ningún detalle.
        </p>
      </div>
    </section>

  </main>
</template>

<style scoped>
.snap-container {
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  /* Ocultar barra de scroll manteniendo la funcionalidad */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.snap-container::-webkit-scrollbar {
  display: none;
}

.snap-section {
  height: 100vh;
  scroll-snap-align: start;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1.5rem;
}
</style>

<script lang="ts">
  import LandingHero from '$lib/components/LandingHero.svelte';
  import LandingStepper from '$lib/components/LandingStepper.svelte';
</script>

<div class="container landing">
  <LandingHero />
  <LandingStepper />

  <p class="disclaimer">
    ⚠️ Análisis orientativo. No constituye asesoramiento financiero ni jurídico.
  </p>
</div>

<style>
  .landing {
    padding-bottom: 6rem;
  }
  .disclaimer {
    text-align: center;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin-top: 2rem;
    padding: 0 1rem;
  }
</style>

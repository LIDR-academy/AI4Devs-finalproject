<script lang="ts">
  const STEPS = [
    { num: 1, label: 'Analiza un anuncio' },
    { num: 2, label: 'Simula tu hipoteca' },
    { num: 3, label: 'Sigue tu proceso' },
    { num: 4, label: 'No pierdas ningún documento' },
  ];
</script>

<section class="landing-stepper" aria-label="Los 4 pasos del proceso">
  {#each STEPS as step, i}
    <div class="step" data-step-number={step.num}>
      {#if i > 0}
        <div class="connector"></div>
      {/if}
      <div class="circle">{step.num}</div>
      <div class="label">{step.label}</div>
    </div>
  {/each}
</section>

<style>
  .landing-stepper {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 1.5rem 0.5rem;
    max-width: 600px;
    margin: 0 auto;
  }
  .step {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
  }
  .connector {
    position: absolute;
    top: 18px;
    left: -50%;
    right: 50%;
    height: 2px;
    background: var(--color-border);
  }
  .circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--color-bg);
    border: 2px solid var(--color-border);
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 0.95rem;
    z-index: 1;
    position: relative;
  }
  .label {
    font-size: 0.8rem;
    color: var(--color-text);
    margin-top: 0.5rem;
    line-height: 1.3;
    max-width: 12ch;
  }
</style>

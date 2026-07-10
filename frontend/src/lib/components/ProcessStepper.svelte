<script lang="ts">
  export let steps: Array<{ id: string; label: string; href: string }>;
  export let currentStep: string;
  export let completedSteps: Set<string>;

  $: currentIndex = steps.findIndex((s) => s.id === currentStep);
</script>

<nav aria-label="Pasos del proceso" class="stepper">
  {#each steps as step, i}
    {@const isCurrent = step.id === currentStep}
    {@const isCompleted = completedSteps.has(step.id)}
    {@const isFuture = i > currentIndex}

    <div
      class="step"
      class:current={isCurrent}
      class:completed={isCompleted && !isCurrent}
      class:future={isFuture}
      data-step-id={step.id}
    >
      {#if i > 0}
        <div class="connector" class:filled={i <= currentIndex || isCompleted}></div>
      {/if}

      <div class="step-content">
        {#if isCompleted && !isCurrent}
          <a href={step.href} class="step-link" aria-label="Ir a {step.label} (completado)">
            <span class="circle completed">✓</span>
            <span class="label">{step.label}</span>
          </a>
        {:else if isCurrent}
          <span class="step-link" aria-current="step">
            <span class="circle current">{i + 1}</span>
            <span class="label">{step.label}</span>
          </span>
        {:else}
          <span class="step-link disabled" aria-disabled="true">
            <span class="circle future">{i + 1}</span>
            <span class="label">{step.label}</span>
          </span>
        {/if}
      </div>
    </div>
  {/each}
</nav>

<style>
  .stepper {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--color-bg);
    border-top-width: 1px;
    border-top-style: solid;
    border-top-color: var(--color-border);
    display: flex;
    justify-content: space-around;
    padding: 0.5rem 0.25rem;
    padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0));
    z-index: 10;
  }
  .step {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    min-width: 0;
  }
  .connector {
    position: absolute;
    top: 14px;
    left: -50%;
    right: 50%;
    height: 2px;
    background: var(--color-border);
  }
  .connector.filled {
    background: var(--color-primary);
  }
  .step-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    z-index: 1;
    background: var(--color-bg);
    padding: 0 0.25rem;
  }
  .step-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    text-decoration: none;
    color: inherit;
    min-width: 60px;
  }
  .step-link.disabled {
    cursor: default;
  }
  .circle {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.8rem;
  }
  .circle.current {
    background: var(--color-primary);
    color: white;
    box-shadow: 0 0 0 4px #dbeafe;
  }
  .circle.completed {
    background: var(--color-primary);
    color: white;
  }
  .circle.future {
    background: transparent;
    border: 1.5px solid var(--color-border);
    color: var(--color-text-muted);
  }
  .label {
    font-size: 0.7rem;
    font-weight: 600;
  }
  .current .label {
    color: var(--color-primary);
  }
  .completed .label,
  .future .label {
    color: var(--color-text-muted);
  }
</style>

<script lang="ts">
  // AI disclaimer (FR-017). Persistent on any view with AI-generated content.
  export let compact = false;
</script>

<div class="disclaimer" class:compact>
  <strong>⚠️ Análisis generado por IA.</strong>
  Verifica la información con fuentes oficiales (catastro, notaría, banco) antes de tomar decisiones de compra.
</div>

<style>
  .disclaimer {
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: var(--radius-md);
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
    color: #78350f;
    margin-bottom: 1rem;
  }
  .disclaimer.compact {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    margin-bottom: 0.5rem;
  }
</style>

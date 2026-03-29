<template>
  <div
    class="flex items-center gap-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg px-5 py-3"
    role="group"
    aria-label="Comparador de capas"
  >
    <!-- ── Dropdown: versión Base (izquierda) ───────────────────────────── -->
    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-gray-500" :for="baseSelectId">Base</label>
      <select
        :id="baseSelectId"
        :value="basePlanId ?? ''"
        class="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-700 cursor-pointer min-w-[130px]"
        aria-label="Seleccionar versión base"
        @change="$emit('update:basePlanId', ($event.target as HTMLSelectElement).value)"
      >
        <option
          v-for="plan in plans.filter(p => p.id !== proposalPlanId)"
          :key="plan.id"
          :value="plan.id"
        >
          v{{ plan.version }} — {{ formatDate(plan.createdAt) }}
        </option>
      </select>
    </div>

    <!-- ── Centro: Slider + Blink ───────────────────────────────────────── -->
    <div class="flex flex-col items-center gap-2 min-w-[220px]">
      <!-- Slider con etiquetas de extremo -->
      <div class="flex items-center gap-2 w-full">
        <span class="text-xs font-medium text-gray-500 whitespace-nowrap select-none">Base</span>

        <div class="relative flex-1">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            :value="sliderValue"
            class="w-full h-2 rounded-full cursor-pointer accent-primary"
            aria-label="Comparador de opacidad"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="sliderValue"
            list="comparator-mid-tick"
            @input="onSliderInput"
          />
          <!-- Marca visual en 50% -->
          <datalist id="comparator-mid-tick">
            <option value="50" />
          </datalist>
        </div>

        <span class="text-xs font-medium text-primary whitespace-nowrap select-none">Propuesta</span>
      </div>

      <!-- Botón Blink / Alternar -->
      <button
        type="button"
        class="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-accent"
        :class="isAtExtreme ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        title="Alternar rápidamente entre versión base y propuesta"
        aria-label="Alternar entre vista base y propuesta"
        @click="$emit('blink')"
      >
        ⚡ Alternar
      </button>
    </div>

    <!-- ── Dropdown: versión Propuesta (derecha) ────────────────────────── -->
    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-primary" :for="proposalSelectId">Propuesta</label>
      <select
        :id="proposalSelectId"
        :value="proposalPlanId ?? ''"
        class="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-700 cursor-pointer min-w-[130px]"
        aria-label="Seleccionar versión propuesta"
        @change="$emit('update:proposalPlanId', ($event.target as HTMLSelectElement).value)"
      >
        <option
          v-for="plan in plans.filter(p => p.id !== basePlanId)"
          :key="plan.id"
          :value="plan.id"
        >
          v{{ plan.version }} — {{ formatDate(plan.createdAt) }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Plan } from '~/types/plan'

// Unique IDs para a11y (label htmlFor)
const uid = Math.random().toString(36).slice(2, 7)
const baseSelectId = `comparator-base-${uid}`
const proposalSelectId = `comparator-proposal-${uid}`

const props = defineProps<{
  /** Opacidad de la capa propuesta: 0–1 (v-model) */
  opacity: number
  /** ID del plan seleccionado como base (v-model) */
  basePlanId: string | null
  /** ID del plan seleccionado como propuesta (v-model) */
  proposalPlanId: string | null
  /** Lista de versiones disponibles para los dropdowns */
  plans: Plan[]
}>()

const emit = defineEmits<{
  'update:opacity': [value: number]
  'update:basePlanId': [id: string]
  'update:proposalPlanId': [id: string]
  blink: []
}>()

/** Convierte opacity (0–1) a valor entero de slider (0–100) */
const sliderValue = computed(() => Math.round(props.opacity * 100))

/** Activa clases de estado "extremo" para el botón blink */
const isAtExtreme = computed(() => props.opacity === 0 || props.opacity === 1)

const onSliderInput = (e: Event) => {
  const raw = parseInt((e.target as HTMLInputElement).value)
  emit('update:opacity', raw / 100)
}

const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}
</script>

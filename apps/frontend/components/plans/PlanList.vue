<template>
  <div class="space-y-6">
    <!-- Header Actions -->
    <div class="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
      <div>
        <h2 class="text-xl font-semibold text-gray-900">Planos del Proyecto</h2>
        <p class="text-sm text-gray-500">{{ planCounts }} versiones en total</p>
      </div>
      <UiButton @click="showCreateModal = true">
        + Nuevo Plano / Versión
      </UiButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
      <div v-for="i in 3" :key="i" class="h-40 bg-gray-200 rounded-lg"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="groups.length === 0" class="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
      <h3 class="mt-2 text-sm font-semibold text-gray-900">No hay planos</h3>
      <p class="mt-1 text-sm text-gray-500">Sube el primer plano para comenzar.</p>
      <div class="mt-6">
        <UiButton @click="showCreateModal = true">Crear primer plano</UiButton>
      </div>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="group in groups" 
        :key="group.sheetName"
        class="bg-white overflow-hidden rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
      >
        <div class="px-4 py-5 sm:p-6">
            <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-medium leading-6 text-gray-900 truncate" :title="group.sheetName">
                    {{ group.sheetName }}
                </h3>
                <span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    v{{ group.latestVersion }}
                </span>
            </div>
            
            <div class="text-sm text-gray-500 mb-4">
                {{ group.plans.length }} versiones históricas
            </div>

            <div class="flex items-center justify-between mt-4">
                <NuxtLink 
                    :to="`/dashboard/project/${projectId}/plan/${getLatestPlanId(group)}`"
                    class="text-primary hover:text-primary-dark font-medium text-sm flex items-center"
                >
                    Abrir última versión &rarr;
                </NuxtLink>
            </div>
        </div>
        <div class="bg-gray-50 px-4 py-4 sm:px-6 text-xs text-gray-500 flex justify-between">
            <span>Actualizado: The date</span>
            <!-- TODO: Add Date formatting -->
        </div>
      </div>
    </div>

    <PlanCreateModal 
      v-model="showCreateModal" 
      :project-id="projectId"
      :groups="groups"
    />
  </div>
</template>

<script setup lang="ts">
import UiButton from '@/components/common/UiButton.vue'
import PlanCreateModal from '@/components/plans/PlanCreateModal.vue'
import type { PlanGroup } from '~/types/plan'

const props = defineProps<{
  projectId: string
}>()

const { fetchProjectPlans, groups, loading, planCounts } = usePlans()
const showCreateModal = ref(false)

onMounted(() => {
    if (props.projectId) {
        fetchProjectPlans(props.projectId)
    }
})

const getLatestPlanId = (group: PlanGroup) => {
    // Robust check for version matching
    const latest = group.plans.find(p => p.version == group.latestVersion)
    return latest?.id
}
</script>

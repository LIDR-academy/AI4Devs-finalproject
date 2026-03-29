<template>
  <div>
    <PlanViewer :plan-id="planId" :project-id="projectId" />
  </div>
</template>

<script setup lang="ts">
import PlanViewer from '@/components/plans/PlanViewer.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const route = useRoute()
const projectId = computed(() => route.params.id as string)
const planId = computed(() => route.params.planId as string)

useRealtimeLayers()
</script>

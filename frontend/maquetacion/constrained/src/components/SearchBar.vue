<template>
  <v-text-field
    :placeholder="placeholder"
    density="comfortable"
    variant="solo"
    hide-details
    rounded="lg"
    class="app-search"
    prepend-inner-icon="mdi-magnify"
  />
</template>

<script setup lang="ts">
interface Props {
  placeholder?: string
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Search',
})
</script>

<style scoped>
.app-search :deep(.v-field__outline) {
  --v-field-border-width: 0px;
}
</style>

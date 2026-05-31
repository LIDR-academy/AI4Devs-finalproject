<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, provide, useId, useTemplateRef, watch } from 'vue'
import {
  buildMtlFormFieldA11y,
  MTL_FORM_FIELD_A11Y_KEY,
  type MtlFormFieldA11y,
} from '@/composables/useMtlFormFieldA11y'

export type MtlFormDialogStack = 'species' | 'genus' | 'family'

const props = withDefaults(
  defineProps<{
    title: string
    cancelLabel: string
    submitLabel: string
    formId?: string
    formError?: string
    submitDisabled?: boolean
    stack?: MtlFormDialogStack
  }>(),
  {
    formId: undefined,
    formError: '',
    submitDisabled: false,
    stack: 'species',
  },
)

const emit = defineEmits<{
  cancel: []
  submit: []
}>()

const open = defineModel<boolean>('open', { required: true })

const dialogRef = useTemplateRef<HTMLDialogElement>('dialogRef')
const titleId = useId()
const errorId = useId()

const stackClass = computed(() => `mtl-form-dialog--${props.stack}`)

const fieldA11y = computed((): MtlFormFieldA11y =>
  buildMtlFormFieldA11y(props.formError ?? '', errorId),
)

provide(MTL_FORM_FIELD_A11Y_KEY, fieldA11y)

function syncDialogToModel(isOpen: boolean): void {
  const el = dialogRef.value
  if (!el) {
    return
  }
  if (isOpen) {
    if (!el.open) {
      try {
        el.showModal()
      } catch {
        el.setAttribute('open', '')
      }
    }
  } else if (el.open) {
    el.close()
  }
}

watch(
  open,
  async (isOpen) => {
    await nextTick()
    syncDialogToModel(isOpen)
  },
  { flush: 'post', immediate: true },
)

function onCancelClick(): void {
  emit('cancel')
  open.value = false
}

function onSubmit(): void {
  emit('submit')
}

function onDialogCancel(ev: Event): void {
  ev.preventDefault()
  emit('cancel')
  open.value = false
}

onBeforeUnmount(() => {
  const el = dialogRef.value
  if (el?.open) {
    el.close()
  }
})
</script>

<template>
  <dialog
    ref="dialogRef"
    class="mtl-form-dialog"
    :class="stackClass"
    aria-modal="true"
    :aria-labelledby="titleId"
    :aria-describedby="formError ? errorId : undefined"
    @cancel="onDialogCancel"
  >
    <div class="mtl-form-dialog-panel" @click.stop>
      <h3 :id="titleId" class="mtl-form-dialog-title">{{ title }}</h3>
      <form :id="formId" class="tree-form" @submit.prevent="onSubmit">
        <slot :field-a11y="fieldA11y" />
        <p v-if="formError" :id="errorId" class="error field-full" role="alert">{{ formError }}</p>
        <div class="mtl-form-dialog-actions field-full">
          <button type="button" class="btn btn-secondary" @click="onCancelClick">
            {{ cancelLabel }}
          </button>
          <button type="submit" class="btn btn-primary tree-form-submit" :disabled="submitDisabled">
            {{ submitLabel }}
          </button>
        </div>
      </form>
    </div>
  </dialog>
</template>

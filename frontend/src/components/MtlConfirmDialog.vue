<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, useTemplateRef, watch } from 'vue'

defineProps<{
  title: string
  message: string
  cancelLabel: string
  confirmLabel: string
  /** Si es true, el botón principal usa estilo destructivo (`btn-danger`). */
  confirmDanger?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const open = defineModel<boolean>('open', { required: true })

const dialogRef = useTemplateRef<HTMLDialogElement>('dialogRef')
const titleId = useId()
const descId = useId()
/** Evita tratar el cierre tras confirmar como una cancelación. */
const closingAfterConfirm = ref(false)

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

function onDialogClose(): void {
  if (closingAfterConfirm.value) {
    closingAfterConfirm.value = false
  }
}

function onCancelClick(): void {
  emit('cancel')
  open.value = false
}

function onConfirmClick(): void {
  closingAfterConfirm.value = true
  emit('confirm')
  open.value = false
}

function onDialogCancel(ev: Event): void {
  ev.preventDefault()
  emit('cancel')
  open.value = false
}

onBeforeUnmount(() => {
  const el = dialogRef.value
  if (el?.open) {
    closingAfterConfirm.value = false
    el.close()
  }
})
</script>

<template>
  <dialog
    ref="dialogRef"
    class="mtl-confirm-dialog"
    role="alertdialog"
    aria-modal="true"
    :aria-labelledby="titleId"
    :aria-describedby="descId"
    @close="onDialogClose"
    @cancel="onDialogCancel"
  >
    <div class="mtl-confirm-dialog-panel" @click.stop>
      <h3 :id="titleId" class="mtl-confirm-dialog-title">{{ title }}</h3>
      <p :id="descId" class="mtl-confirm-dialog-message">{{ message }}</p>
      <div class="mtl-confirm-dialog-actions">
        <button type="button" class="btn btn-secondary btn-sm" @click="onCancelClick">
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          class="btn btn-sm mtl-confirm-dialog-confirm"
          :class="confirmDanger ? 'btn-danger' : 'btn-primary'"
          @click="onConfirmClick"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </dialog>
</template>

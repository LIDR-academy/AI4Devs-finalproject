import { describe, expect, it, beforeAll } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import MtlConfirmDialog from '@/components/MtlConfirmDialog.vue'

beforeAll(() => {
  if (typeof HTMLDialogElement === 'undefined') {
    return
  }
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & {
    showModal?: () => void
  }
  if (typeof proto.showModal !== 'function') {
    proto.showModal = function (this: HTMLDialogElement) {
      this.setAttribute('open', '')
    }
  }
  if (typeof (proto as { close?: () => void }).close !== 'function') {
    ;(proto as { close: () => void }).close = function (this: HTMLDialogElement) {
      this.removeAttribute('open')
    }
  }
})

describe('MtlConfirmDialog', () => {
  it('al pulsar confirmar emite confirm y cierra el diálogo', async () => {
    const wrapper = mount(MtlConfirmDialog, {
      props: {
        open: true,
        title: 'Título de prueba',
        message: 'Cuerpo del mensaje.',
        cancelLabel: 'No',
        confirmLabel: 'Sí',
        confirmDanger: false,
      },
    })
    await flushPromises()

    await wrapper.get('.mtl-confirm-dialog-confirm').trigger('click')
    await flushPromises()

    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('cancel')).toBeUndefined()
    expect(wrapper.emitted('update:open')?.map((e) => e[0])).toContain(false)
  })

  it('al pulsar cancelar emite cancel y cierra el diálogo', async () => {
    const wrapper = mount(MtlConfirmDialog, {
      props: {
        open: true,
        title: 'T',
        message: 'M',
        cancelLabel: 'No',
        confirmLabel: 'Sí',
      },
    })
    await flushPromises()

    await wrapper.get('.mtl-confirm-dialog-actions .btn-secondary').trigger('click')
    await flushPromises()

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it('aplica btn-danger al botón principal cuando confirmDanger es true', async () => {
    const wrapper = mount(MtlConfirmDialog, {
      props: {
        open: true,
        title: 'T',
        message: 'M',
        cancelLabel: 'No',
        confirmLabel: 'Eliminar',
        confirmDanger: true,
      },
    })
    await flushPromises()

    expect(wrapper.get('.mtl-confirm-dialog-confirm').classes()).toContain('btn-danger')
  })
})

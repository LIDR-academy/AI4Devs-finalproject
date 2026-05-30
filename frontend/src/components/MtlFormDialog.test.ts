import { beforeAll, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import MtlFormDialog from '@/components/MtlFormDialog.vue'

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

describe('MtlFormDialog', () => {
  it('emite submit al enviar el formulario', async () => {
    const wrapper = mount(MtlFormDialog, {
      props: {
        open: true,
        title: 'Alta de especie',
        cancelLabel: 'Volver',
        submitLabel: 'Guardar',
        formId: 'test-form',
      },
      slots: {
        default: '<input id="x" />',
      },
    })
    await flushPromises()

    await wrapper.get('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  it('emite cancel y cierra al pulsar el botón secundario', async () => {
    const wrapper = mount(MtlFormDialog, {
      props: {
        open: true,
        title: 'T',
        cancelLabel: 'Volver',
        submitLabel: 'Guardar',
      },
    })
    await flushPromises()

    await wrapper.get('.mtl-form-dialog-actions .btn-secondary').trigger('click')
    await flushPromises()

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('update:open')?.map((e) => e[0])).toContain(false)
  })

  it('aplica clase de apilado según stack', async () => {
    const wrapper = mount(MtlFormDialog, {
      props: {
        open: true,
        title: 'T',
        cancelLabel: 'Cancelar',
        submitLabel: 'Crear',
        stack: 'genus',
      },
    })
    await flushPromises()

    expect(wrapper.get('dialog').classes()).toContain('mtl-form-dialog--genus')
  })

  it('muestra error de formulario cuando formError está definido', async () => {
    const wrapper = mount(MtlFormDialog, {
      props: {
        open: true,
        title: 'T',
        cancelLabel: 'Cancelar',
        submitLabel: 'Crear',
        formError: 'Campo obligatorio',
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Campo obligatorio')
    expect(wrapper.get('[role="alert"]').attributes('id')).toBeTruthy()
  })

  it('expone fieldA11y en el slot para controles del formulario', async () => {
    const wrapper = mount(MtlFormDialog, {
      props: {
        open: true,
        title: 'T',
        cancelLabel: 'Cancelar',
        submitLabel: 'Crear',
        formError: 'Campo obligatorio',
      },
      slots: {
        default: `
          <template #default="{ fieldA11y }">
            <input id="test-field" v-bind="fieldA11y" />
          </template>
        `,
      },
    })
    await flushPromises()

    const input = wrapper.get('#test-field')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe(wrapper.get('[role="alert"]').attributes('id'))
  })
})

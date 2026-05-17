import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { computed, reactive, ref } from 'vue'
import { createI18n } from 'vue-i18n'
import MtlConfirmDialog from '@/components/MtlConfirmDialog.vue'
import EditTreeView from '@/views/EditTreeView.vue'
import { es } from '@/i18n/locales/es'

const initializeMock = vi.hoisted(() => vi.fn(async () => 'Encina (Quercus ilex)'))
const submitMock = vi.hoisted(() => vi.fn(async () => true))
const removeTreeMock = vi.hoisted(() => vi.fn(async () => true))
const addGalleryPhotoMock = vi.hoisted(() => vi.fn(async () => true))
const removeGalleryPhotoMock = vi.hoisted(() => vi.fn(async () => true))

const galleryPhotoFixture = {
  id: 1,
  url: 'http://x/1.jpg',
  esPrincipal: true,
  orden: 0,
  mimeType: 'image/jpeg',
  ancho: null,
  alto: null,
  categoria: 'PUBLIC',
}

const galleryPhotosRef = vi.hoisted(() => ({
  value: [] as Array<{
    id: number
    url: string
    esPrincipal: boolean
    orden: number
    mimeType: string
    ancho: null
    alto: null
    categoria: string
  }>,
}))

const form = reactive({
  speciesId: '1',
  provinceId: '28',
  municipality: 'Madrid',
  description: '',
  latitude: '40.4',
  longitude: '-3.7',
  altitude: '',
  publicationState: 'BORRADOR',
  publicMapVisibility: 'PRIVADO',
})

vi.mock('@/composables/useEditTreeForm', () => ({
  useEditTreeForm: () => ({
    form,
    species: ref([{ id: 1, label: 'Encina (Quercus ilex)' }]),
    provinces: ref([{ id: 28, label: 'Madrid (28)' }]),
    galleryPhotos: galleryPhotosRef,
    publicationStateOptions: computed(() => [{ value: 'BORRADOR', label: 'Borrador' }]),
    mapVisibilityOptions: computed(() => [{ value: 'PRIVADO', label: 'Privado' }]),
    isLoading: ref(false),
    loadError: ref(''),
    isReady: computed(() => true),
    isSubmitting: ref(false),
    isDeleting: ref(false),
    fieldErrors: ref({}),
    submitError: ref(''),
    deleteError: ref(''),
    galleryPhotoError: ref(''),
    isDeletingPhoto: ref(false),
    isUploadingPhoto: ref(false),
    canAddGalleryPhoto: computed(() => true),
    addGalleryPhoto: addGalleryPhotoMock,
    removeGalleryPhoto: removeGalleryPhotoMock,
    initialize: initializeMock,
    submit: submitMock,
    removeTree: removeTreeMock,
  }),
}))

vi.mock('@/composables/useTreeLocationAutofill', () => ({
  useTreeLocationAutofill: () => ({
    applyCoordinatesAndAutofillAddress: vi.fn(),
  }),
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    useRoute: () => ({
      params: { id: '42' },
    }),
  }
})

function createTestI18n() {
  return createI18n({
    legacy: false,
    locale: 'es',
    fallbackLocale: 'es',
    messages: { es },
  })
}

describe('EditTreeView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    galleryPhotosRef.value = []
  })

  it('shows title with tree id and action buttons', async () => {
    const wrapper = mount(EditTreeView, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          SpeciesAutocompleteInput: {
            template: '<motion.div />',
            setup(_props, { expose }) {
              expose({ commitSpeciesFromText: () => undefined })
            },
          },
          TreeLocationMapPreview: true,
          TreePhotoFullscreenViewer: true,
          MtlConfirmDialog: true,
        },
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Edición Id 42')
    expect(wrapper.text()).toContain('Volver al listado')
    expect(wrapper.text()).toContain('Guardar')
    expect(wrapper.find('.tree-detail-visual-grid').exists()).toBe(true)
    expect(initializeMock).toHaveBeenCalled()
  })

  it('shows add-photo control when gallery is empty', async () => {
    const wrapper = mount(EditTreeView, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          SpeciesAutocompleteInput: {
            template: '<motion.div />',
            setup(_props, { expose }) {
              expose({ commitSpeciesFromText: () => undefined })
            },
          },
          TreeLocationMapPreview: true,
          TreePhotoFullscreenViewer: true,
          MtlConfirmDialog: true,
        },
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Sin fotografías')
    const addButton = wrapper.find('button[aria-label="Añadir fotografía"]')
    expect(addButton.exists()).toBe(true)
    expect(addButton.attributes('disabled')).toBeUndefined()
  })

  it('asks for confirmation before deleting a gallery photo', async () => {
    galleryPhotosRef.value = [{ ...galleryPhotoFixture }]

    const wrapper = mount(EditTreeView, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          TreeLocationMapPreview: true,
          TreePhotoFullscreenViewer: true,
        },
      },
    })

    await flushPromises()

    await wrapper.find('button[aria-label="Eliminar esta fotografía"]').trigger('click')
    expect(removeGalleryPhotoMock).not.toHaveBeenCalled()
    const photoDeleteDialog = wrapper
      .findAllComponents(MtlConfirmDialog)
      .find((dialog) =>
        String(dialog.props('message')).includes('¿Confirmas la eliminación de esta fotografía?'),
      )

    expect(photoDeleteDialog).toBeDefined()
    photoDeleteDialog!.vm.$emit('confirm')
    await flushPromises()

    expect(removeGalleryPhotoMock).toHaveBeenCalledWith(1)
  })

  it('calls submit when form is submitted', async () => {
    const wrapper = mount(EditTreeView, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          SpeciesAutocompleteInput: {
            template: '<motion.div />',
            setup(_props, { expose }) {
              expose({ commitSpeciesFromText: () => undefined })
            },
          },
          TreeLocationMapPreview: true,
          TreePhotoFullscreenViewer: true,
          MtlConfirmDialog: true,
        },
      },
    })

    await flushPromises()
    await wrapper.find('form').trigger('submit.prevent')

    expect(submitMock).toHaveBeenCalled()
  })
})

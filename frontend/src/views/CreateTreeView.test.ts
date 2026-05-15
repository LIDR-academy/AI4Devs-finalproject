import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { computed, reactive, ref } from 'vue'
import { createI18n } from 'vue-i18n'
import CreateTreeView from '@/views/CreateTreeView.vue'
import { es } from '@/i18n/locales/es'

const loadMastersMock = vi.hoisted(() => vi.fn(async () => {}))
const submitMock = vi.hoisted(() => vi.fn(async () => {}))
const reverseGeocodeWithOpenStreetMapMock = vi.hoisted(() => vi.fn())

const { readGpsFromImageFileMock } = vi.hoisted(() => ({
  readGpsFromImageFileMock: vi.fn().mockResolvedValue(null),
}))

vi.mock('@/composables/imageExifGps', () => ({
  readGpsFromImageFile: (...args: unknown[]) => readGpsFromImageFileMock(...args),
}))

const form = reactive({
  speciesId: '',
  provinceId: '',
  municipality: '',
  description: '',
  latitude: '',
  longitude: '',
  altitude: '',
  publicationState: 'BORRADOR',
  publicMapVisibility: 'PRIVADO',
})

const species = ref([{ id: 1, label: 'Encina' }])
const provinces = ref([{ id: 28, label: 'Madrid (28)' }])

vi.mock('@/services/geocoding/openStreetMapReverseGeocoding', () => ({
  reverseGeocodeWithOpenStreetMap: reverseGeocodeWithOpenStreetMapMock,
}))

vi.mock('@/composables/useCreateTreeForm', () => ({
  useCreateTreeForm: () => ({
    form,
    species,
    provinces,
    publicationStateOptions: computed(() => [{ value: 'BORRADOR', label: 'Borrador' }]),
    mapVisibilityOptions: computed(() => [{ value: 'PRIVADO', label: 'Privado' }]),
    isLoadingMasters: ref(false),
    mastersError: ref(''),
    hasMasters: computed(() => true),
    isSubmitting: ref(false),
    fieldErrors: ref({}),
    submitError: ref(''),
    submitSuccess: ref(''),
    photosUploadError: ref(''),
    selectedPhotoFiles: ref<File[]>([]),
    loadMasters: loadMastersMock,
    submit: submitMock,
  }),
}))

function createTestI18n() {
  return createI18n({
    legacy: false,
    locale: 'es',
    fallbackLocale: 'es',
    messages: { es },
  })
}

describe('CreateTreeView', () => {
  it('fills province combo and municipality when map coordinates are picked', async () => {
    reverseGeocodeWithOpenStreetMapMock.mockResolvedValue({
      provinceId: '28',
      municipalityName: 'Madrid',
    })

    const wrapper = mount(CreateTreeView, {
      global: {
        plugins: [createTestI18n()],
        stubs: {
          RouterLink: true,
          TreePhotoUploadPicker: {
            name: 'TreePhotoUploadPicker',
            template: '<div />',
          },
          TreeLocationMapPreview: {
            name: 'TreeLocationMapPreview',
            template: '<div />',
          },
        },
      },
    })

    const mapPreview = wrapper.getComponent({ name: 'TreeLocationMapPreview' })
    mapPreview.vm.$emit('pick-coordinates', { latitude: '40.4168', longitude: '-3.7038' })
    await flushPromises()

    expect(reverseGeocodeWithOpenStreetMapMock).toHaveBeenCalledWith(
      '40.4168',
      '-3.7038',
      provinces.value,
    )
    expect(form.provinceId).toBe('28')
    expect(form.municipality).toBe('Madrid')
    expect((wrapper.get('#provinceId').element as HTMLSelectElement).value).toBe('28')
    expect((wrapper.get('#municipality').element as HTMLInputElement).value).toBe('Madrid')
  })

  it('actualiza latitud y longitud del formulario cuando la primera foto aporta EXIF GPS', async () => {
    readGpsFromImageFileMock.mockResolvedValue({
      latitude: '41.500000',
      longitude: '-3.600000',
    })
    reverseGeocodeWithOpenStreetMapMock.mockResolvedValue({
      provinceId: '28',
      municipalityName: 'Madrid',
    })

    form.latitude = ''
    form.longitude = ''
    form.provinceId = ''
    form.municipality = ''

    const createObjectUrlSpy = vi.fn(() => 'blob:create-tree-test')
    const revokeObjectUrlSpy = vi.fn()
    vi.stubGlobal('URL', {
      createObjectURL: createObjectUrlSpy,
      revokeObjectURL: revokeObjectUrlSpy,
    })

    try {
      const wrapper = mount(CreateTreeView, {
        global: {
          plugins: [createTestI18n()],
          stubs: {
            RouterLink: true,
            TreeLocationMapPreview: {
              name: 'TreeLocationMapPreview',
              template: '<div />',
            },
          },
        },
      })

      const file = new File([new Uint8Array(512)], 'from-exif.jpg', { type: 'image/jpeg' })
      const input = wrapper.get('input[type="file"]')
      Object.defineProperty(input.element, 'files', {
        value: [file],
        configurable: true,
      })
      await input.trigger('change')
      await flushPromises()

      expect(form.latitude).toBe('41.500000')
      expect(form.longitude).toBe('-3.600000')
      expect(form.provinceId).toBe('28')
      expect(form.municipality).toBe('Madrid')
    } finally {
      vi.unstubAllGlobals()
      readGpsFromImageFileMock.mockReset()
      readGpsFromImageFileMock.mockResolvedValue(null)
    }
  })
})

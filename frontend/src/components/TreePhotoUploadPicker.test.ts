import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createI18n } from 'vue-i18n'
import TreePhotoUploadPicker from '@/components/TreePhotoUploadPicker.vue'
import { es } from '@/i18n/locales/es'

const { readGpsSpy } = vi.hoisted(() => ({
  readGpsSpy: vi.fn().mockResolvedValue(null),
}))

vi.mock('@/composables/imageExifGps', () => ({
  readGpsFromImageFile: readGpsSpy,
}))

function buildFile(name: string, type: string, sizeInBytes: number): File {
  return new File([new Uint8Array(sizeInBytes)], name, { type })
}

function mountPicker() {
  const i18n = createI18n({
    legacy: false,
    locale: 'es',
    messages: { es },
  })
  return mount(TreePhotoUploadPicker, {
    props: { modelValue: [] },
    global: {
      plugins: [i18n],
    },
  })
}

async function triggerFileSelection(
  wrapper: ReturnType<typeof mountPicker>,
  files: File[],
): Promise<void> {
  const input = wrapper.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', {
    value: files,
    configurable: true,
  })
  await input.trigger('change')
}

describe('TreePhotoUploadPicker', () => {
  const createObjectUrlSpy = vi.fn(() => 'blob:test-url')
  const revokeObjectUrlSpy = vi.fn()

  beforeEach(() => {
    readGpsSpy.mockReset()
    readGpsSpy.mockResolvedValue(null)
    createObjectUrlSpy.mockClear()
    revokeObjectUrlSpy.mockClear()
    vi.stubGlobal('URL', {
      createObjectURL: createObjectUrlSpy,
      revokeObjectURL: revokeObjectUrlSpy,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('adds valid photos and marks first as principal', async () => {
    const wrapper = mountPicker()

    const first = buildFile('a.jpg', 'image/jpeg', 1024)
    const second = buildFile('b.png', 'image/png', 2048)
    await triggerFileSelection(wrapper, [first, second])

    const updateEvents = wrapper.emitted('update:modelValue')
    expect(updateEvents).toBeTruthy()
    const lastEvent = updateEvents?.at(-1)
    expect(lastEvent?.[0]).toHaveLength(2)
    expect(wrapper.text()).toContain('Foto principal')
    expect(createObjectUrlSpy).toHaveBeenCalledTimes(2)
  })

  it('shows validation messages for invalid mime and oversized file', async () => {
    const wrapper = mountPicker()

    const invalidMime = buildFile('c.gif', 'image/gif', 1024)
    const invalidSize = buildFile('d.jpg', 'image/jpeg', 21 * 1024 * 1024)
    await triggerFileSelection(wrapper, [invalidMime, invalidSize])

    expect(wrapper.text()).toContain('formato no permitido')
    expect(wrapper.text()).toContain('supera el tamaño máximo de 20 MB')
    const updateEvents = wrapper.emitted('update:modelValue')
    const lastEvent = updateEvents?.at(-1)
    expect(lastEvent?.[0]).toHaveLength(0)
  })

  it('removes photo and revokes its object URL', async () => {
    const wrapper = mountPicker()
    const file = buildFile('a.jpg', 'image/jpeg', 1024)
    await triggerFileSelection(wrapper, [file])

    await wrapper.get('button[type="button"]').trigger('click')

    const updateEvents = wrapper.emitted('update:modelValue')
    const lastEvent = updateEvents?.at(-1)
    expect(lastEvent?.[0]).toHaveLength(0)
    expect(revokeObjectUrlSpy).toHaveBeenCalled()
  })

  it('emits first-photo-gps when EXIF devuelve coordenadas válidas', async () => {
    readGpsSpy.mockResolvedValue({
      latitude: '41.123456',
      longitude: '-4.987654',
    })
    const wrapper = mountPicker()
    const file = buildFile('geo.jpg', 'image/jpeg', 1024)
    await triggerFileSelection(wrapper, [file])
    await flushPromises()

    const gpsEvents = wrapper.emitted('first-photo-gps')
    expect(gpsEvents).toBeTruthy()
    expect(gpsEvents?.at(-1)?.[0]).toEqual({
      latitude: '41.123456',
      longitude: '-4.987654',
    })
    expect(wrapper.text()).toContain('Coordenadas actualizadas desde la primera fotografía')
  })

  it('acepta como máximo 10 fotos válidas y muestra mensaje si se intentan 11', async () => {
    const wrapper = mountPicker()
    const files = Array.from({ length: 11 }, (_, i) =>
      buildFile(`p-${i}.jpg`, 'image/jpeg', 200 + i),
    )
    await triggerFileSelection(wrapper, files)

    const updateEvents = wrapper.emitted('update:modelValue')
    const lastEvent = updateEvents?.at(-1)
    expect(lastEvent?.[0]).toHaveLength(10)
    expect(wrapper.text()).toContain('Solo se permiten 10 fotografías por árbol.')
  })

  it('al quitar la primera foto relee EXIF del nuevo primero y emite last first-photo-gps acorde', async () => {
    readGpsSpy
      .mockResolvedValueOnce({
        latitude: '10.000000',
        longitude: '20.000000',
      })
      .mockResolvedValueOnce({
        latitude: '99.000000',
        longitude: '88.000000',
      })

    const wrapper = mountPicker()
    const first = buildFile('first.jpg', 'image/jpeg', 1024)
    const second = buildFile('second.jpg', 'image/jpeg', 2048)
    await triggerFileSelection(wrapper, [first, second])
    await flushPromises()

    expect(readGpsSpy).toHaveBeenCalledTimes(1)
    expect(readGpsSpy.mock.calls[0][0]).toBe(first)

    const removeFirst = wrapper.findAll('.photo-preview-item').at(0)?.get('button[type="button"]')
    expect(removeFirst).toBeTruthy()
    await removeFirst!.trigger('click')
    await flushPromises()

    expect(readGpsSpy).toHaveBeenCalledTimes(2)
    expect(readGpsSpy.mock.calls[1][0]).toBe(second)
    expect(wrapper.text()).toContain('Foto principal')

    const gpsEvents = wrapper.emitted('first-photo-gps')
    expect(gpsEvents?.at(-1)?.[0]).toEqual({
      latitude: '99.000000',
      longitude: '88.000000',
    })
  })

  it('no emite first-photo-gps si la primera imagen no tiene GPS en EXIF', async () => {
    readGpsSpy.mockResolvedValue(null)
    const wrapper = mountPicker()
    await triggerFileSelection(wrapper, [buildFile('no-gps.jpg', 'image/jpeg', 1024)])
    await flushPromises()

    expect(wrapper.emitted('first-photo-gps')).toBeUndefined()
  })
})

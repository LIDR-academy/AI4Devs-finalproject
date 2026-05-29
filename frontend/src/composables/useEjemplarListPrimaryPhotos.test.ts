import { createApp, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useEjemplarListPrimaryPhotos } from '@/composables/useEjemplarListPrimaryPhotos'

vi.mock('@/services/http/apiClient', () => ({
  apiFetchBlob: vi.fn(),
}))

import { apiFetchBlob } from '@/services/http/apiClient'

describe('useEjemplarListPrimaryPhotos', () => {
  let revokeSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.mocked(apiFetchBlob).mockImplementation(async (path: string) => {
      if (path.includes('/ejemplares/2/')) {
        return new Blob([new Uint8Array([1, 2])], { type: 'image/jpeg' })
      }
      return null
    })
  })

  afterEach(() => {
    revokeSpy.mockRestore()
  })

  function mountComposable() {
    let api!: ReturnType<typeof useEjemplarListPrimaryPhotos>
    const app = createApp({
      setup() {
        api = useEjemplarListPrimaryPhotos()
        return () => null
      },
    })
    const el = document.createElement('div')
    app.mount(el)
    return { api, app, el }
  }

  it('loadForEjemplarIds crea object URLs solo para blobs disponibles', async () => {
    const createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:thumb-2')
    const { api } = mountComposable()

    await api.loadForEjemplarIds([1, 2])
    await nextTick()

    expect(api.thumbUrls.value[2]).toBe('blob:thumb-2')
    expect(api.thumbUrls.value[1]).toBeUndefined()
    createObjectUrlSpy.mockRestore()
  })

  it('segunda carga revoca URLs anteriores', async () => {
    const createObjectUrlSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValueOnce('blob:first')
      .mockReturnValueOnce('blob:second')
    const { api } = mountComposable()

    await api.loadForEjemplarIds([2])
    await api.loadForEjemplarIds([2])
    await nextTick()

    expect(revokeSpy).toHaveBeenCalledWith('blob:first')
    expect(api.thumbUrls.value[2]).toBe('blob:second')
    createObjectUrlSpy.mockRestore()
  })

  it('load abortado no publica miniaturas nuevas', async () => {
    const controller = new AbortController()
    vi.mocked(apiFetchBlob).mockImplementation(
      () =>
        new Promise((resolve) => {
          globalThis.setTimeout(() => resolve(new Blob([new Uint8Array([1])])), 30)
        }),
    )
    const createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:late')
    const { api } = mountComposable()

    const pending = api.loadForEjemplarIds([2], controller.signal)
    controller.abort()
    await pending
    await nextTick()

    expect(api.thumbUrls.value).toEqual({})
    createObjectUrlSpy.mockRestore()
  })

  it('desmontaje revoca URLs activas', async () => {
    const createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:live')
    const { api, app, el } = mountComposable()

    await api.loadForEjemplarIds([2])
    app.unmount()
    el.remove()

    expect(revokeSpy).toHaveBeenCalledWith('blob:live')
    createObjectUrlSpy.mockRestore()
  })
})

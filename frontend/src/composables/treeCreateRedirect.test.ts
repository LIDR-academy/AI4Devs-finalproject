import { describe, expect, it } from 'vitest'
import { parseTreeCreateFlash, treeEditRouteAfterCreate } from '@/composables/treeCreateRedirect'

describe('treeCreateRedirect', () => {
  it('treeEditRouteAfterCreate construye ruta de edición', () => {
    expect(treeEditRouteAfterCreate(7, 'okPhotos')).toEqual({
      name: 'ejemplares-edit',
      params: { id: '7' },
      query: { fromCreate: 'okPhotos' },
    })
  })

  it('parseTreeCreateFlash acepta valores conocidos', () => {
    expect(parseTreeCreateFlash('ok')).toBe('ok')
    expect(parseTreeCreateFlash('photosWarning')).toBe('photosWarning')
    expect(parseTreeCreateFlash('invalid')).toBeNull()
  })
})

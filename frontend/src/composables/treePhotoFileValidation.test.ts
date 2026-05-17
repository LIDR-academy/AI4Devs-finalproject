import { describe, expect, it } from 'vitest'
import {
  TREE_PHOTO_MAX_PER_TREE,
  treePhotoValidationMessage,
  validateTreePhotoFile,
} from '@/composables/treePhotoFileValidation'

const messages = {
  maxPhotos: (max: number) => `max-${max}`,
  invalidMime: (allowed: string) => `mime-${allowed}`,
  maxFileSize: (maxMb: number) => `size-${maxMb}`,
}

describe('validateTreePhotoFile', () => {
  it('returns null for a valid jpeg within limits', () => {
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' })

    expect(validateTreePhotoFile(file, 0, messages)).toBeNull()
  })

  it('returns maxPhotos when count is at limit', () => {
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' })

    expect(validateTreePhotoFile(file, TREE_PHOTO_MAX_PER_TREE, messages)).toBe('maxPhotos')
  })

  it('returns invalidMime for disallowed type', () => {
    const file = new File(['x'], 'a.gif', { type: 'image/gif' })

    expect(validateTreePhotoFile(file, 0, messages)).toBe('invalidMime')
  })

  it('returns maxFileSize when file exceeds limit', () => {
    const file = new File([new Uint8Array(21 * 1024 * 1024)], 'big.jpg', {
      type: 'image/jpeg',
    })

    expect(validateTreePhotoFile(file, 0, messages)).toBe('maxFileSize')
  })
})

describe('treePhotoValidationMessage', () => {
  it('maps validation codes to messages', () => {
    expect(treePhotoValidationMessage('maxPhotos', messages)).toBe(`max-${TREE_PHOTO_MAX_PER_TREE}`)
    expect(treePhotoValidationMessage('invalidMime', messages)).toContain('mime-')
    expect(treePhotoValidationMessage('maxFileSize', messages)).toBe('size-20')
  })
})

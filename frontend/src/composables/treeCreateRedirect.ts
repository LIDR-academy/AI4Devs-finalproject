/** Query `fromCreate` tras alta: mensaje flash en edición (se elimina con `router.replace`). */
export const TREE_CREATE_FLASH_QUERY = 'fromCreate' as const

export type TreeCreateFlashValue = 'ok' | 'okPhotos' | 'photosWarning'

export function treeEditRouteAfterCreate(
  treeId: number,
  flash: TreeCreateFlashValue,
): {
  name: 'ejemplares-edit'
  params: { id: string }
  query: { fromCreate: TreeCreateFlashValue }
} {
  return {
    name: 'ejemplares-edit',
    params: { id: String(treeId) },
    query: { [TREE_CREATE_FLASH_QUERY]: flash },
  }
}

export function parseTreeCreateFlash(value: unknown): TreeCreateFlashValue | null {
  if (value === 'ok' || value === 'okPhotos' || value === 'photosWarning') {
    return value
  }
  return null
}

import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  parseTreeCreateFlash,
  TREE_CREATE_FLASH_QUERY,
} from '@/composables/treeCreateRedirect'

/** Lee el flash de alta (`fromCreate`), rellena mensajes y limpia la query de la URL. */
export function useTreeCreateFlashFromRoute() {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  const successMessage = ref('')
  const warningMessage = ref('')

  function applyFromRoute(): void {
    const flash = parseTreeCreateFlash(route.query[TREE_CREATE_FLASH_QUERY])
    if (!flash) {
      return
    }

    successMessage.value =
      flash === 'okPhotos'
        ? t('treeEdit.messages.createdFromFormWithPhotos')
        : t('treeEdit.messages.createdFromForm')

    if (flash === 'photosWarning') {
      warningMessage.value = t('treeEdit.messages.createdFromFormPhotosWarning')
    }

    const query = { ...route.query }
    delete query[TREE_CREATE_FLASH_QUERY]
    void router.replace({
      name: route.name ?? undefined,
      params: route.params,
      query,
    })
  }

  return {
    successMessage,
    warningMessage,
    applyFromRoute,
  }
}

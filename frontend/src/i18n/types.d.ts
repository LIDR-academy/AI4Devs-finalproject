import 'vue-i18n'
import type { MessageSchema } from '@/i18n/locales/es'

declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GATEWAY_BASE_URL?: string
  readonly VITE_OIDC_ISSUER?: string
  readonly VITE_OIDC_CLIENT_ID?: string
  readonly VITE_OIDC_SCOPE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

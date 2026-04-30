const defaultIssuer = 'http://localhost:8180/realms/mtl'
const defaultClientId = 'mtl-spa'
const defaultGatewayBaseUrl = ''

export const appConfig = {
  oidc: {
    issuer: import.meta.env.VITE_OIDC_ISSUER ?? defaultIssuer,
    clientId: import.meta.env.VITE_OIDC_CLIENT_ID ?? defaultClientId,
    scope: import.meta.env.VITE_OIDC_SCOPE ?? 'openid profile email',
  },
  api: {
    gatewayBaseUrl: import.meta.env.VITE_GATEWAY_BASE_URL ?? defaultGatewayBaseUrl,
  },
}

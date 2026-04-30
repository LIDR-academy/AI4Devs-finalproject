# Frontend SPA (Vue 3)

Bootstrap inicial del frontend para MyTreeLibrary:

- Vue 3 + TypeScript + Vite
- Vue Router (ruta protegida para alta de ficha)
- OIDC real con Keycloak (Authorization Code + PKCE, cliente `mtl-spa`)
- Cliente HTTP base para consumir el gateway con Bearer
- Internacionalización con `vue-i18n` (locale base: `es`)

## Variables de entorno

Copiar `.env.example` a `.env` y ajustar si cambias puertos locales.

## Arranque local

```bash
npm install
npm run dev
```

El entorno de desarrollo usa proxy de Vite para evitar problemas CORS:

- `/api/*` -> `http://localhost:8080/*`
- Si no usas proxy, define `VITE_GATEWAY_BASE_URL=http://localhost:8080` y configura CORS en gateway.

## Textos e internacionalización

- Archivos de propiedades en `src/i18n/locales/` (por ahora `es.ts`).
- Evitar hardcodear textos nuevos en vistas/composables; usar claves `t('...')`.

## Flujo de autenticación

- Ruta protegida: `/trees/new`
- Callback OIDC: `/auth/callback`
- Login redirige a Keycloak con `scope=openid profile email`

## Patrón recomendado para HU-007/HU-008 (requests cancelables)

Para vistas con filtros, búsquedas o navegación rápida, usar el composable base `src/composables/useAbortableRequest.ts`:

- abortar la request previa antes de lanzar una nueva;
- pasar `signal` hasta `services/*` y `apiFetch`;
- ignorar `AbortError` en UI (no mostrar como error funcional).

Ejemplo de uso:

```ts
const { runWithAbort, isAbortError } = useAbortableRequest()

async function loadItems() {
  try {
    const data = await runWithAbort((signal) => listItems({ q: query.value }, signal))
    items.value = data
  } catch (error) {
    if (isAbortError(error)) return
    uiError.value = mapApiError(error)
  }
}
```

## Mapa en la pantalla de alta (OpenStreetMap + Leaflet)

- Vista previa con teselas gratuitas de [OpenStreetMap](https://www.openstreetmap.org/); **doble clic** en el mapa rellena lat/lng (sin editar geometría arrastrando).
- Debes mostrar la **atribución** a los colaboradores de OSM (ya aparece en el mapa y en el texto bajo el mapa).
- El uso masivo de teselas públicas de `tile.openstreetmap.org` puede chocar con la [política de uso](https://operations.osmfoundation.org/policies/tiles/); en producción a alto tráfico conviene un proveedor de mapas propio o de terceros con acuerdo comercial.

## Verificación manual E2E (TASK-HU-005-10)

1. Levantar infraestructura (`infra/compose`) y servicios backend (`api-gateway` + `catalog-service`) en perfil `dev`.
2. En `frontend/`, ejecutar `npm run dev`.
3. Abrir `http://localhost:5173/trees/new`; la app redirige a Keycloak.
4. Iniciar sesión con usuario de desarrollo:
   - usuario: `colaborador`
   - contraseña: `colaborador_dev`
5. Verificar que cargan especies y provincias, que latitud y longitud empiezan vacías, que el mapa inicia centrado en 40,4063 / -3,65588 sin marcador, que un doble clic en el mapa rellena coordenadas y muestra el marcador, y completar el formulario y enviar.
6. Resultado esperado: mensaje de éxito con `treeId` y respuesta `201` en la llamada `POST /api/catalog/trees`.

Notas:
- Si el token caduca, ante `401` la pantalla redirige automáticamente al login.
- Los mensajes de validación de `400` se muestran de forma legible en la UI.

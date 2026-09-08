import { test as base } from "@playwright/test";

/**
 * `test` de Playwright con las imágenes de terceros cortadas.
 *
 * El catálogo pinta las fotos de caja desde el CDN de Rebrickable —24 por página— y
 * `page.goto` espera al evento `load`, que no se dispara hasta que han llegado todas.
 * Con el CDN respondiendo a ~3 s por imagen eso agotaba el tiempo de la prueba de
 * forma intermitente, y el rojo no decía nada sobre la aplicación: decía que un
 * servidor ajeno iba lento.
 *
 * Ninguna prueba comprueba las fotos, así que se abortan. De paso el E2E deja de
 * necesitar internet, que es como debería haber estado desde el principio.
 */
export const test = base.extend({
  // El parámetro se llama `provide` y no `use` —el nombre habitual en Playwright—
  // porque la regla `react-hooks/rules-of-hooks` lo confunde con el hook `use` de React.
  page: async ({ page }, provide) => {
    await page.route("**cdn.rebrickable.com/**", (route) => route.abort());
    await provide(page);
  },
});

export { expect, type Page, type APIRequestContext } from "@playwright/test";

import { RecipeGenerationOptions } from './IAiRecipeGeneratorGateway.js';

/**
 * Puerto que resuelve las opciones de generación de recetas de rescate a partir de
 * la configuración de IA persistida: descifra la API key almacenada, cae a variable
 * de entorno si no la hay, y — cuando el proveedor es `HEURISTIC` o las recetas de
 * rescate están desactivadas — devuelve opciones sin credencial ni endpoint para que
 * el gateway de generación elija el motor heurístico local.
 *
 * Aísla al caso de uso (`SuggestRescueRecipesUseCase`) del servicio de cifrado y del
 * repositorio de configuración de IA, ambos de infraestructura (TK-125 / AUDIT-DEV-007 F-2).
 */
export interface IAiRecipeGenerationOptionsResolver {
  resolve(): Promise<RecipeGenerationOptions>;
}

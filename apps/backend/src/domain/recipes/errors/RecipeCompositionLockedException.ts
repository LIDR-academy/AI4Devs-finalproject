import { DomainError } from '../../errors/DomainError.js';

/**
 * US-037 Escenario 3: la composición de una receta no puede editarse una vez que
 * existe una `RecipePreparation` `CLOSED` que la referencia — cambiar los ingredientes
 * alteraría retroactivamente el "consumo teórico vs. real" de los reportes de mermas
 * de preparación (`US-029`).
 */
export class RecipeCompositionLockedException extends DomainError {
  constructor(recipeId: string) {
    super(
      `La composición de la receta ${recipeId} está congelada: tiene preparaciones cerradas y editar sus ingredientes distorsionaría los reportes históricos. Solo se puede editar nombre, categoría y descripción.`,
      409
    );
  }
}

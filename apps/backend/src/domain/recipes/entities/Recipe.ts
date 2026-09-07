import { RecipeIngredient } from './RecipeIngredient.js';

export interface RecipeDetailsPatch {
  name?: string;
  category?: string;
  description?: string | null;
  ingredients?: RecipeIngredient[];
}

export class Recipe {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly category: string,
    public readonly ingredients: RecipeIngredient[],
    public readonly description?: string,
    /** US-037: soft-delete. Una receta inactiva no aparece en listados ni en el rescate. */
    public readonly isActive: boolean = true
  ) {}

  /**
   * US-037: edición inmutable. Campos ausentes se conservan; `description: null` la limpia.
   * `ingredients` reemplaza la composición completa.
   */
  withDetails(patch: RecipeDetailsPatch): Recipe {
    return new Recipe(
      this.id,
      patch.name ?? this.name,
      patch.category ?? this.category,
      patch.ingredients ?? this.ingredients,
      patch.description === undefined ? this.description : (patch.description ?? undefined),
      this.isActive
    );
  }

  /** US-037: baja lógica. Preserva id, nombre y composición para la trazabilidad histórica. */
  deactivated(): Recipe {
    return new Recipe(this.id, this.name, this.category, this.ingredients, this.description, false);
  }
}

import { PrismaClient, Prisma } from '../../../generated/prisma/client.js';
import { Recipe } from '../../../domain/recipes/entities/Recipe.js';
import { RecipeIngredient } from '../../../domain/recipes/entities/RecipeIngredient.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { IRecipeRepository } from '../../../domain/recipes/repositories/IRecipeRepository.js';

type RecipeWithIngredients = Prisma.RecipeGetPayload<{ include: { ingredients: true } }>;

export class PrismaRecipeRepository implements IRecipeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // US-037: los métodos de lectura devuelven solo recetas activas.
  public async findById(id: string): Promise<Recipe | null> {
    const raw = await this.prisma.recipe.findFirst({
      where: { id, isActive: true },
      include: { ingredients: true },
    });
    return raw ? this.toDomain(raw) : null;
  }

  public async findAll(): Promise<Recipe[]> {
    const list = await this.prisma.recipe.findMany({ where: { isActive: true }, include: { ingredients: true } });
    return list.map((raw) => this.toDomain(raw));
  }

  public async findByInsumoIds(insumoIds: string[]): Promise<Recipe[]> {
    if (insumoIds.length === 0) {
      return [];
    }
    const list = await this.prisma.recipe.findMany({
      where: { isActive: true, ingredients: { some: { insumoId: { in: insumoIds } } } },
      include: { ingredients: true },
    });
    return list.map((raw) => this.toDomain(raw));
  }

  public async save(recipe: Recipe): Promise<void> {
    const ingredientCreate = recipe.ingredients.map((ingredient) => ({
      id: ingredient.id,
      insumoId: ingredient.insumoId,
      quantity: ingredient.quantity.toDecimal(),
    }));

    await this.prisma.recipe.upsert({
      where: { id: recipe.id },
      update: {
        name: recipe.name,
        category: recipe.category,
        description: recipe.description,
        isActive: recipe.isActive,
        // AUDIT-DEV-007 F-5: la rama update también reemplaza la composición
        // (antes solo tocaba name/category/description).
        ingredients: { deleteMany: {}, create: ingredientCreate },
      },
      create: {
        id: recipe.id,
        name: recipe.name,
        category: recipe.category,
        description: recipe.description,
        isActive: recipe.isActive,
        ingredients: { create: ingredientCreate },
      },
    });
  }

  private toDomain(raw: RecipeWithIngredients): Recipe {
    return new Recipe(
      raw.id,
      raw.name,
      raw.category,
      raw.ingredients.map(
        (ingredient) =>
          new RecipeIngredient(
            ingredient.id,
            ingredient.recipeId,
            ingredient.insumoId,
            new DecimalQuantity(ingredient.quantity.toString())
          )
      ),
      raw.description ?? undefined,
      raw.isActive
    );
  }
}

import { PrismaClient, Prisma } from '@prisma/client';
import { Recipe } from '../../../domain/catalog/entities/Recipe.js';
import { RecipeIngredient } from '../../../domain/catalog/entities/RecipeIngredient.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { IRecipeRepository } from '../../../domain/catalog/repositories/IRecipeRepository.js';

type RecipeWithIngredients = Prisma.RecipeGetPayload<{ include: { ingredients: true } }>;

export class PrismaRecipeRepository implements IRecipeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async findById(id: string): Promise<Recipe | null> {
    const raw = await this.prisma.recipe.findUnique({
      where: { id },
      include: { ingredients: true },
    });
    return raw ? this.toDomain(raw) : null;
  }

  public async findAll(): Promise<Recipe[]> {
    const list = await this.prisma.recipe.findMany({ include: { ingredients: true } });
    return list.map((raw) => this.toDomain(raw));
  }

  public async save(recipe: Recipe): Promise<void> {
    await this.prisma.recipe.upsert({
      where: { id: recipe.id },
      update: {
        name: recipe.name,
        category: recipe.category,
        description: recipe.description,
      },
      create: {
        id: recipe.id,
        name: recipe.name,
        category: recipe.category,
        description: recipe.description,
        ingredients: {
          create: recipe.ingredients.map((ingredient) => ({
            id: ingredient.id,
            insumoId: ingredient.insumoId,
            quantity: ingredient.quantity.toDecimal(),
          })),
        },
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
      raw.description ?? undefined
    );
  }
}

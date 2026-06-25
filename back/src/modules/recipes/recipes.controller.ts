import { Body, Controller, Get, HttpCode, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CookRecipeDto } from "./dto/cook-recipe.dto";
import { RecipesService } from "./recipes.service";

interface RequestWithUser {
  user: {
    id: string;
    email: string;
  };
}

@Controller("recipes")
@UseGuards(JwtAuthGuard)
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  getSuggestions(
    @Request() req: RequestWithUser,
    @Query("limit") limit = 10,
  ) {
    return this.recipesService
      .getSuggestedRecipes(req.user.id, Number(limit))
      .then((recipes) => ({ recipes }));
  }

  @Get(":mealId")
  getDetail(@Request() req: RequestWithUser, @Param("mealId") mealId: string) {
    return this.recipesService.getRecipeDetail(req.user.id, mealId);
  }

  @Post(":mealId/cook")
  @HttpCode(201)
  cookRecipe(
    @Request() req: RequestWithUser,
    @Param("mealId") _mealId: string,
    @Body() dto: CookRecipeDto,
  ) {
    return this.recipesService.cookRecipe(req.user.id, dto.pantryItemIds);
  }
}

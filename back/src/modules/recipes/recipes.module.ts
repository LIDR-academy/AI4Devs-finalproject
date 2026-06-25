import { Module } from "@nestjs/common";
import { ThemealdbModule } from "../../integrations/themealdb/themealdb.module";
import { PantryModule } from "../pantry/pantry.module";
import { RecipesController } from "./recipes.controller";
import { RecipesService } from "./recipes.service";

@Module({
  imports: [PantryModule, ThemealdbModule],
  controllers: [RecipesController],
  providers: [RecipesService],
})
export class RecipesModule {}

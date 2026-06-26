import { Module } from "@nestjs/common";
import { GamificationModule } from "../gamification/gamification.module";
import { UsersModule } from "../users/users.module";
import { PantryController } from "./pantry.controller";
import { PantryService } from "./pantry.service";
import { PantryUseNextController } from "./pantry-use-next.controller";

@Module({
	imports: [UsersModule, GamificationModule],
	controllers: [PantryController, PantryUseNextController],
	providers: [PantryService],
	exports: [PantryService],
})
export class PantryModule {}

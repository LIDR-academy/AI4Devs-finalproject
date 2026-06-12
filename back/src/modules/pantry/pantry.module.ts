import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { PantryController } from "./pantry.controller";
import { PantryService } from "./pantry.service";

@Module({
	imports: [UsersModule],
	controllers: [PantryController],
	providers: [PantryService],
})
export class PantryModule {}

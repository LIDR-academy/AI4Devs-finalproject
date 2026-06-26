import { Module } from "@nestjs/common";
import { GamificationModule } from "../gamification/gamification.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { UsersModule } from "../users/users.module";
import { AutoExpiryCronService } from "./auto-expiry-cron.service";
import { PantryController } from "./pantry.controller";
import { PantryService } from "./pantry.service";
import { PantryUseNextController } from "./pantry-use-next.controller";

@Module({
	imports: [UsersModule, GamificationModule, NotificationsModule],
	controllers: [PantryController, PantryUseNextController],
	providers: [PantryService, AutoExpiryCronService],
	exports: [PantryService],
})
export class PantryModule {}

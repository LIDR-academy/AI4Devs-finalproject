import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

@Module({
	imports: [UsersModule],
	controllers: [DashboardController],
	providers: [DashboardService],
})
export class DashboardModule {}

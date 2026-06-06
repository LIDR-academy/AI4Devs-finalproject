import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { DatabaseModule } from "./database/database.module";
import { ExpirationModule } from "./modules/expiration/expiration.module";
import { HealthModule } from "./health/health.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { PantryModule } from "./modules/pantry/pantry.module";
import { ReceiptsModule } from "./modules/receipts/receipts.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    PantryModule,
    ReceiptsModule,
    ExpirationModule,
    NotificationsModule,
    DashboardModule,
  ],
})
export class AppModule {}

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MetricsModule } from "./common/metrics/metrics.module";
import { AuthModule } from "./modules/auth/auth.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { DatabaseModule } from "./database/database.module";
import { ExpirationModule } from "./modules/expiration/expiration.module";
import { HealthModule } from "./health/health.module";
import { HouseholdsModule } from "./modules/households/households.module";
import { InsightsModule } from "./modules/insights/insights.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { PantryModule } from "./modules/pantry/pantry.module";
import { ReceiptsModule } from "./modules/receipts/receipts.module";
import { RecipesModule } from "./modules/recipes/recipes.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    MetricsModule,
    HealthModule,
    AuthModule,
    UsersModule,
    HouseholdsModule,
    PantryModule,
    ReceiptsModule,
    ExpirationModule,
    InsightsModule,
    NotificationsModule,
    DashboardModule,
    RecipesModule,
  ],
})
export class AppModule {}

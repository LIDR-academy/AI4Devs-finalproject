import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { SentryExceptionFilter } from "./common/filters/sentry-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { LoggerModule } from "./common/logger/logger.module";
import { MetricsModule } from "./common/metrics/metrics.module";
import { AuthModule } from "./modules/auth/auth.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { DatabaseModule } from "./database/database.module";
import { ExpirationModule } from "./modules/expiration/expiration.module";
import { GamificationModule } from "./modules/gamification/gamification.module";
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
    LoggerModule,
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
    GamificationModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: SentryExceptionFilter },
  ],
})
export class AppModule {}

import { Module } from "@nestjs/common";
import { InsightsController } from "./insights.controller";
import { InsightsService } from "./insights.service";
import { UsersModule } from "../users/users.module";
import { MercadonaModule } from "../../integrations/mercadona/mercadona.module";

@Module({
  imports: [UsersModule, MercadonaModule],
  controllers: [InsightsController],
  providers: [InsightsService],
})
export class InsightsModule {}

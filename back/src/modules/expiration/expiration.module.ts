import { Module } from "@nestjs/common";
import { ExpirationController } from "./expiration.controller";
import { ExpirationRulesService } from "./expiration-rules.service";
import { ExpirationService } from "./expiration.service";

@Module({
	controllers: [ExpirationController],
	providers: [ExpirationService, ExpirationRulesService],
})
export class ExpirationModule {}

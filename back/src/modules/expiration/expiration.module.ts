import { Module } from "@nestjs/common";
import { ExpirationController, ExpirationPreferencesController } from "./expiration.controller";
import { ExpirationPreferenceRepository } from "./expiration-preference.repository";
import { ExpirationRulesService } from "./expiration-rules.service";
import { ExpirationService } from "./expiration.service";

@Module({
	controllers: [ExpirationController, ExpirationPreferencesController],
	providers: [ExpirationService, ExpirationRulesService, ExpirationPreferenceRepository],
	exports: [ExpirationRulesService],
})
export class ExpirationModule {}

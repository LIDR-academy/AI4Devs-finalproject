import { Module } from '@nestjs/common';
import { BusinessModule } from '../business/business.module';
import { BusinessProfileController } from './business-profile.controller';
import { BusinessProfileService } from './business-profile.service';

@Module({
  imports: [BusinessModule],
  controllers: [BusinessProfileController],
  providers: [BusinessProfileService],
  exports: [BusinessProfileService],
})
export class BusinessProfileModule {}

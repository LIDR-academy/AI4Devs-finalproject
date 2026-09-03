import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BusinessModule } from './business/business.module';
import { DiscoveryModule } from './discovery/discovery.module';
import { BusinessProfileModule } from './business-profile/business-profile.module';
import { AiGenerationModule } from './ai-generation/ai-generation.module';
import { AssetsModule } from './assets/assets.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    BusinessModule,
    DiscoveryModule,
    BusinessProfileModule,
    AiGenerationModule,
    AssetsModule,
  ],
})
export class AppModule {}

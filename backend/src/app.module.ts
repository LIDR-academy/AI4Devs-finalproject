import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CuratedModule } from './modules/curated/curated.module';
import { UserModule } from './modules/user/user.module';
import { AggregatorModule } from './modules/aggregator/aggregator.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CuratedModule,
    UserModule,
    AggregatorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

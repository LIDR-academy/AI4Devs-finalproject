import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { MockModule } from './mock/mock.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.resolve(process.cwd(), '../../.env'),
        '.env',
      ],
    }),
    PrismaModule,
    QueueModule,
    MockModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

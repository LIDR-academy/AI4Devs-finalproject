import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MockModule } from '../mock/mock.module';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [PrismaModule, MockModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}

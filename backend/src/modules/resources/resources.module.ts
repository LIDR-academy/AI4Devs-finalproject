import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipment } from './entities/equipment.entity';
import { StaffAssignment } from './entities/staff-assignment.entity';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { PlanningModule } from '../planning/planning.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Equipment, StaffAssignment]),
    NotificationsModule,
    PlanningModule,
  ],
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule {}

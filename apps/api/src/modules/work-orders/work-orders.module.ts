import { Module } from '@nestjs/common';
import { WorkOrderTasksController } from './work-order-tasks.controller';
import { WorkOrderTasksService } from './work-order-tasks.service';
import { WorkOrderTechnicalNotesController } from './work-order-technical-notes.controller';
import { WorkOrderTechnicalNotesService } from './work-order-technical-notes.service';
import { WorkOrdersController } from './work-orders.controller';
import { WorkOrdersService } from './work-orders.service';

@Module({
  controllers: [
    WorkOrdersController,
    WorkOrderTasksController,
    WorkOrderTechnicalNotesController,
  ],
  providers: [
    WorkOrdersService,
    WorkOrderTasksService,
    WorkOrderTechnicalNotesService,
  ],
  exports: [
    WorkOrdersService,
    WorkOrderTasksService,
    WorkOrderTechnicalNotesService,
  ],
})
export class WorkOrdersModule {}

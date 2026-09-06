import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  TaskTechnicalNotesResponseDto,
  VisitNotesResponseDto,
} from './dto/task-technical-notes-response.dto';
import { UpdateTaskTechnicalNotesDto } from './dto/update-task-technical-notes.dto';
import { UpdateVisitNotesDto } from './dto/update-visit-notes.dto';
import { WorkOrderTechnicalNotesService } from './work-order-technical-notes.service';

@Controller('work-orders/:workOrderId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MECHANIC)
export class WorkOrderTechnicalNotesController {
  constructor(
    private readonly technicalNotesService: WorkOrderTechnicalNotesService,
  ) {}

  @Patch('tasks/:taskId/technical-notes')
  updateTaskNotes(
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: UpdateTaskTechnicalNotesDto,
  ): Promise<TaskTechnicalNotesResponseDto> {
    return this.technicalNotesService.updateTaskTechnicalNotes(
      workOrderId,
      taskId,
      dto,
    );
  }

  @Patch('visit-notes')
  updateVisitNotes(
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
    @Body() dto: UpdateVisitNotesDto,
  ): Promise<VisitNotesResponseDto> {
    return this.technicalNotesService.updateVisitNotes(workOrderId, dto);
  }
}

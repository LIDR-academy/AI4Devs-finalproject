import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskResponseDto } from './dto/update-task-response.dto';
import { WorkOrderTaskResponseDto } from './dto/work-order-detail-response.dto';
import { WorkOrderTasksService } from './work-order-tasks.service';

@Controller('work-orders/:workOrderId/tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MECHANIC)
export class WorkOrderTasksController {
  constructor(private readonly workOrderTasksService: WorkOrderTasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  addTask(
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
    @Body() dto: CreateTaskDto,
  ): Promise<WorkOrderTaskResponseDto> {
    return this.workOrderTasksService.addTask(workOrderId, dto);
  }

  @Patch(':taskId')
  updateTask(
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<UpdateTaskResponseDto> {
    return this.workOrderTasksService.updateTask(workOrderId, taskId, dto);
  }
}

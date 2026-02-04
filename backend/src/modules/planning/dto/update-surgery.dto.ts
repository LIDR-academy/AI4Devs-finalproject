import { PartialType } from '@nestjs/swagger';
import { CreateSurgeryDto } from './create-surgery.dto';

export class UpdateSurgeryDto extends PartialType(CreateSurgeryDto) {}

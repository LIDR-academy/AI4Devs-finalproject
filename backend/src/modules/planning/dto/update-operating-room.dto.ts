import { PartialType } from '@nestjs/swagger';
import { CreateOperatingRoomDto } from './create-operating-room.dto';

export class UpdateOperatingRoomDto extends PartialType(CreateOperatingRoomDto) {}

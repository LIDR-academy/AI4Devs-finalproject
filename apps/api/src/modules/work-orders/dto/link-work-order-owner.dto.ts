import { IsUUID } from 'class-validator';

export class LinkWorkOrderOwnerDto {
  @IsUUID()
  clientId!: string;
}

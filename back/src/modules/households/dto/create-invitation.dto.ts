import { IsEmail } from "class-validator";

export class CreateInvitationDto {
  @IsEmail()
  inviteeEmail!: string;
}

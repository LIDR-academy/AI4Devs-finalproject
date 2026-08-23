import { MemberResponseDto } from '../../members/dtos/member-response.dto';

export class AuthResponseDto {
  token!: string;
  expiresAt!: Date;
  member!: MemberResponseDto;
}

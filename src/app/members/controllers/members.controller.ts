import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MembersService } from '../services/members.service';
import { UpdateMemberDto } from '../dtos/update-member.dto';
import { MemberResponseDto } from '../dtos/member-response.dto';
import { JwtGuard } from '@shared/security/guards/jwt.guard';

interface AuthRequest extends Request {
  user?: {
    sub: string;
    email: string;
  };
}

@Controller('members')
export class MembersController {
  constructor(private membersService: MembersService) {}

  @Get(':memberId')
  @UseGuards(JwtGuard)
  async getMember(@Param('memberId') memberId: string): Promise<MemberResponseDto> {
    return this.membersService.getMember(memberId);
  }

  @Put(':memberId')
  @UseGuards(JwtGuard)
  async updateMember(
    @Param('memberId') memberId: string,
    @Body() updateDto: UpdateMemberDto,
  ): Promise<MemberResponseDto> {
    return this.membersService.updateMember(memberId, updateDto);
  }
}

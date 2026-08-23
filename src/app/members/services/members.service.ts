import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '@domain/members/entities/member.entity';
import { UpdateMemberDto } from '../dtos/update-member.dto';
import { MemberResponseDto } from '../dtos/member-response.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  async getMember(memberId: string): Promise<MemberResponseDto> {
    const member = await this.memberRepository.findOne({
      where: { member_id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return this.mapToMemberResponse(member);
  }

  async updateMember(memberId: string, updateDto: UpdateMemberDto): Promise<MemberResponseDto> {
    const member = await this.memberRepository.findOne({
      where: { member_id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (updateDto.firstName) {
      member.first_name = updateDto.firstName;
    }
    if (updateDto.lastName) {
      member.last_name = updateDto.lastName;
    }
    if (updateDto.phone !== undefined) {
      member.phone = updateDto.phone;
    }
    if (updateDto.address !== undefined) {
      member.address = updateDto.address;
    }
    if (updateDto.city !== undefined) {
      member.city = updateDto.city;
    }
    if (updateDto.postalCode !== undefined) {
      member.postal_code = updateDto.postalCode;
    }

    const updatedMember = await this.memberRepository.save(member);
    return this.mapToMemberResponse(updatedMember);
  }

  private mapToMemberResponse(member: Member): MemberResponseDto {
    return {
      memberId: member.member_id,
      roleId: member.role_id,
      email: member.email,
      firstName: member.first_name,
      lastName: member.last_name,
      dni: member.dni,
      membershipNumber: member.membership_number,
      status: member.status,
      createdAt: member.created_at,
      updatedAt: member.updated_at,
    };
  }
}

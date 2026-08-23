import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '@domain/members/entities/member.entity';

@Injectable()
export class MemberDomainService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  async generateMembershipNumber(): Promise<string> {
    const count = await this.memberRepository.count();
    return `FRP-${1000 + count + 1}`;
  }

  async validateMemberEmail(email: string, excludeMemberId?: string): Promise<boolean> {
    const query = this.memberRepository.createQueryBuilder('member').where('member.email = :email', { email });

    if (excludeMemberId) {
      query.andWhere('member.member_id != :memberId', { memberId: excludeMemberId });
    }

    const existing = await query.getOne();
    return !existing;
  }

  async validateMemberDni(dni: string, excludeMemberId?: string): Promise<boolean> {
    if (!dni) return true;

    const query = this.memberRepository.createQueryBuilder('member').where('member.dni = :dni', { dni });

    if (excludeMemberId) {
      query.andWhere('member.member_id != :memberId', { memberId: excludeMemberId });
    }

    const existing = await query.getOne();
    return !existing;
  }

  async updateLastLogin(memberId: string): Promise<void> {
    await this.memberRepository.update(
      { member_id: memberId },
      { last_login_at: new Date() },
    );
  }
}

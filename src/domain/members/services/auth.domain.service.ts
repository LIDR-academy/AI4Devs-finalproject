import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Member } from '@domain/members/entities/member.entity';
import { Role } from '@domain/members/entities/role.entity';

@Injectable()
export class AuthDomainService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async validateMemberPassword(memberId: string, password: string): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { member_id: memberId },
    });

    if (!member) {
      throw new BadRequestException('Member not found');
    }

    const isPasswordValid = await bcrypt.compare(password, member.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    return member;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async getOrCreateSocioRole(): Promise<Role> {
    let role = await this.roleRepository.findOne({
      where: { role_name: 'SOCIO' },
    });

    if (!role) {
      role = this.roleRepository.create({
        role_name: 'SOCIO',
        permissions: {
          view_routes: true,
          propose_routes: true,
          register_routes: true,
          view_profile: true,
          update_profile: true,
        },
      });
      await this.roleRepository.save(role);
    }

    return role;
  }
}

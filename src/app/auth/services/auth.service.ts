import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Member } from '@domain/members/entities/member.entity';
import { AuthDomainService, MemberDomainService } from '@domain/members/services';
import { RegisterDto, LoginDto, AuthResponseDto } from '../dtos';
import { MemberResponseDto } from '../../members/dtos/member-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    private authDomainService: AuthDomainService,
    private memberDomainService: MemberDomainService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName, dni, phone, address, city, postalCode } = registerDto;

    const isEmailValid = await this.memberDomainService.validateMemberEmail(email);
    if (!isEmailValid) {
      throw new ConflictException('Email already exists');
    }

    if (dni) {
      const isDniValid = await this.memberDomainService.validateMemberDni(dni);
      if (!isDniValid) {
        throw new ConflictException('DNI already exists');
      }
    }

    const socioRole = await this.authDomainService.getOrCreateSocioRole();
    const passwordHash = await this.authDomainService.hashPassword(password);
    const membershipNumber = await this.memberDomainService.generateMembershipNumber();

    const member = this.memberRepository.create({
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      dni,
      phone,
      address,
      city,
      postal_code: postalCode,
      membership_number: membershipNumber,
      role_id: socioRole.role_id,
      status: 'ACTIVE',
    });

    const savedMember = await this.memberRepository.save(member);
    const token = this.generateToken(savedMember);

    return {
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      member: this.mapToMemberResponse(savedMember),
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const member = await this.memberRepository.findOne({
      where: { email },
    });

    if (!member) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (member.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    const isPasswordValid = await this.authDomainService.comparePassword(password, member.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.memberDomainService.updateLastLogin(member.member_id);

    const token = this.generateToken(member);

    return {
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      member: this.mapToMemberResponse(member),
    };
  }

  async changePassword(memberId: string, currentPassword: string, newPassword: string): Promise<void> {
    const member = await this.memberRepository.findOne({
      where: { member_id: memberId },
    });

    if (!member) {
      throw new BadRequestException('Member not found');
    }

    const isPasswordValid = await this.authDomainService.comparePassword(currentPassword, member.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await this.authDomainService.hashPassword(newPassword);
    await this.memberRepository.update(
      { member_id: memberId },
      { password_hash: passwordHash },
    );
  }

  private generateToken(member: Member): string {
    const payload = {
      sub: member.member_id,
      email: member.email,
      role: 'SOCIO',
    };
    return this.jwtService.sign(payload, { expiresIn: '24h' });
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

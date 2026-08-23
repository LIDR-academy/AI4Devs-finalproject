import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Member } from '@domain/members/entities/member.entity';
import { Role } from '@domain/members/entities/role.entity';
import { AuthDomainService, MemberDomainService } from '@domain/members/services';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from '@shared/security/strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, Role]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [AuthService, AuthDomainService, MemberDomainService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, AuthDomainService, MemberDomainService],
})
export class AuthModule {}

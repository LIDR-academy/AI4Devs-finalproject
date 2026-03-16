import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { envs } from '../../common/config';

// Models
import {
  UsuarioModel,
  PerfilModel,
  SesionModel,
  HorarioUsuarioModel,
  HistorialPasswordModel,
  AuditoriaAuthModel,
  ResetPasswordModel,
  AutorizacionTemporalModel,
  DiaSemanaModel,
} from './infrastructure/models';

// Repositories
import {
  AuthRepository,
  SessionRepository,
  ScheduleRepository,
  AuditRepository,
} from './infrastructure/repositories';

// Services
import {
  PasswordService,
  JwtTokenService,
  ScheduleService,
} from './infrastructure/services';

// Strategies
import {
  JwtAccessStrategy,
  JwtRefreshStrategy,
} from './infrastructure/strategies';

// Use Cases
import {
  LoginUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  LogoutAllUseCase,
  ChangePasswordUseCase,
  GetProfileUseCase,
  GetSessionsUseCase,
  RevokeSessionUseCase,
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
} from './application/usecases';

// Controllers
import { AuthController } from './interface/controllers/auth.controller';
import { AuthNatsController } from './interface/nats/auth.nats';
import { AuthLegacyNatsController } from './interface/nats/auth-legacy.nats';

// Ports
import {
  AUTH_REPOSITORY,
  SESSION_REPOSITORY,
  SCHEDULE_REPOSITORY,
  AUDIT_REPOSITORY,
} from './domain/ports';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsuarioModel,
      PerfilModel,
      SesionModel,
      HorarioUsuarioModel,
      HistorialPasswordModel,
      AuditoriaAuthModel,
      ResetPasswordModel,
      AutorizacionTemporalModel,
      DiaSemanaModel,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: envs.jwt.secret,
      signOptions: {
        expiresIn: envs.jwt.expiresIn,
      },
    }),
  ],
  controllers: [AuthController, AuthNatsController, AuthLegacyNatsController],
  providers: [
    // Use Cases
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    LogoutAllUseCase,
    ChangePasswordUseCase,
    GetProfileUseCase,
    GetSessionsUseCase,
    RevokeSessionUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,

    // Repositories (provide with interface token)
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthRepository,
    },
    {
      provide: SESSION_REPOSITORY,
      useClass: SessionRepository,
    },
    {
      provide: SCHEDULE_REPOSITORY,
      useClass: ScheduleRepository,
    },
    {
      provide: AUDIT_REPOSITORY,
      useClass: AuditRepository,
    },

    // Services
    PasswordService,
    JwtTokenService,
    ScheduleService,

    // Strategies
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],
  exports: [JwtTokenService, AUTH_REPOSITORY],
})
export class AuthModule {}


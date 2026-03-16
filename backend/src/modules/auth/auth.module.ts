import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { KeycloakService } from './services/keycloak.service';
import authConfig from '../../config/auth.config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = 
          configService.get<string>('auth.jwt.secret') || 
          configService.get<string>('JWT_SECRET') || 
          'change-this-secret-in-production-use-strong-secret-min-32-chars';
        
        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: configService.get<string>('auth.jwt.expiresIn') || 
                       configService.get<string>('JWT_EXPIRATION') || 
                       '15m',
          },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule.forFeature(authConfig),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, KeycloakService],
  exports: [AuthService, JwtModule, PassportModule, KeycloakService],
})
export class AuthModule {}

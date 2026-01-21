# HU1-BE-001: Endpoint de Registro de Paciente

## Información General
- **ID**: HU1-BE-001
- **Historia de Usuario**: HU1 - Registro de Paciente
- **Tipo**: Backend
- **Prioridad**: Alta
- **Estimación**: 10 horas (1.5 story points)
- **Dependencias**: HU1-DB-001 (Migración de tabla USERS), HU1-DB-002 (Migración de tabla audit_logs)

## Descripción
Implementar el endpoint POST `/api/v1/auth/register` que permite registrar un nuevo paciente en el sistema. El endpoint debe validar datos, verificar reCAPTCHA, aplicar rate limiting, crear el usuario en la base de datos, generar tokens JWT y registrar la acción en audit_logs.

## Criterios de Aceptación

### CA1: Validación de Datos
- [ ] Validar formato de email
- [ ] Validar contraseña (mínimo 8 caracteres)
- [ ] Validar firstName y lastName (no vacíos)
- [ ] Validar formato de teléfono si se proporciona (formato internacional E.164)
- [ ] Validar que role sea "patient"

### CA2: Protección Anti-bot
- [ ] Validar token de reCAPTCHA v3 en el backend
- [ ] Verificar score de reCAPTCHA (threshold configurable, por defecto 0.5)
- [ ] Si el score es menor al threshold, rechazar registro con error 400

### CA3: Validación de Email Único
- [ ] Verificar que el email no esté ya registrado en la tabla USERS
- [ ] Si el email existe, retornar error 409 con mensaje: "Email ya está registrado"

### CA4: Rate Limiting
- [ ] Limitar a 3 intentos de registro por IP cada hora
- [ ] Si se excede el límite, retornar error 429 con header `Retry-After`
- [ ] El mensaje debe indicar cuánto tiempo debe esperar el usuario

### CA5: Creación de Usuario
- [ ] Crear usuario en tabla USERS con:
  - email, firstName, lastName, phone (opcional)
  - role="patient"
  - password hasheada con bcrypt (salt rounds=12)
  - emailVerified=false por defecto
  - created_at timestamp
- [ ] Generar JWT access token (duración 15 minutos)
- [ ] Generar JWT refresh token (duración 7 días) almacenado en cookie httpOnly
- [ ] Retornar respuesta 201 con información del usuario y tokens

### CA6: Respuesta Exitosa
- [ ] La respuesta debe incluir:
  - Objeto `user` con: id, email, firstName, lastName, role, emailVerified
  - `accessToken` (string JWT)
  - `refreshToken` (string JWT, también en cookie)
- [ ] Código de estado HTTP 201 Created

### CA7: Auditoría
- [ ] Registrar en tabla `audit_logs`:
  - Acción: "register"
  - Entity_type: "user"
  - Entity_id: ID del usuario creado
  - IP_address: IP del usuario
  - Timestamp: Fecha/hora del registro

## Pasos Técnicos Detallados

### 1. Crear DTO de Registro
**Ubicación**: `backend/src/dto/auth/register.dto.ts`

```typescript
import { IsEmail, IsString, MinLength, IsOptional, Matches, IsIn } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsString()
  @MinLength(1, { message: 'El nombre es obligatorio' })
  firstName: string;

  @IsString()
  @MinLength(1, { message: 'El apellido es obligatorio' })
  lastName: string;

  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Formato de teléfono inválido' })
  phone?: string;

  @IsIn(['patient', 'doctor'], { message: 'Rol inválido' })
  role: 'patient' | 'doctor';

  @IsString()
  recaptchaToken: string;
}
```

### 2. Crear Servicio de Autenticación
**Ubicación**: `backend/src/services/auth.service.ts`

```typescript
import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto, ipAddress: string): Promise<AuthResponse> {
    // 1. Validar reCAPTCHA
    const recaptchaValid = await this.validateRecaptcha(registerDto.recaptchaToken);
    if (!recaptchaValid) {
      throw new BadRequestException('reCAPTCHA inválido');
    }

    // 2. Verificar email único
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email ya está registrado');
    }

    // 3. Hash de contraseña
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // 4. Crear usuario
    const user = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      phone: registerDto.phone,
      role: registerDto.role,
      emailVerified: false,
    });

    const savedUser = await this.userRepository.save(user);

    // 5. Generar tokens JWT
    const accessToken = this.generateAccessToken(savedUser);
    const refreshToken = this.generateRefreshToken(savedUser);

    // 6. Registrar en audit_logs
    await this.auditLogRepository.save({
      action: 'register',
      entityType: 'user',
      entityId: savedUser.id,
      ipAddress: ipAddress,
      userId: savedUser.id,
    });

    // 7. Retornar respuesta
    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
        emailVerified: savedUser.emailVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  private async validateRecaptcha(token: string): Promise<boolean> {
    try {
      const response = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        null,
        {
          params: {
            secret: process.env.RECAPTCHA_SECRET_KEY,
            response: token,
          },
        },
      );

      const { success, score } = response.data;
      const threshold = parseFloat(process.env.RECAPTCHA_THRESHOLD || '0.5');

      return success && score >= threshold;
    } catch (error) {
      console.error('Error validando reCAPTCHA:', error);
      return false;
    }
  }

  private generateAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_ACCESS_SECRET,
    });
  }

  private generateRefreshToken(user: User): string {
    const payload = {
      sub: user.id,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });
  }
}
```

### 3. Crear Controlador de Autenticación
**Ubicación**: `backend/src/controllers/auth.controller.ts`

```typescript
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Ip,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/auth/register.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 intentos por hora
  async register(
    @Body() registerDto: RegisterDto,
    @Ip() ipAddress: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(registerDto, ipAddress);

    // Configurar cookie httpOnly para refreshToken
    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    return {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }
}
```

### 4. Configurar Rate Limiting
**Ubicación**: `backend/src/app.module.ts`

```typescript
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60, // tiempo en segundos
      limit: 100, // límite por IP
    }),
    // ... otros módulos
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

### 5. Crear Entidad User
**Ubicación**: `backend/src/entities/user.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('USERS')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'enum', enum: ['patient', 'doctor', 'admin'] })
  role: string;

  @Column({ default: false })
  emailVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 6. Crear Entidad AuditLog
**Ubicación**: `backend/src/entities/audit-log.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string;

  @Column()
  entityType: string;

  @Column()
  entityId: string;

  @Column({ nullable: true })
  userId?: string;

  @Column()
  ipAddress: string;

  @CreateDateColumn()
  timestamp: Date;
}
```

### 7. Configurar Variables de Entorno
**Ubicación**: `backend/.env`

```env
# JWT
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# reCAPTCHA
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
RECAPTCHA_THRESHOLD=0.5

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=citaya
DB_PASSWORD=your-password
DB_DATABASE=citaya_db
```

### 8. Manejo de Errores Personalizados
**Ubicación**: `backend/src/filters/http-exception.filter.ts`

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        code = (exceptionResponse as any).code || code;
      } else {
        message = exceptionResponse as string;
      }
    }

    response.status(status).json({
      error: message,
      code,
      timestamp: new Date().toISOString(),
    });
  }
}
```

## Archivos a Crear/Modificar

1. `backend/src/dto/auth/register.dto.ts` - DTO de registro
2. `backend/src/services/auth.service.ts` - Servicio de autenticación
3. `backend/src/controllers/auth.controller.ts` - Controlador de autenticación
4. `backend/src/entities/user.entity.ts` - Entidad User
5. `backend/src/entities/audit-log.entity.ts` - Entidad AuditLog
6. `backend/src/filters/http-exception.filter.ts` - Filtro de excepciones
7. `backend/src/app.module.ts` - Configurar rate limiting y módulos
8. `backend/.env` - Variables de entorno

## Dependencias de Paquetes

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/throttler": "^5.0.0",
    "typeorm": "^0.3.17",
    "bcrypt": "^5.1.1",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "axios": "^1.6.0"
  }
}
```

## Testing

Ver ticket HU1-TEST-001 para detalles de testing.

## Notas Adicionales

- El refreshToken se envía tanto en el body como en cookie httpOnly para compatibilidad
- El rate limiting se aplica por IP usando @nestjs/throttler
- La validación de reCAPTCHA debe hacerse antes de cualquier operación de base de datos
- Los tokens JWT deben incluir información mínima necesaria (no datos sensibles)
- Considerar implementar blacklist de tokens para logout (Redis)

## Referencias

- [Documentación de NestJS](https://docs.nestjs.com/)
- [Documentación de TypeORM](https://typeorm.io/)
- [Documentación de bcrypt](https://www.npmjs.com/package/bcrypt)
- [Documentación de reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3)

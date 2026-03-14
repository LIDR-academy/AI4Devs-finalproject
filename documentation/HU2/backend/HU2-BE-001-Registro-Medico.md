# HU2-BE-001: Endpoint de Registro de Médico

## Información General
- **ID**: HU2-BE-001
- **Historia de Usuario**: HU2 - Registro de Médico
- **Tipo**: Backend
- **Prioridad**: Alta
- **Estimación**: 12 horas (2 story points)
- **Dependencias**: HU2-DB-001 (Migración tabla DOCTORS), HU1-DB-001 (Tabla USERS)

## Descripción
Implementar el endpoint POST `/api/v1/auth/register` extendido para médicos que crea usuario en USERS y perfil en DOCTORS, realiza geocodificación de dirección, y establece estado de verificación como 'pending'.

## Criterios de Aceptación

### CA1: Validación de Datos
- [ ] Validar todos los campos del formulario médico
- [ ] Validar dirección y código postal obligatorios
- [ ] Validar bio máximo 1000 caracteres

### CA2: Geocodificación
- [ ] Llamar a Google Maps Geocoding API con dirección y código postal
- [ ] Almacenar coordenadas (latitude, longitude) en tabla DOCTORS
- [ ] Si falla geocodificación, permitir registro pero mostrar advertencia

### CA3: Creación de Usuario y Perfil
- [ ] Crear usuario en USERS con role="doctor"
- [ ] Crear registro en DOCTORS con:
  - verification_status='pending'
  - Dirección y código postal
  - Coordenadas geográficas (si geocodificación exitosa)
  - Bio (si se proporcionó)

### CA4: Respuesta Exitosa
- [ ] Retornar información del usuario y médico
- [ ] Indicar estado de verificación pendiente

## Pasos Técnicos Detallados

### 1. Extender DTO de Registro
**Ubicación**: `backend/src/dto/auth/register.dto.ts`

```typescript
export class RegisterDoctorDto extends RegisterDto {
  @IsString()
  @MinLength(1)
  address: string;

  @IsString()
  @MinLength(1)
  postalCode: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
```

### 2. Servicio de Geocodificación
**Ubicación**: `backend/src/services/geocoding.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GeocodingService {
  async geocodeAddress(address: string, postalCode: string): Promise<{
    latitude: number;
    longitude: number;
  } | null> {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
          params: {
            address: `${address}, ${postalCode}`,
            key: process.env.GOOGLE_MAPS_API_KEY,
          },
        },
      );

      if (response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      }

      return null;
    } catch (error) {
      console.error('Error en geocodificación:', error);
      return null;
    }
  }
}
```

### 3. Extender Servicio de Autenticación
**Ubicación**: `backend/src/services/auth.service.ts`

```typescript
async registerDoctor(
  registerDto: RegisterDoctorDto,
  ipAddress: string,
): Promise<AuthResponse> {
  // Validar reCAPTCHA y email único (igual que register)
  
  // Geocodificar dirección
  const coordinates = await this.geocodingService.geocodeAddress(
    registerDto.address,
    registerDto.postalCode,
  );

  // Crear usuario
  const user = await this.createUser(registerDto);
  
  // Crear perfil médico
  const doctor = await this.doctorRepository.save({
    userId: user.id,
    address: registerDto.address,
    postalCode: registerDto.postalCode,
    latitude: coordinates?.latitude,
    longitude: coordinates?.longitude,
    bio: registerDto.bio,
    verificationStatus: 'pending',
  });

  // Generar tokens y registrar auditoría
  // ...
}
```

## Archivos a Crear/Modificar

1. `backend/src/dto/auth/register-doctor.dto.ts` - DTO extendido
2. `backend/src/services/geocoding.service.ts` - Servicio de geocodificación
3. `backend/src/services/auth.service.ts` - Método registerDoctor
4. `backend/src/entities/doctor.entity.ts` - Entidad Doctor

## Testing

Ver ticket HU2-TEST-001.

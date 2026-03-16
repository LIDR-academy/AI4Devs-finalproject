import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';
import {
  SCHEDULE_REPOSITORY,
  IScheduleRepository,
} from '../../domain/ports/schedule-repository.port';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import { HorarioUsuarioEntity } from '../../domain/entities/horario-usuario.entity';
import { ScheduleCheckResult } from '../../domain/value-objects/schedule-check-result.vo';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let mockScheduleRepository: jest.Mocked<IScheduleRepository>;

  const crearUsuarioMock = (tipo: 'EMPLEADO' | 'EXTERNO' | 'SISTEMA' = 'EMPLEADO'): UsuarioEntity => {
    return new UsuarioEntity(
      1,
      '550e8400-e29b-41d4-a716-446655440000',
      'jperez',
      'Juan Pérez',
      'jperez@ejemplo.com',
      '$2b$12$hashedpassword',
      1,
      1,
      1,
      null,
      tipo,
      false,
      false,
      new Date(),
      false,
      false,
      0,
      null,
      null,
      null,
      null,
      null,
      false,
      null,
      true,
      false,
      null,
    );
  };

  beforeEach(async () => {
    mockScheduleRepository = {
      findUserSchedule: jest.fn(),
      findTemporaryAuth: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        {
          provide: SCHEDULE_REPOSITORY,
          useValue: mockScheduleRepository,
        },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
  });

  describe('canUserAccessNow', () => {
    it('debe permitir acceso a usuarios SISTEMA sin verificar horario', async () => {
      const usuario = crearUsuarioMock('SISTEMA');

      const result = await service.canUserAccessNow(usuario);

      expect(result.allowed).toBe(true);
      expect(mockScheduleRepository.findUserSchedule).not.toHaveBeenCalled();
    });

    it('debe denegar acceso si no hay horario definido', async () => {
      const usuario = crearUsuarioMock('EMPLEADO');
      mockScheduleRepository.findUserSchedule.mockResolvedValue(null);

      const result = await service.canUserAccessNow(usuario);

      expect(result.allowed).toBe(false);
      expect(result.message).toContain('No tiene horario definido');
    });

    it('debe permitir acceso dentro del horario', async () => {
      const usuario = crearUsuarioMock('EMPLEADO');
      const horario = new HorarioUsuarioEntity(
        1,
        1,
        1, // Lunes
        '08:00',
        '17:00',
        true,
      );

      // Mockear fecha/hora actual (Lunes 10:00)
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T10:00:00Z')); // Lunes

      mockScheduleRepository.findUserSchedule.mockResolvedValue(horario);

      const result = await service.canUserAccessNow(usuario);

      expect(result.allowed).toBe(true);

      jest.useRealTimers();
    });

    it('debe denegar acceso fuera del horario', async () => {
      const usuario = crearUsuarioMock('EMPLEADO');
      const horario = new HorarioUsuarioEntity(
        1,
        1,
        1, // Lunes
        '08:00',
        '17:00',
        true,
      );

      // Mockear fecha/hora actual (Lunes 20:00 - fuera de horario)
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T20:00:00Z')); // Lunes

      mockScheduleRepository.findUserSchedule.mockResolvedValue(horario);
      mockScheduleRepository.findTemporaryAuth.mockResolvedValue(false);

      const result = await service.canUserAccessNow(usuario);

      expect(result.allowed).toBe(false);
      expect(result.message).toContain('Acceso no permitido fuera del horario');
      expect(result.horaInicio).toBe('08:00');
      expect(result.horaFin).toBe('17:00');

      jest.useRealTimers();
    });

    it('debe permitir acceso con autorización temporal', async () => {
      const usuario = crearUsuarioMock('EMPLEADO');
      const horario = new HorarioUsuarioEntity(
        1,
        1,
        1, // Lunes
        '08:00',
        '17:00',
        true,
      );

      // Mockear fecha/hora actual (Lunes 20:00 - fuera de horario)
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T20:00:00Z')); // Lunes

      mockScheduleRepository.findUserSchedule.mockResolvedValue(horario);
      mockScheduleRepository.findTemporaryAuth.mockResolvedValue(true);

      const result = await service.canUserAccessNow(usuario);

      expect(result.allowed).toBe(true);
      expect(result.isTemporaryAuth).toBe(true);
      expect(result.message).toContain('autorizado temporalmente');

      jest.useRealTimers();
    });
  });
});


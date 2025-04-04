import { Test, TestingModule } from '@nestjs/testing';
import { ReporteController } from '../../../../src/modules/report/controllers/reporte.controller';
import { ReporteService } from '../../../../src/modules/report/services/reporte.service';
import { ReportePerdida } from '../../../../src/modules/report/entities/reporte-perdida.entity';
import { EstadoReporte } from '../../../../src/modules/report/enums/estado-reporte.enum';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('ReporteController', () => {
  let controller: ReporteController;
  let service: ReporteService;

  const mockReporteService = {
    crear: jest.fn() as any,
    findAll: jest.fn() as any,
    findOne: jest.fn() as any,
    findByUserEmail: jest.fn() as any,
    actualizar: jest.fn() as any,
    eliminar: jest.fn() as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReporteController],
      providers: [
        {
          provide: ReporteService,
          useValue: mockReporteService,
        },
      ],
    }).compile();

    controller = module.get<ReporteController>(ReporteController);
    service = module.get<ReporteService>(ReporteService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('crear', () => {
    it('should create a report', async () => {
      const mockReporte = new ReportePerdida();
      mockReporte.id = '123';
      mockReporte.estado = EstadoReporte.ABIERTO;
      mockReporte.encontrada = false;

      const mockFiles = {
        imagenes: [
          {
            fieldname: 'imagenes',
            originalname: 'test.jpg',
            encoding: '7bit',
            mimetype: 'image/jpeg',
            buffer: Buffer.from('test'),
            size: 1024,
          },
        ],
      };

      const mockBody = {
        mascota: JSON.stringify({ id: '456', nombre: 'Firulais' }),
        ubicacion: 'Parque Central',
        descripcion: 'Se perdió en el parque',
      };

      mockReporteService.crear.mockResolvedValue(mockReporte);

      const result = await controller.crear(mockBody, mockFiles);

      expect(result).toEqual({ id: '123' });
      expect(mockReporteService.crear).toHaveBeenCalled();
    });
  });

  describe('listarTodos', () => {
    it('should return an array of reports', async () => {
      const mockReportes = [
        {
          id: '123',
          estado: EstadoReporte.ABIERTO,
          encontrada: false,
        },
        {
          id: '456',
          estado: EstadoReporte.CERRADO,
          encontrada: true,
        },
      ];

      mockReporteService.findAll.mockResolvedValue(mockReportes);

      const result = await controller.listarTodos();

      expect(result).toEqual(mockReportes);
      expect(mockReporteService.findAll).toHaveBeenCalled();
    });
  });

  describe('obtenerPorId', () => {
    it('should return a report by id', async () => {
      const mockReporte = {
        id: '123',
        estado: EstadoReporte.ABIERTO,
        encontrada: false,
      };

      mockReporteService.findOne.mockResolvedValue(mockReporte);

      const result = await controller.obtenerPorId('123');

      expect(result).toEqual(mockReporte);
      expect(mockReporteService.findOne).toHaveBeenCalledWith('123');
    });

    it('should return reports by user email', async () => {
      const mockReportes = [
        {
          id: '123',
          estado: EstadoReporte.ABIERTO,
          encontrada: false,
        },
      ];

      mockReporteService.findByUserEmail.mockResolvedValue(mockReportes);

      const result = await controller.obtenerPorId('usuario@example.com');

      expect(result).toEqual(mockReportes);
      expect(mockReporteService.findByUserEmail).toHaveBeenCalledWith('usuario@example.com');
    });
  });

  describe('actualizar', () => {
    it('should update a report', async () => {
      const mockReporte = {
        id: '123',
        estado: EstadoReporte.CERRADO,
        encontrada: true,
      };

      const updateDto = {
        estado: EstadoReporte.CERRADO,
        encontrada: true,
      };

      mockReporteService.actualizar.mockResolvedValue(mockReporte);

      const result = await controller.actualizar('123', updateDto);

      expect(result).toEqual(mockReporte);
      expect(mockReporteService.actualizar).toHaveBeenCalledWith('123', updateDto);
    });
  });

  describe('eliminar', () => {
    it('should delete a report', async () => {
      mockReporteService.eliminar.mockResolvedValue(undefined);

      await controller.eliminar('123');

      expect(mockReporteService.eliminar).toHaveBeenCalledWith('123');
    });
  });
}); 
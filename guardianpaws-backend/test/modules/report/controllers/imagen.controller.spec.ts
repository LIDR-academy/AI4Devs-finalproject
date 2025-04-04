import { Test, TestingModule } from '@nestjs/testing';
import { ImagenController } from '../../../../src/modules/report/controllers/imagen.controller';
import { ImagenService } from '../../../../src/modules/image/services/imagen.service';
import { BadRequestException } from '@nestjs/common';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('ImagenController', () => {
  let controller: ImagenController;
  let service: ImagenService;

  // Usar any para evitar problemas de tipo en los mocks
  const mockImagenService = {
    subirImagen: jest.fn() as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagenController],
      providers: [
        {
          provide: ImagenService,
          useValue: mockImagenService,
        },
      ],
    }).compile();

    controller = module.get<ImagenController>(ImagenController);
    service = module.get<ImagenService>(ImagenService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('subirImagen', () => {
    it('should upload an image successfully', async () => {
      const mockFile = {
        fieldname: 'imagen',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 1024,
      };

      const mockResult = {
        url: 'https://example.com/image.jpg',
        key: 'image-123.jpg',
      };

      mockImagenService.subirImagen.mockResolvedValue(mockResult);

      const result = await controller.subirImagen('123', mockFile);

      expect(result).toEqual({ url: mockResult });
      expect(mockImagenService.subirImagen).toHaveBeenCalledWith(mockFile, '123');
    });

    it('should throw BadRequestException when no file is provided', async () => {
      await expect(controller.subirImagen('123', null)).rejects.toThrow(BadRequestException);
      expect(mockImagenService.subirImagen).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when file is not an image', async () => {
      const mockFile = {
        fieldname: 'imagen',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: Buffer.from('test'),
        size: 1024,
      };

      await expect(controller.subirImagen('123', mockFile)).rejects.toThrow(BadRequestException);
      expect(mockImagenService.subirImagen).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when file size exceeds 5MB', async () => {
      const mockFile = {
        fieldname: 'imagen',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 6 * 1024 * 1024, // 6MB
      };

      await expect(controller.subirImagen('123', mockFile)).rejects.toThrow(BadRequestException);
      expect(mockImagenService.subirImagen).not.toHaveBeenCalled();
    });
  });
}); 
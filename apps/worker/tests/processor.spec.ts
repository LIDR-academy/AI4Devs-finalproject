import { LayerProcessor } from '../src/processors/layer.processor';
import { Job } from 'bullmq';
import { LayerStatus } from '@trace/core';

// Mocks
jest.mock('@/infrastructure/database/prisma', () => ({
  __esModule: true,
  default: {
    layer: {
      update: jest.fn(),
    },
  },
}));
import prisma from '@/infrastructure/database/prisma';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  promises: {
      readFile: jest.fn()
  }
}));
import fs from 'fs';

jest.mock('sharp', () => {
  return jest.fn().mockImplementation(() => ({
    metadata: jest.fn().mockResolvedValue({ width: 100, height: 100, format: 'png' }),
  }));
});

describe('LayerProcessor', () => {
  let processor: LayerProcessor;

  beforeEach(() => {
    processor = new LayerProcessor();
    jest.clearAllMocks();
  });

  it('should process a layer successfully', async () => {
    const job = {
      data: {
        layerId: 'layer-123',
        fileUrl: '/path/to/file.png',
        originalFilename: 'file.png'
      }
    } as unknown as Job;

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (prisma.layer.update as jest.Mock).mockResolvedValue({});

    await processor.process(job);

    // Verify status updates
    expect(prisma.layer.update).toHaveBeenCalledWith({
      where: { id: 'layer-123' },
      data: { status: LayerStatus.PROCESSING },
    });

    expect(prisma.layer.update).toHaveBeenCalledWith({
      where: { id: 'layer-123' },
      data: { status: LayerStatus.READY },
    });
  });

  it('should handle file not found', async () => {
    const job = {
        data: {
          layerId: 'layer-123',
          fileUrl: '/path/to/missing.png',
        }
      } as unknown as Job;
  
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (prisma.layer.update as jest.Mock).mockResolvedValue({});
  
      await expect(processor.process(job)).rejects.toThrow('File not found');
      
      expect(prisma.layer.update).toHaveBeenCalledWith({
        where: { id: 'layer-123' },
        data: { status: LayerStatus.ERROR },
      });
  });
});

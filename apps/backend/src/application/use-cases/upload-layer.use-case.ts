import { ILayerRepository } from '@/domain/layers/layer.repository';
import { IFileStorage } from '@/domain/layers/file-storage.interface';
import { IJobQueue } from '@/domain/layers/job-queue.interface';
import { UploadLayerDto } from '@/domain/dtos/upload-layer.dto';
import { Layer, LayerType } from '@trace/core';

export class UploadLayerUseCase {
  constructor(
    private layerStorage: IFileStorage,
    private layerRepository: ILayerRepository,
    private jobQueue: IJobQueue
  ) {}

  async execute(dto: UploadLayerDto): Promise<Layer> {
    // 1. Upload file (Strategy pattern: Local or S3)
    const fileUrl = await this.layerStorage.upload(dto.file, `plans/${dto.planId}`);

    // 2. Create Layer Entity (Status: PROCESSING)
    const layerType = dto.type === 'BASE' ? LayerType.BASE : LayerType.OVERLAY;
    const layer = Layer.create(dto.planId, dto.name, layerType, fileUrl);

    // 3. Save metadata to DB
    const savedLayer = await this.layerRepository.save(layer);

    // 4. Dispatch Job to Worker
    await this.jobQueue.add('layer-processing', {
      userId: dto.userId,
      layerId: savedLayer.id,
      fileUrl: fileUrl,
      originalFilename: dto.file.originalname,
      pageNumber: dto.pageNumber
    });

    return savedLayer;
  }
}

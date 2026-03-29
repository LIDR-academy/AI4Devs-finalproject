import { Layer } from '@trace/core';

export interface ILayerRepository {
  save(layer: Layer): Promise<Layer>;
  findById(id: string): Promise<Layer | null>;
}

import { LayerStatus, LayerType } from './layer-types.enum';

export class Layer {
  constructor(
    public readonly id: string,
    public readonly planId: string,
    public readonly name: string,
    public readonly imageUrl: string,
    public readonly type: LayerType,
    public readonly status: LayerStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(planId: string, name: string, type: LayerType, initialUrl: string): Layer {
    return new Layer(
      '',
      planId,
      name,
      initialUrl,
      type,
      LayerStatus.PROCESSING,
      new Date(),
      new Date()
    );
  }
}

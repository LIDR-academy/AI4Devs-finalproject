import { PlanStatus } from './plan-status.enum';
import { Layer } from '../layers/layer.entity';

export class Plan {
  public layers: Layer[] = [];

  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly sheetName: string,
    public readonly version: number,
    public readonly status: PlanStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(projectId: string, sheetName: string, version: number): Plan {
    return new Plan(
      '', 
      projectId,
      sheetName,
      version,
      PlanStatus.DRAFT,
      new Date(),
      new Date()
    );
  }
}

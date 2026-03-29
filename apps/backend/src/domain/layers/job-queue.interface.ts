import { LayerProcessingJob } from '@trace/core';

export { LayerProcessingJob };

export interface IJobQueue {
  add(jobName: string, data: LayerProcessingJob): Promise<void>;
}

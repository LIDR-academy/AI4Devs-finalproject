export interface UploadLayerDto {
  planId: string;
  name: string;
  type: 'BASE' | 'OVERLAY'; // Or LayerType enum
  file: Express.Multer.File;
  pageNumber?: number;
  userId: string;
}

// Abstract interface for file storage (S3 vs Local)
export interface IFileStorage {
  upload(file: Express.Multer.File, keyPrefix: string): Promise<string>;
}

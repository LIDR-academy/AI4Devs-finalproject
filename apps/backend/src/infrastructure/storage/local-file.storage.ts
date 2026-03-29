import { IFileStorage } from '@/domain/layers/file-storage.interface';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

export class LocalFileStorage implements IFileStorage {
  private uploadDir = path.resolve(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File, keyPrefix: string): Promise<string> {
    const timestamp = Date.now();
    // Sanitize keyPrefix to handle subdirectories
    const safeKeyPrefix = keyPrefix.replace(/^\/+|\/+$/g, ''); 
    const filename = `${file.originalname}`;
    
    // Construct full path including subdirectories from keyPrefix
    const fullDir = path.join(this.uploadDir, safeKeyPrefix);
    const filePath = path.join(fullDir, `${timestamp}-${filename}`);

    // Ensure directory exists
    if (!fs.existsSync(fullDir)) {
      await mkdir(fullDir, { recursive: true });
    }

    // Write buffer to file
    await writeFile(filePath, file.buffer);

    // Return absolute path for the worker (Local strategy)
    return filePath;
  }
}

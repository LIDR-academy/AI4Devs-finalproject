export enum DocumentStatus {
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface DocumentMetadata {
  title?: string;
  author?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  pages: number;
}

export class Document {
  constructor(
    public readonly id: string,
    public readonly filename: string,
    public readonly originalName: string,
    public readonly mimeType: string,
    public readonly size: number,
    public readonly uploadPath: string,
    public status: DocumentStatus,
    public readonly userId?: string,
    public readonly metadata?: DocumentMetadata,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {
    this.validateDocument();
  }

  private validateDocument(): void {
    if (!this.filename || this.filename.trim().length === 0) {
      throw new Error('Document filename cannot be empty');
    }

    if (!this.originalName || this.originalName.trim().length === 0) {
      throw new Error('Document original name cannot be empty');
    }

    if (this.mimeType !== 'application/pdf') {
      throw new Error('Only PDF files are supported');
    }

    if (this.size <= 0) {
      throw new Error('Document size must be greater than 0');
    }

    if (this.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('Document size cannot exceed 10MB');
    }

    if (!this.uploadPath || this.uploadPath.trim().length === 0) {
      throw new Error('Document upload path cannot be empty');
    }
  }

  public updateStatus(newStatus: DocumentStatus): void {
    this.status = newStatus;
  }

  public isProcessingComplete(): boolean {
    return this.status === DocumentStatus.COMPLETED;
  }

  public hasFailed(): boolean {
    return this.status === DocumentStatus.FAILED;
  }

  public isProcessing(): boolean {
    return this.status === DocumentStatus.PROCESSING || this.status === DocumentStatus.UPLOADING;
  }

  public toJSON() {
    return {
      id: this.id,
      filename: this.filename,
      originalName: this.originalName,
      mimeType: this.mimeType,
      size: this.size,
      uploadPath: this.uploadPath,
      status: this.status,
      userId: this.userId,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
} 
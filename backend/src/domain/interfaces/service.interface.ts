export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  embedding?: number[];
  chunks?: ServiceChunk[];
}

export interface ServiceChunk {
  id: string;
  content: string;
  embedding: number[];
  serviceId: string;
  createdAt: Date;
  updatedAt: Date;
} 
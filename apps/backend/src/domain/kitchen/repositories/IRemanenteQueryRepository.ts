export interface ActiveRemanenteDTO {
  id: string;
  insumoId: string;
  insumoName: string;
  unitOfMeasure: string;
  currentQuantity: string;
  initialQuantity: string;
  location: string;
  expirationDate: Date;
  status: string;
  createdAt: Date;
  hoursRemaining?: number;
  isCriticalAlert?: boolean;
}

export interface IRemanenteQueryRepository {
  findActiveRemanentes(location?: string, insumoId?: string): Promise<ActiveRemanenteDTO[]>;
}

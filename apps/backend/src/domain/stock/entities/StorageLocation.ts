export type LocationType = 'WAREHOUSE' | 'KITCHEN';

export interface StorageLocationProps {
  id: string;
  name: string;
  type: LocationType;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
}

export class StorageLocation {
  constructor(private readonly props: StorageLocationProps) {}

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get type(): LocationType {
    return this.props.type;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }
}

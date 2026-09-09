import { Permission } from './Permission.js';

export interface RoleProps {
  id: string;
  name: string;
  description?: string;
  permissions?: Permission[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Role {
  constructor(private readonly props: RoleProps) {}

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get permissions(): Permission[] {
    return this.props.permissions || [];
  }

  public hasPermission(code: string): boolean {
    return this.permissions.some((p) => p.code === code);
  }
}

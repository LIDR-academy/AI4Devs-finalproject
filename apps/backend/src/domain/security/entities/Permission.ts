export interface PermissionProps {
  id: string;
  code: string;
  name: string;
  module: string;
  description?: string;
}

export class Permission {
  constructor(private readonly props: PermissionProps) {}

  get id(): string {
    return this.props.id;
  }

  get code(): string {
    return this.props.code;
  }

  get name(): string {
    return this.props.name;
  }

  get module(): string {
    return this.props.module;
  }

  get description(): string | undefined {
    return this.props.description;
  }
}

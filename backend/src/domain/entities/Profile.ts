export interface ProfileData {
  id: string;
  username: string;
  companyName: string;
  logoUrl?: string;
  description: string;
  phoneNumber: string;
  website?: string;
  email: string;
  openingTime: string;
  address: string;
  sector: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileDTO {
  id: string;
  username: string;
  companyName: string;
  logoUrl?: string;
  description: string;
  phoneNumber: string;
  website?: string;
  email: string;
  openingTime: string;
  address: string;
  sector: string;
  createdAt: string;
  updatedAt: string;
}

export class Profile {
  private constructor(private data: ProfileData) {}

  static create(data: Omit<ProfileData, 'id' | 'createdAt' | 'updatedAt'>): Profile {
    const now = new Date();
    return new Profile({
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(data: ProfileData): Profile {
    return new Profile(data);
  }

  // Getters
  get id(): string {
    return this.data.id;
  }

  get username(): string {
    return this.data.username;
  }

  get companyName(): string {
    return this.data.companyName;
  }

  get logoUrl(): string | undefined {
    return this.data.logoUrl;
  }

  get description(): string {
    return this.data.description;
  }

  get phoneNumber(): string {
    return this.data.phoneNumber;
  }

  get website(): string | undefined {
    return this.data.website;
  }

  get email(): string {
    return this.data.email;
  }

  get openingTime(): string {
    return this.data.openingTime;
  }

  get address(): string {
    return this.data.address;
  }

  get sector(): string {
    return this.data.sector;
  }

  get createdAt(): Date {
    return this.data.createdAt;
  }

  get updatedAt(): Date {
    return this.data.updatedAt;
  }

  // Business methods
  updateProfile(updates: Partial<Omit<ProfileData, 'id' | 'username' | 'createdAt' | 'updatedAt'>>): void {
    this.data = {
      ...this.data,
      ...updates,
      updatedAt: new Date(),
    };
  }

  toDTO(): ProfileDTO {
    return {
      id: this.data.id,
      username: this.data.username,
      companyName: this.data.companyName,
      logoUrl: this.data.logoUrl,
      description: this.data.description,
      phoneNumber: this.data.phoneNumber,
      website: this.data.website,
      email: this.data.email,
      openingTime: this.data.openingTime,
      address: this.data.address,
      sector: this.data.sector,
      createdAt: this.data.createdAt.toISOString(),
      updatedAt: this.data.updatedAt.toISOString(),
    };
  }

  toPersistence(): ProfileData {
    return { ...this.data };
  }
} 
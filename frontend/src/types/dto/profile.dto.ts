export interface Profile {
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

export interface CreateProfileDto {
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
}

export interface UpdateProfileDto {
  companyName?: string;
  logoUrl?: string;
  description?: string;
  phoneNumber?: string;
  website?: string;
  email?: string;
  openingTime?: string;
  address?: string;
  sector?: string;
} 
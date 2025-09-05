import { Request } from 'express';

// Tipos de usuario
export interface IUser {
  id_user: string;
  email: string;
  password_hash: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
  profile_picture?: string;
  bio?: string;
  preferences?: any;
  notification_settings?: any;
  verification_status: VerificationStatus;
  last_login?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateUser {
  email: string;
  password: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IRequestPasswordReset {
  email: string;
}

export interface IResetPassword {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface IUserResponse {
  id_user: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
  profile_picture?: string;
  bio?: string;
  verification_status: VerificationStatus;
  last_login?: Date;
  created_at: Date;
}

export enum UserRole {
  USER = 'user',
  AGENT = 'agent',
  ADMIN = 'admin'
}

export enum VerificationStatus {
  PENDING = 'pending',
  EMAIL_VERIFIED = 'email_verified',
  PHONE_VERIFIED = 'phone_verified',
  ID_VERIFIED = 'id_verified',
  VERIFIED = 'verified'
}

// Tipos de propiedad
export interface IProperty {
  id_property: string;
  user_id: string;
  title: string;
  description?: string;
  property_type: PropertyType;
  operation_type: OperationType;
  price: number;
  currency: string;
  price_per_sqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  total_bathrooms?: number;
  sq_meters?: number;
  sq_meters_land?: number;
  floors?: number;
  floor_number?: number;
  parking_spaces?: number;
  year_built?: number;
  condition?: PropertyCondition;
  address: string;
  neighborhood?: string;
  city: string;
  state: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  location_accuracy?: string;
  amenities?: any;
  status: PropertyStatus;
  featured: boolean;
  views_count: number;
  contact_count: number;
  last_updated: Date;
  created_at: Date;
  updated_at: Date;
}

export interface IPropertyImage {
  id_property_image: string;
  property_id: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  order_index: number;
  cloudinary_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ICreateProperty {
  title: string;
  description?: string;
  property_type: PropertyType;
  operation_type: OperationType;
  price: number;
  currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  sq_meters?: number;
  address: string;
  city: string;
  state: string;
  amenities?: string[];
  images?: IPropertyImage[];
}

export interface IUpdateProperty {
  title?: string;
  description?: string;
  property_type?: PropertyType;
  operation_type?: OperationType;
  price?: number;
  currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  sq_meters?: number;
  address?: string;
  city?: string;
  state?: string;
  amenities?: string[];
  status?: PropertyStatus;
  featured?: boolean;
  images?: IPropertyImage[];
}

export enum PropertyType {
  HOUSE = 'house',
  APARTMENT = 'apartment',
  OFFICE = 'office',
  LAND = 'land',
  COMMERCIAL = 'commercial'
}

export enum OperationType {
  SALE = 'sale',
  RENT = 'rent',
  TRANSFER = 'transfer'
}

export enum PropertyCondition {
  NEW = 'new',
  USED = 'used',
  CONSTRUCTION = 'construction'
}

export enum PropertyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SOLD = 'sold',
  RENTED = 'rented'
}

// Tipos de autenticación
export interface IJWTPayload {
  user_id: number;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface IAuthResponse {
  user: IUserResponse;
  token: string;
  refresh_token?: string;
}

// Tipos de respuesta de API
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface IPaginationQuery {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

// Tipos de filtros de búsqueda
export interface IPropertyFilters extends IPaginationQuery {
  property_type?: PropertyType;
  operation_type?: OperationType;
  price_min?: number;
  price_max?: number;
  bedrooms_min?: number;
  bathrooms_min?: number;
  sq_meters_min?: number;
  sq_meters_max?: number;
  city?: string;
  state?: string;
  amenities?: string[];
  featured?: boolean;
}

// Tipos de middleware
export interface IRequestWithUser extends Omit<Request, 'user'> {
  user?: IUserResponse;
}

// Tipos de validación
export interface IValidationError {
  field: string;
  message: string;
  value?: any;
}

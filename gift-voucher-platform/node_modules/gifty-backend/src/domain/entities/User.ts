/**
 * User entity representing a user in the system
 */
export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User roles in the system
 */
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  MERCHANT = 'store_manager'
}

/**
 * User creation data transfer object
 */
export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

/**
 * User update data transfer object
 */
export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

/**
 * User authentication data transfer object
 */
export interface UserAuthDto {
  email: string;
  password: string;
} 
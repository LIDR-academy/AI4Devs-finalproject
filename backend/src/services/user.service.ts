import { comparePasswords, hashPassword } from '../utils/auth';
import logger from '../utils/logger';

interface User {
  id: string;
  email: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory user store for development
const users: User[] = [
  {
    id: '1',
    email: 'test@example.com',
    // This is the hashed version of 'ShopMefy2024' 
          password: '$2b$10$iHb5iNkMOm/0ruKp7uXRUuI4wYPzIz28Oe033XZsspEBbiKBDWYnu',
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

interface CreateUserData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

class UserService {
  /**
   * Create a new user with hashed password
   */
  async createUser(userData: CreateUserData): Promise<Omit<User, 'password'>> {
    // Check if email already exists
    const existingUser = users.find(user => user.email === userData.email);

    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user
    const newUser = {
      id: (users.length + 1).toString(),
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      isActive: true,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.push(newUser);

    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  /**
   * Login a user and generate JWT token
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Find user by email
      const user = users.find(user => user.email === email);

      if (!user) {
        logger.warn(`Login attempt with non-existent email: ${email}`);
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        logger.warn(`Login attempt for inactive account: ${email}`);
        throw new Error('Account is inactive');
      }

      // Verify password
      const passwordMatches = await comparePasswords(password, user.password);
      
      // Log for debugging
      // logger.info(`Password verification result for ${email}: ${passwordMatches}`);
      
      if (!passwordMatches) {
        logger.warn(`Failed login attempt for ${email}: incorrect password`);
        throw new Error('Invalid email or password');
      }

      // Update last login timestamp
      user.lastLogin = new Date();
      user.updatedAt = new Date();

      // Generate a simple token for demo
      const token = 'demo-token-' + Date.now();
      // logger.info(`Successful login for ${email}`);

      // Return user info and token
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch (error) {
      logger.error(`Login error: ${error}`);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    const user = users.find(user => user.id === id);

    if (!user) {
      return null;
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  // For testing purposes only
  _getUsers() {
    return [...users];
  }
}

export default new UserService(); 
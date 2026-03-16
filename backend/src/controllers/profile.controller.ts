import { Request, Response } from 'express';
import { z } from 'zod';
import { ProfileService } from '../application/services/ProfileService';
import logger from '../utils/logger';

// Validation schemas
const createProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  logoUrl: z.string().url('Logo URL must be a valid URL').optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
  website: z.string().url('Website must be a valid URL').optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  email: z.string().email('Email must be a valid email address'),
  openingTime: z.string().min(5, 'Opening time must be at least 5 characters'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  sector: z.string().min(2, 'Sector must be at least 2 characters'),
});

const updateProfileSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').optional(),
  logoUrl: z.string().url('Logo URL must be a valid URL').optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters').optional(),
  website: z.string().url('Website must be a valid URL').optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  email: z.string().email('Email must be a valid email address').optional(),
  openingTime: z.string().min(5, 'Opening time must be at least 5 characters').optional(),
  address: z.string().min(10, 'Address must be at least 10 characters').optional(),
  sector: z.string().min(2, 'Sector must be at least 2 characters').optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export class ProfileController {
  constructor(private profileService: ProfileService) {}

  /**
   * Get the company profile
   */
  async getProfile(req: Request, res: Response) {
    try {
      const profile = await this.profileService.getProfile();
      
      return res.status(200).json(profile.toDTO());
    } catch (error) {
      logger.error('Get profile error:', error);
      
      if (error instanceof Error && error.message === 'Profile not found') {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      return res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  /**
   * Get profile by ID
   */
  async getProfileById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const profile = await this.profileService.getProfileById(id);
      
      return res.status(200).json(profile.toDTO());
    } catch (error) {
      logger.error('Get profile by ID error:', error);
      
      if (error instanceof Error && error.message === 'Profile not found') {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      return res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  /**
   * Create a new profile
   */
  async createProfile(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = createProfileSchema.parse(req.body);
      
      // Create profile using application service
      const profile = await this.profileService.createProfile(validatedData);
      
      return res.status(201).json({
        message: 'Profile created successfully',
        profile: profile.toDTO(),
      });
    } catch (error) {
      logger.error('Create profile error:', error);
      
      // Handle validation errors
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }
      
      // Handle service errors
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }

  /**
   * Update profile
   */
  async updateProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Validate request body
      const validatedData = updateProfileSchema.parse(req.body);
      
      // Update profile using application service
      const profile = await this.profileService.updateProfile(id, validatedData);
      
      return res.status(200).json({
        message: 'Profile updated successfully',
        profile: profile.toDTO(),
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      
      // Handle validation errors
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }
      
      // Handle not found error
      if (error instanceof Error && error.message === 'Profile not found') {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      // Handle other errors
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }

  /**
   * Delete profile
   */
  async deleteProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const result = await this.profileService.deleteProfile(id);
      
      return res.status(200).json(result);
    } catch (error) {
      logger.error('Delete profile error:', error);
      
      // Handle not found error
      if (error instanceof Error && error.message === 'Profile not found') {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      return res.status(500).json({ error: 'Failed to delete profile' });
    }
  }
} 
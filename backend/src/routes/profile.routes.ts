import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authenticate } from '../middlewares/auth.middleware';
import profileService from '../services/profile.service';

const router = Router();
const profileController = new ProfileController(profileService);

// Get company profile
router.get('/', authenticate, (req, res) => profileController.getProfile(req, res));

// Get profile by ID
router.get('/:id', authenticate, (req, res) => profileController.getProfileById(req, res));

// Create new profile
router.post('/', authenticate, (req, res) => profileController.createProfile(req, res));

// Update profile
router.put('/:id', authenticate, (req, res) => profileController.updateProfile(req, res));

// Delete profile
router.delete('/:id', authenticate, (req, res) => profileController.deleteProfile(req, res));

export default router; 
import { PrismaClient } from '@prisma/client';
import { ProfileService } from '../application/services/ProfileService';
import { PrismaProfileRepository } from '../infrastructure/repositories/PrismaProfileRepository';

const prisma = new PrismaClient();
const profileRepository = new PrismaProfileRepository(prisma);
const profileService = new ProfileService(profileRepository);

export default profileService; 
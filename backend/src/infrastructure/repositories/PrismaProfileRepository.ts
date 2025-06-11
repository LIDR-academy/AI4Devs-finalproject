import { PrismaClient } from '@prisma/client';
import { Profile, ProfileData } from '../../domain/entities/Profile';
import { ProfileRepository } from '../../domain/repositories/ProfileRepository';

export class PrismaProfileRepository implements ProfileRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Profile | null> {
    const profileData = await this.prisma.profile.findUnique({
      where: { id },
    });

    if (!profileData) {
      return null;
    }

    return Profile.fromPersistence(profileData as ProfileData);
  }

  async findByUsername(username: string): Promise<Profile | null> {
    const profileData = await this.prisma.profile.findUnique({
      where: { username },
    });

    if (!profileData) {
      return null;
    }

    return Profile.fromPersistence(profileData as ProfileData);
  }

  async findFirst(): Promise<Profile | null> {
    const profileData = await this.prisma.profile.findFirst();

    if (!profileData) {
      return null;
    }

    return Profile.fromPersistence(profileData as ProfileData);
  }

  async save(profile: Profile): Promise<Profile> {
    const data = profile.toPersistence();
    
    const savedProfile = await this.prisma.profile.create({
      data,
    });

    return Profile.fromPersistence(savedProfile as ProfileData);
  }

  async update(id: string, profile: Profile): Promise<Profile> {
    const data = profile.toPersistence();
    
    const updatedProfile = await this.prisma.profile.update({
      where: { id },
      data,
    });

    return Profile.fromPersistence(updatedProfile as ProfileData);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.profile.delete({
      where: { id },
    });
  }
} 
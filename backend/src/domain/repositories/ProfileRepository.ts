import { Profile } from '../entities/Profile';

export interface ProfileRepository {
  findById(id: string): Promise<Profile | null>;
  findByUsername(username: string): Promise<Profile | null>;
  findFirst(): Promise<Profile | null>;
  save(profile: Profile): Promise<Profile>;
  update(id: string, profile: Profile): Promise<Profile>;
  delete(id: string): Promise<void>;
} 
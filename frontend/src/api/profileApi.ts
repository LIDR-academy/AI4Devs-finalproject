import axios from 'axios';
import { CreateProfileDto, Profile, UpdateProfileDto } from '../types/profile';

const API_URL = import.meta.env.VITE_API_URL || '';
const PROFILE_ENDPOINT = API_URL ? `${API_URL}/api/profile` : '/api/profile';

// Get authentication token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const profileApi = {
  // Get the company profile
  async getProfile() {
    const response = await axios.get(PROFILE_ENDPOINT, getAuthHeader());
    return response.data as Profile;
  },
  
  // Get a profile by ID
  async getProfileById(id: string) {
    const response = await axios.get(`${PROFILE_ENDPOINT}/${id}`, getAuthHeader());
    return response.data as Profile;
  },
  
  // Create a new profile
  async createProfile(profile: CreateProfileDto) {
    const response = await axios.post(PROFILE_ENDPOINT, profile, getAuthHeader());
    return response.data;
  },
  
  // Update an existing profile
  async updateProfile(id: string, profile: UpdateProfileDto) {
    const response = await axios.put(`${PROFILE_ENDPOINT}/${id}`, profile, getAuthHeader());
    return response.data;
  },
  
  // Delete a profile
  async deleteProfile(id: string) {
    const response = await axios.delete(`${PROFILE_ENDPOINT}/${id}`, getAuthHeader());
    return response.data;
  },
}; 
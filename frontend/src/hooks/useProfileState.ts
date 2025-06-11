import { useCallback, useReducer } from 'react';
import { toast } from 'sonner';
import { profileApi } from '../api/profileApi';
import { Profile, UpdateProfileDto } from '../types/profile';
import { useApiCall } from './useApiCall';

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

type ProfileAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: Profile }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; payload: Profile }
  | { type: 'SAVE_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

const initialState: ProfileState = {
  profile: null,
  loading: true,
  saving: false,
  error: null,
};

const profileReducer = (state: ProfileState, action: ProfileAction): ProfileState => {
  switch (action.type) {
    case 'LOAD_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    
    case 'LOAD_SUCCESS':
      return {
        ...state,
        loading: false,
        profile: action.payload,
        error: null,
      };
    
    case 'LOAD_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    
    case 'SAVE_START':
      return {
        ...state,
        saving: true,
        error: null,
      };
    
    case 'SAVE_SUCCESS':
      return {
        ...state,
        saving: false,
        profile: action.payload,
        error: null,
      };
    
    case 'SAVE_ERROR':
      return {
        ...state,
        saving: false,
        error: action.payload,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

interface UseProfileStateReturn {
  state: ProfileState;
  loadProfile: () => Promise<void>;
  updateProfile: (id: string, data: UpdateProfileDto) => Promise<void>;
  clearError: () => void;
}

export const useProfileState = (): UseProfileStateReturn => {
  const [state, dispatch] = useReducer(profileReducer, initialState);

  // API call for loading profile with retry logic
  const {
    execute: executeLoadProfile
  } = useApiCall(profileApi.getProfile, {
    retries: 1,
    onSuccess: (profileData) => {
      dispatch({ type: 'LOAD_SUCCESS', payload: profileData });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load profile';
      dispatch({ type: 'LOAD_ERROR', payload: errorMessage });
      console.error('Error loading profile:', error);
    }
  });

  // API call for updating profile with retry logic
  const {
    execute: executeUpdateProfile
  } = useApiCall(profileApi.updateProfile, {
    retries: 1,
    onSuccess: (response) => {
      dispatch({ type: 'SAVE_SUCCESS', payload: response.profile });
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update profile';
      dispatch({ type: 'SAVE_ERROR', payload: errorMessage });
      console.error('Error updating profile:', error);
    }
  });

  const loadProfile = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });
    
    try {
      await executeLoadProfile();
    } catch (error) {
      // Error handling is done in the useApiCall hook
      console.error('Failed to load profile:', error);
    }
  }, []);

  const updateProfile = useCallback(async (id: string, data: UpdateProfileDto) => {
    dispatch({ type: 'SAVE_START' });
    
    try {
      await executeUpdateProfile(id, data);
    } catch (error: any) {
      // Error handling is done in the useApiCall hook
      console.error('Error updating profile:', error);
      throw error; // Re-throw to allow component to handle it
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return {
    state,
    loadProfile,
    updateProfile,
    clearError,
  };
}; 
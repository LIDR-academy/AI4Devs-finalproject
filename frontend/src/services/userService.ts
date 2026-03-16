import { apiFetch } from '../utils/api';

export const saveUser = async (userData: any) => {
  return await apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};


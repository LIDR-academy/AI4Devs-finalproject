import axios from 'axios';
import i18n from '../i18n/config';

/**
 * Sets up axios interceptors to automatically add Accept-Language header
 * based on the current i18n language
 */
export const setupAxiosInterceptors = () => {
  // Request interceptor to add Accept-Language header
  axios.interceptors.request.use(
    (config) => {
      // Get current language from i18n
      const currentLanguage = i18n.language || 'ca';
      
      // Add Accept-Language header
      config.headers.set('Accept-Language', currentLanguage);
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling (optional)
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // You can add language-specific error handling here if needed
      return Promise.reject(error);
    }
  );
};

/**
 * Gets the current language from i18n
 * @returns {string} Current language code
 */
export const getCurrentLanguage = (): string => {
  return i18n.language || 'ca';
};

/**
 * Updates axios default headers with current language
 * Useful for manual header updates
 */
export const updateAxiosLanguageHeader = () => {
  const currentLanguage = getCurrentLanguage();
  axios.defaults.headers.common['Accept-Language'] = currentLanguage;
};



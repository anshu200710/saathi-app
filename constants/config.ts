export const apiConfig = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export const storageKeys = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  BUSINESS: 'business',
  PREFERENCES: 'preferences',
};

export const appConfig = {
  APP_NAME: 'Vyaapar',
  APP_VERSION: '1.0.0',
  DEBUG: __DEV__,
};

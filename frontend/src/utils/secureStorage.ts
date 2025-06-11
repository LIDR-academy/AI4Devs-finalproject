// Secure storage utility to replace localStorage for sensitive data
interface StorageItem {
  value: any;
  expiry?: number;
  encrypted?: boolean;
}

class SecureStorage {
  private readonly prefix = 'shopmefy_';
  private readonly encryptionKey: string;

  constructor() {
    // Generate or retrieve encryption key
    this.encryptionKey = this.getOrCreateEncryptionKey();
  }

  private getOrCreateEncryptionKey(): string {
    const keyName = `${this.prefix}encryption_key`;
    let key = localStorage.getItem(keyName);
    
    if (!key) {
      // Generate a simple key (in production, use proper crypto)
      key = btoa(Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15));
      localStorage.setItem(keyName, key);
    }
    
    return key;
  }

  private encrypt(data: string): string {
    // Simple XOR encryption (in production, use proper encryption)
    const key = this.encryptionKey;
    let encrypted = '';
    
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    
    return btoa(encrypted);
  }

  private decrypt(encryptedData: string): string {
    try {
      const data = atob(encryptedData);
      const key = this.encryptionKey;
      let decrypted = '';
      
      for (let i = 0; i < data.length; i++) {
        decrypted += String.fromCharCode(
          data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }

  setItem(key: string, value: any, options: {
    encrypt?: boolean;
    expiryMinutes?: number;
  } = {}): void {
    const { encrypt = false, expiryMinutes } = options;
    
    const item: StorageItem = {
      value: encrypt ? this.encrypt(JSON.stringify(value)) : value,
      encrypted: encrypt,
    };

    if (expiryMinutes) {
      item.expiry = Date.now() + (expiryMinutes * 60 * 1000);
    }

    try {
      localStorage.setItem(
        `${this.prefix}${key}`,
        JSON.stringify(item)
      );
    } catch (error) {
      console.error('Failed to store item:', error);
    }
  }

  getItem<T = any>(key: string): T | null {
    try {
      const stored = localStorage.getItem(`${this.prefix}${key}`);
      if (!stored) return null;

      const item: StorageItem = JSON.parse(stored);

      // Check expiry
      if (item.expiry && Date.now() > item.expiry) {
        this.removeItem(key);
        return null;
      }

      // Decrypt if needed
      if (item.encrypted) {
        const decrypted = this.decrypt(item.value);
        return decrypted ? JSON.parse(decrypted) : null;
      }

      return item.value;
    } catch (error) {
      console.error('Failed to retrieve item:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(`${this.prefix}${key}`);
  }

  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  // Token-specific methods
  setToken(token: string, expiryMinutes: number = 60): void {
    this.setItem('auth_token', token, {
      encrypt: true,
      expiryMinutes,
    });
  }

  getToken(): string | null {
    return this.getItem<string>('auth_token');
  }

  removeToken(): void {
    this.removeItem('auth_token');
  }

  setRefreshToken(token: string, expiryMinutes: number = 10080): void { // 7 days
    this.setItem('refresh_token', token, {
      encrypt: true,
      expiryMinutes,
    });
  }

  getRefreshToken(): string | null {
    return this.getItem<string>('refresh_token');
  }

  removeRefreshToken(): void {
    this.removeItem('refresh_token');
  }

  // User data methods
  setUser(user: any): void {
    this.setItem('user_data', user, {
      encrypt: true,
      expiryMinutes: 60,
    });
  }

  getUser<T = any>(): T | null {
    return this.getItem<T>('user_data');
  }

  removeUser(): void {
    this.removeItem('user_data');
  }

  // Session management
  isTokenValid(): boolean {
    const token = this.getToken();
    return token !== null;
  }

  clearSession(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.removeUser();
  }

  // Cache methods for API responses
  setCacheItem<T>(key: string, data: T, ttlMinutes: number = 5): void {
    this.setItem(`cache_${key}`, data, {
      expiryMinutes: ttlMinutes,
    });
  }

  getCacheItem<T>(key: string): T | null {
    return this.getItem<T>(`cache_${key}`);
  }

  clearCache(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(`${this.prefix}cache_`)) {
        localStorage.removeItem(key);
      }
    });
  }
}

// Export singleton instance
export const secureStorage = new SecureStorage();

// Utility functions for easy migration from localStorage
export const storage = {
  // Secure methods (recommended)
  setSecure: (key: string, value: any, expiryMinutes?: number) => 
    secureStorage.setItem(key, value, { encrypt: true, expiryMinutes }),
  
  getSecure: <T = any>(key: string): T | null => 
    secureStorage.getItem<T>(key),
  
  // Token management
  setToken: (token: string, expiryMinutes?: number) => 
    secureStorage.setToken(token, expiryMinutes),
  
  getToken: () => secureStorage.getToken(),
  
  removeToken: () => secureStorage.removeToken(),
  
  // User management
  setUser: (user: any) => secureStorage.setUser(user),
  
  getUser: <T = any>(): T | null => secureStorage.getUser<T>(),
  
  removeUser: () => secureStorage.removeUser(),
  
  // Session management
  isAuthenticated: () => secureStorage.isTokenValid(),
  
  logout: () => secureStorage.clearSession(),
  
  // Cache management
  setCache: <T>(key: string, data: T, ttlMinutes?: number) => 
    secureStorage.setCacheItem(key, data, ttlMinutes),
  
  getCache: <T = any>(key: string): T | null => 
    secureStorage.getCacheItem<T>(key),
  
  clearCache: () => secureStorage.clearCache(),
}; 
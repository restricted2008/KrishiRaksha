import Cookies from 'js-cookie';
import { encrypt, decrypt, encryptWithExpiry, decryptWithExpiry } from './encryption';
import { sanitizeObject } from './sanitize';

/**
 * Secure storage options
 */
interface SecureStorageOptions {
  encrypt?: boolean;
  sanitize?: boolean;
  expiresInDays?: number;
  useHttpOnly?: boolean; // For cookies
  secure?: boolean; // For cookies (HTTPS only)
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Default storage options
 */
const DEFAULT_OPTIONS: SecureStorageOptions = {
  encrypt: true,
  sanitize: true,
  expiresInDays: 7,
  useHttpOnly: false, // Can't be set from JavaScript
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
  sameSite: 'strict',
};

/**
 * Secure localStorage wrapper with encryption and sanitization
 */
export class SecureStorage {
  private prefix: string;

  constructor(prefix: string = 'kr_') {
    this.prefix = prefix;
  }

  /**
   * Stores data securely in localStorage
   * 
   * @param key - Storage key
   * @param value - Data to store
   * @param options - Storage options
   * 
   * @example
   * ```typescript
   * const storage = new SecureStorage();
   * storage.setItem('token', { accessToken: 'abc123' }, { encrypt: true });
   * ```
   */
  setItem<T = any>(key: string, value: T, options: SecureStorageOptions = {}): void {
    try {
      const opts = { ...DEFAULT_OPTIONS, ...options };
      let dataToStore = value;

      // Sanitize data
      if (opts.sanitize && typeof value === 'object') {
        dataToStore = sanitizeObject(value as any);
      }

      // Encrypt data
      let storageValue: string;
      if (opts.encrypt) {
        if (opts.expiresInDays && opts.expiresInDays > 0) {
          const expiresInMs = opts.expiresInDays * 24 * 60 * 60 * 1000;
          storageValue = encryptWithExpiry(dataToStore, expiresInMs);
        } else {
          storageValue = encrypt(dataToStore);
        }
      } else {
        storageValue = JSON.stringify(dataToStore);
      }

      localStorage.setItem(this.prefix + key, storageValue);
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
    }
  }

  /**
   * Retrieves data from localStorage
   * 
   * @param key - Storage key
   * @param options - Storage options
   * @returns Stored data or null if not found/expired
   * 
   * @example
   * ```typescript
   * const storage = new SecureStorage();
   * const token = storage.getItem<{ accessToken: string }>('token');
   * ```
   */
  getItem<T = any>(key: string, options: SecureStorageOptions = {}): T | null {
    try {
      const opts = { ...DEFAULT_OPTIONS, ...options };
      const storageValue = localStorage.getItem(this.prefix + key);

      if (!storageValue) {
        return null;
      }

      // Decrypt data
      let data: T | null;
      if (opts.encrypt) {
        if (opts.expiresInDays && opts.expiresInDays > 0) {
          data = decryptWithExpiry<T>(storageValue);
        } else {
          data = decrypt<T>(storageValue);
        }
      } else {
        data = JSON.parse(storageValue) as T;
      }

      return data;
    } catch (error) {
      console.error('SecureStorage getItem error:', error);
      return null;
    }
  }

  /**
   * Removes item from localStorage
   * 
   * @param key - Storage key
   */
  removeItem(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  /**
   * Clears all items with the prefix
   */
  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}

/**
 * Secure cookie storage wrapper
 */
export class SecureCookieStorage {
  private prefix: string;

  constructor(prefix: string = 'kr_') {
    this.prefix = prefix;
  }

  /**
   * Stores data securely in cookies
   * 
   * @param key - Cookie key
   * @param value - Data to store
   * @param options - Storage options
   * 
   * @example
   * ```typescript
   * const cookieStorage = new SecureCookieStorage();
   * cookieStorage.setItem('auth', { token: 'abc' }, { 
   *   encrypt: true, 
   *   secure: true,
   *   expiresInDays: 7 
   * });
   * ```
   */
  setItem<T = any>(key: string, value: T, options: SecureStorageOptions = {}): void {
    try {
      const opts = { ...DEFAULT_OPTIONS, ...options };
      let dataToStore = value;

      // Sanitize data
      if (opts.sanitize && typeof value === 'object') {
        dataToStore = sanitizeObject(value as any);
      }

      // Encrypt data
      let cookieValue: string;
      if (opts.encrypt) {
        cookieValue = encrypt(dataToStore);
      } else {
        cookieValue = JSON.stringify(dataToStore);
      }

      // Set cookie with security options
      Cookies.set(this.prefix + key, cookieValue, {
        expires: opts.expiresInDays,
        secure: opts.secure,
        sameSite: opts.sameSite,
      });
    } catch (error) {
      console.error('SecureCookieStorage setItem error:', error);
    }
  }

  /**
   * Retrieves data from cookies
   * 
   * @param key - Cookie key
   * @param options - Storage options
   * @returns Stored data or null if not found
   */
  getItem<T = any>(key: string, options: SecureStorageOptions = {}): T | null {
    try {
      const opts = { ...DEFAULT_OPTIONS, ...options };
      const cookieValue = Cookies.get(this.prefix + key);

      if (!cookieValue) {
        return null;
      }

      // Decrypt data
      let data: T | null;
      if (opts.encrypt) {
        data = decrypt<T>(cookieValue);
      } else {
        data = JSON.parse(cookieValue) as T;
      }

      return data;
    } catch (error) {
      console.error('SecureCookieStorage getItem error:', error);
      return null;
    }
  }

  /**
   * Removes cookie
   * 
   * @param key - Cookie key
   */
  removeItem(key: string): void {
    Cookies.remove(this.prefix + key);
  }

  /**
   * Clears all cookies with the prefix
   */
  clear(): void {
    const cookies = Cookies.get();
    Object.keys(cookies).forEach((key) => {
      if (key.startsWith(this.prefix)) {
        Cookies.remove(key);
      }
    });
  }
}

/**
 * Default secure storage instance (localStorage)
 */
export const secureStorage = new SecureStorage('krishiraksha_');

/**
 * Default secure cookie storage instance
 */
export const secureCookieStorage = new SecureCookieStorage('krishiraksha_');

/**
 * Token storage specifically for authentication tokens
 */
export const tokenStorage = {
  /**
   * Stores authentication token securely
   * Prefers cookies over localStorage for better security
   */
  setToken(token: string, expiresInDays: number = 7): void {
    // Store in secure cookie if possible
    secureCookieStorage.setItem('auth_token', { token }, {
      encrypt: true,
      secure: true,
      sameSite: 'strict',
      expiresInDays,
    });

    // Also store in encrypted localStorage as fallback
    secureStorage.setItem('auth_token', { token }, {
      encrypt: true,
      expiresInDays,
    });
  },

  /**
   * Retrieves authentication token
   * Checks cookies first, then localStorage
   */
  getToken(): string | null {
    // Try cookie first
    const cookieData = secureCookieStorage.getItem<{ token: string }>('auth_token', {
      encrypt: true,
    });

    if (cookieData?.token) {
      return cookieData.token;
    }

    // Fallback to localStorage
    const storageData = secureStorage.getItem<{ token: string }>('auth_token', {
      encrypt: true,
    });

    return storageData?.token || null;
  },

  /**
   * Removes authentication token from all storage
   */
  removeToken(): void {
    secureCookieStorage.removeItem('auth_token');
    secureStorage.removeItem('auth_token');
  },

  /**
   * Checks if token exists and is valid
   */
  hasToken(): boolean {
    return this.getToken() !== null;
  },
};

/**
 * Refresh token storage
 */
export const refreshTokenStorage = {
  setToken(token: string, expiresInDays: number = 30): void {
    secureCookieStorage.setItem('refresh_token', { token }, {
      encrypt: true,
      secure: true,
      sameSite: 'strict',
      expiresInDays,
    });
  },

  getToken(): string | null {
    const data = secureCookieStorage.getItem<{ token: string }>('refresh_token', {
      encrypt: true,
    });
    return data?.token || null;
  },

  removeToken(): void {
    secureCookieStorage.removeItem('refresh_token');
  },
};

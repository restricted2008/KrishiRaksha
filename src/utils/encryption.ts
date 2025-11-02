import CryptoJS from 'crypto-js';

/**
 * Encryption key - In production, this should come from environment variables
 * and be rotated regularly
 */
const getEncryptionKey = (): string => {
  // In production, use: process.env.VITE_ENCRYPTION_KEY
  // For now, generate a session-specific key
  const storedKey = sessionStorage.getItem('__enc_key');
  if (storedKey) {
    return storedKey;
  }

  // Generate a new key for this session
  const newKey = CryptoJS.lib.WordArray.random(256 / 8).toString();
  sessionStorage.setItem('__enc_key', newKey);
  return newKey;
};

/**
 * Encrypts data using AES-256
 * 
 * @param data - Data to encrypt (string, object, number, etc.)
 * @returns Encrypted string
 * 
 * @example
 * ```typescript
 * const encrypted = encrypt({ token: 'secret123', userId: '456' });
 * ```
 */
export const encrypt = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    const key = getEncryptionKey();
    const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypts AES-256 encrypted data
 * 
 * @param encryptedData - Encrypted string
 * @returns Decrypted data
 * 
 * @example
 * ```typescript
 * const decrypted = decrypt(encryptedString);
 * // Returns: { token: 'secret123', userId: '456' }
 * ```
 */
export const decrypt = <T = any>(encryptedData: string): T | null => {
  try {
    const key = getEncryptionKey();
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!jsonString) {
      return null;
    }

    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Generates a cryptographically secure random string
 * Useful for tokens, nonces, etc.
 * 
 * @param length - Length of the random string (default: 32)
 * @returns Random hex string
 * 
 * @example
 * ```typescript
 * const token = generateSecureRandom(64);
 * // Returns: 'a3f5b2c1...' (64 characters)
 * ```
 */
export const generateSecureRandom = (length: number = 32): string => {
  return CryptoJS.lib.WordArray.random(length / 2).toString();
};

/**
 * Hashes data using SHA-256
 * Useful for integrity checks and non-reversible storage
 * 
 * @param data - Data to hash
 * @returns SHA-256 hash string
 * 
 * @example
 * ```typescript
 * const hash = hashData('password123');
 * // Returns: 'ef92b778b...' (64 character hex string)
 * ```
 */
export const hashData = (data: string): string => {
  return CryptoJS.SHA256(data).toString();
};

/**
 * Creates HMAC signature for data integrity verification
 * 
 * @param data - Data to sign
 * @param secret - Secret key for signing
 * @returns HMAC-SHA256 signature
 * 
 * @example
 * ```typescript
 * const signature = createHMAC('user-data', 'secret-key');
 * const isValid = verifyHMAC('user-data', signature, 'secret-key');
 * ```
 */
export const createHMAC = (data: string, secret: string): string => {
  return CryptoJS.HmacSHA256(data, secret).toString();
};

/**
 * Verifies HMAC signature
 * 
 * @param data - Original data
 * @param signature - HMAC signature to verify
 * @param secret - Secret key used for signing
 * @returns True if signature is valid
 */
export const verifyHMAC = (data: string, signature: string, secret: string): boolean => {
  const expectedSignature = createHMAC(data, secret);
  return expectedSignature === signature;
};

/**
 * Encrypts data with timestamp for expiration checking
 * 
 * @param data - Data to encrypt
 * @param expiresInMs - Expiration time in milliseconds
 * @returns Encrypted string with embedded expiration
 * 
 * @example
 * ```typescript
 * // Encrypt with 1 hour expiration
 * const encrypted = encryptWithExpiry({ token: 'abc' }, 3600000);
 * 
 * // Later, decrypt and check expiration
 * const decrypted = decryptWithExpiry(encrypted);
 * if (!decrypted) {
 *   console.log('Data expired or invalid');
 * }
 * ```
 */
export const encryptWithExpiry = (data: any, expiresInMs: number): string => {
  const payload = {
    data,
    expiresAt: Date.now() + expiresInMs,
  };
  return encrypt(payload);
};

/**
 * Decrypts data and checks expiration
 * 
 * @param encryptedData - Encrypted string with expiration
 * @returns Decrypted data or null if expired/invalid
 */
export const decryptWithExpiry = <T = any>(encryptedData: string): T | null => {
  const decrypted = decrypt<{ data: T; expiresAt: number }>(encryptedData);
  
  if (!decrypted) {
    return null;
  }

  if (Date.now() > decrypted.expiresAt) {
    return null; // Expired
  }

  return decrypted.data;
};

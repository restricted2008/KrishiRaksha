import DOMPurify from 'isomorphic-dompurify';

/**
 * Configuration for DOMPurify sanitization
 */
const SANITIZE_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'br'],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  RETURN_TRUSTED_TYPE: false,
};

const STRICT_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
};

/**
 * Sanitizes HTML string to prevent XSS attacks
 * Removes potentially dangerous tags and attributes
 * 
 * @param dirty - Unsanitized HTML string
 * @param strict - If true, strips all HTML tags
 * @returns Sanitized string safe for rendering
 * 
 * @example
 * ```typescript
 * const userInput = '<script>alert("XSS")</script>Hello';
 * const safe = sanitizeHtml(userInput);
 * // Returns: "Hello"
 * ```
 */
export const sanitizeHtml = (dirty: string, strict: boolean = false): string => {
  if (typeof dirty !== 'string') {
    return '';
  }

  const config = strict ? STRICT_CONFIG : SANITIZE_CONFIG;
  return DOMPurify.sanitize(dirty, config);
};

/**
 * Sanitizes plain text input
 * Removes all HTML tags and dangerous characters
 * 
 * @param input - User input string
 * @returns Sanitized plain text
 * 
 * @example
 * ```typescript
 * const input = '<img src=x onerror=alert(1)>Name';
 * const safe = sanitizeText(input);
 * // Returns: "Name"
 * ```
 */
export const sanitizeText = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  return sanitizeHtml(input, true);
};

/**
 * Sanitizes URL to prevent javascript: and data: protocols
 * Only allows http:, https:, and relative URLs
 * 
 * @param url - URL string to sanitize
 * @returns Sanitized URL or empty string if invalid
 * 
 * @example
 * ```typescript
 * sanitizeUrl('javascript:alert(1)'); // Returns: ''
 * sanitizeUrl('https://example.com'); // Returns: 'https://example.com'
 * ```
 */
export const sanitizeUrl = (url: string): string => {
  if (typeof url !== 'string') {
    return '';
  }

  // Remove whitespace
  url = url.trim();

  // Check for dangerous protocols
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:',
  ];

  const lowerUrl = url.toLowerCase();
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return '';
    }
  }

  // Allow http:, https:, and relative URLs
  if (
    lowerUrl.startsWith('http://') ||
    lowerUrl.startsWith('https://') ||
    lowerUrl.startsWith('/') ||
    lowerUrl.startsWith('./') ||
    lowerUrl.startsWith('../')
  ) {
    return url;
  }

  // If no protocol and doesn't start with /, assume relative
  if (!lowerUrl.includes(':')) {
    return url;
  }

  return '';
};

/**
 * Sanitizes filename to prevent path traversal attacks
 * Removes dangerous characters and path separators
 * 
 * @param filename - Filename string
 * @returns Sanitized filename
 * 
 * @example
 * ```typescript
 * sanitizeFilename('../../../etc/passwd'); // Returns: 'etcpasswd'
 * sanitizeFilename('file<script>.txt'); // Returns: 'file.txt'
 * ```
 */
export const sanitizeFilename = (filename: string): string => {
  if (typeof filename !== 'string') {
    return '';
  }

  // Remove path separators and dangerous characters
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+$/, '') // Remove trailing dots
    .trim()
    .substring(0, 255); // Limit length
};

/**
 * Sanitizes email address
 * Validates format and removes dangerous characters
 * 
 * @param email - Email address string
 * @returns Sanitized email or empty string if invalid
 * 
 * @example
 * ```typescript
 * sanitizeEmail('user@example.com'); // Returns: 'user@example.com'
 * sanitizeEmail('"><script>alert(1)</script>'); // Returns: ''
 * ```
 */
export const sanitizeEmail = (email: string): string => {
  if (typeof email !== 'string') {
    return '';
  }

  // Remove HTML tags
  const cleaned = sanitizeText(email).trim().toLowerCase();

  // Basic email validation regex
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

  return emailRegex.test(cleaned) ? cleaned : '';
};

/**
 * Sanitizes phone number
 * Keeps only digits, +, -, (, ), and spaces
 * 
 * @param phone - Phone number string
 * @returns Sanitized phone number
 * 
 * @example
 * ```typescript
 * sanitizePhone('+1 (555) 123-4567'); // Returns: '+1 (555) 123-4567'
 * sanitizePhone('+1<script>alert(1)</script>'); // Returns: '+1'
 * ```
 */
export const sanitizePhone = (phone: string): string => {
  if (typeof phone !== 'string') {
    return '';
  }

  // Keep only valid phone characters
  return phone.replace(/[^0-9+\-() ]/g, '').trim();
};

/**
 * Sanitizes object by recursively sanitizing all string values
 * Useful for sanitizing form data or API responses
 * 
 * @param obj - Object to sanitize
 * @param strict - If true, strips all HTML tags
 * @returns Sanitized object
 * 
 * @example
 * ```typescript
 * const data = {
 *   name: '<script>alert(1)</script>John',
 *   email: 'john@example.com',
 *   nested: { bio: '<b>Developer</b>' }
 * };
 * const safe = sanitizeObject(data);
 * // Returns: { name: 'John', email: 'john@example.com', nested: { bio: 'Developer' } }
 * ```
 */
export const sanitizeObject = <T extends Record<string, any>>(
  obj: T,
  strict: boolean = true
): T => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized: any = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (typeof value === 'string') {
        sanitized[key] = sanitizeHtml(value, strict);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value, strict);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized as T;
};

/**
 * Escapes special characters for use in HTML attributes
 * Prevents attribute-based XSS attacks
 * 
 * @param str - String to escape
 * @returns Escaped string safe for HTML attributes
 * 
 * @example
 * ```typescript
 * escapeHtmlAttribute('">alert(1)<"'); // Returns: '&quot;&gt;alert(1)&lt;&quot;'
 * ```
 */
export const escapeHtmlAttribute = (str: string): string => {
  if (typeof str !== 'string') {
    return '';
  }

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validates and sanitizes JSON string
 * Prevents JSON injection attacks
 * 
 * @param jsonString - JSON string to sanitize
 * @returns Parsed and sanitized object or null if invalid
 * 
 * @example
 * ```typescript
 * const data = sanitizeJson('{"name": "<script>alert(1)</script>"}');
 * // Returns: { name: '' }
 * ```
 */
export const sanitizeJson = <T = any>(jsonString: string): T | null => {
  try {
    const parsed = JSON.parse(jsonString);
    return sanitizeObject(parsed);
  } catch {
    return null;
  }
};

/**
 * Creates a Content Security Policy (CSP) nonce for inline scripts
 * Use this to whitelist inline scripts in a CSP-protected environment
 * 
 * @returns Random nonce string
 */
export const generateCSPNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Sanitizes input for SQL-like queries (for local filtering)
 * Prevents injection attacks in client-side filtering
 * 
 * @param input - Query string
 * @returns Sanitized query string
 */
export const sanitizeQuery = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove SQL-like keywords and special characters
  return input
    .replace(/[';--]/g, '')
    .replace(/\b(DROP|DELETE|INSERT|UPDATE|UNION|SELECT|ALTER|CREATE|EXEC|EXECUTE)\b/gi, '')
    .trim();
};

/**
 * Type guard to check if a value is safe for rendering
 * 
 * @param value - Value to check
 * @returns True if value is safe
 */
export const isSafeValue = (value: any): boolean => {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string') {
    const sanitized = sanitizeHtml(value, true);
    return sanitized === value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return true;
  }

  return false;
};

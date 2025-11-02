/**
 * Error handling utilities
 */

export class AppError extends Error {
  code: string;
  statusCode?: number;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode?: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Error codes
 */
export const ErrorCodes = {
  // Authentication
  AUTH_FAILED: 'AUTH_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Network
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // API
  API_ERROR: 'API_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  
  // Blockchain
  BLOCKCHAIN_ERROR: 'BLOCKCHAIN_ERROR',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  
  // QR Code
  QR_SCAN_FAILED: 'QR_SCAN_FAILED',
  QR_INVALID: 'QR_INVALID',
  
  // General
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * User-friendly error messages
 */
export const ErrorMessages: Record<string, string> = {
  [ErrorCodes.AUTH_FAILED]: 'Authentication failed. Please check your credentials.',
  [ErrorCodes.UNAUTHORIZED]: 'You are not authorized to perform this action.',
  [ErrorCodes.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCodes.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCodes.INVALID_INPUT]: 'The provided information is invalid.',
  [ErrorCodes.NETWORK_ERROR]: 'Network error. Please check your internet connection.',
  [ErrorCodes.TIMEOUT]: 'Request timed out. Please try again.',
  [ErrorCodes.API_ERROR]: 'An error occurred. Please try again later.',
  [ErrorCodes.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCodes.SERVER_ERROR]: 'Server error. Please try again later.',
  [ErrorCodes.BLOCKCHAIN_ERROR]: 'Blockchain operation failed. Please try again.',
  [ErrorCodes.TRANSACTION_FAILED]: 'Transaction failed. Please try again.',
  [ErrorCodes.QR_SCAN_FAILED]: 'Failed to scan QR code. Please try again.',
  [ErrorCodes.QR_INVALID]: 'Invalid QR code.',
  [ErrorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred.',
};

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return ErrorMessages[error.code] || error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return ErrorMessages[ErrorCodes.UNKNOWN_ERROR];
}

/**
 * Handle API errors
 */
export function handleApiError(error: any): AppError {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.message;
    
    if (status === 401) {
      return new AppError(message, ErrorCodes.UNAUTHORIZED, status);
    }
    if (status === 404) {
      return new AppError(message, ErrorCodes.NOT_FOUND, status);
    }
    if (status >= 500) {
      return new AppError(message, ErrorCodes.SERVER_ERROR, status);
    }
    
    return new AppError(message, ErrorCodes.API_ERROR, status);
  }
  
  if (error.request) {
    return new AppError(
      'Network error. Please check your connection.',
      ErrorCodes.NETWORK_ERROR
    );
  }
  
  return new AppError(error.message || 'Unknown error', ErrorCodes.UNKNOWN_ERROR);
}

/**
 * Log error (can be extended to send to monitoring service)
 */
export function logError(error: unknown, context?: Record<string, any>) {
  console.error('Error:', error);
  if (context) {
    console.error('Context:', context);
  }
  
  // TODO: Send to error monitoring service (e.g., Sentry)
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

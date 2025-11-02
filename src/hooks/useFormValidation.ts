import { useState, useCallback } from 'react';
import * as yup from 'yup';

export interface ValidationErrors {
  [key: string]: string;
}

export interface UseFormValidationReturn<T> {
  errors: ValidationErrors;
  isValid: boolean;
  validate: (data: T) => Promise<boolean>;
  validateField: (fieldName: keyof T, value: any) => Promise<boolean>;
  clearError: (fieldName: keyof T) => void;
  clearAllErrors: () => void;
  setError: (fieldName: keyof T, message: string) => void;
}

/**
 * Custom hook for form validation using Yup schemas
 * @param schema - Yup validation schema
 * @returns Validation utilities and state
 */
export function useFormValidation<T extends Record<string, any>>(
  schema: yup.ObjectSchema<any>
): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<ValidationErrors>({});

  /**
   * Validate entire form data
   */
  const validate = useCallback(
    async (data: T): Promise<boolean> => {
      try {
        await schema.validate(data, { abortEarly: false });
        setErrors({});
        return true;
      } catch (err) {
        if (err instanceof yup.ValidationError) {
          const validationErrors: ValidationErrors = {};
          err.inner.forEach((error) => {
            if (error.path) {
              validationErrors[error.path] = error.message;
            }
          });
          setErrors(validationErrors);
        }
        return false;
      }
    },
    [schema]
  );

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    async (fieldName: keyof T, value: any): Promise<boolean> => {
      try {
        // Use reach to get nested field schema
        const fieldSchema = yup.reach(schema, fieldName as string);
        await fieldSchema.validate(value);
        
        // Clear error for this field if validation passes
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName as string];
          return newErrors;
        });
        
        return true;
      } catch (err) {
        if (err instanceof yup.ValidationError) {
          setErrors((prev) => ({
            ...prev,
            [fieldName as string]: err.message,
          }));
        }
        return false;
      }
    },
    [schema]
  );

  /**
   * Clear error for a specific field
   */
  const clearError = useCallback((fieldName: keyof T) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName as string];
      return newErrors;
    });
  }, []);

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Manually set an error for a field
   */
  const setError = useCallback((fieldName: keyof T, message: string) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName as string]: message,
    }));
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    errors,
    isValid,
    validate,
    validateField,
    clearError,
    clearAllErrors,
    setError,
  };
}

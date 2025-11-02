import React from 'react';
import { AlertCircle, XCircle } from 'lucide-react';

interface FieldErrorProps {
  error?: string;
  className?: string;
}

/**
 * Display error message for a single form field
 */
export const FieldError: React.FC<FieldErrorProps> = ({ error, className = '' }) => {
  if (!error) return null;

  return (
    <div className={`flex items-start gap-1 mt-1 text-xs text-red-600 ${className}`}>
      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
};

interface SummaryErrorProps {
  errors: Record<string, string>;
  title?: string;
  className?: string;
  onDismiss?: () => void;
}

/**
 * Display summary of all form errors at the top
 */
export const SummaryError: React.FC<SummaryErrorProps> = ({
  errors,
  title = 'Please fix the following errors:',
  className = '',
  onDismiss,
}) => {
  const errorEntries = Object.entries(errors);

  if (errorEntries.length === 0) return null;

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-4 mb-4 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800 mb-2">{title}</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
              {errorEntries.map(([field, message]) => (
                <li key={field}>
                  <span className="font-medium capitalize">{formatFieldName(field)}:</span>{' '}
                  {message}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-600 hover:text-red-800 transition-colors"
            aria-label="Dismiss error"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Format field name for display (e.g., "cropType" -> "Crop Type")
 */
function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
}

interface InputWrapperProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

/**
 * Wrapper component for form inputs with label and error display
 */
export const InputWrapper: React.FC<InputWrapperProps> = ({
  label,
  error,
  required = false,
  children,
  htmlFor,
  className = '',
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={htmlFor}
        className={`block text-sm font-medium ${
          error ? 'text-red-700' : 'text-gray-700'
        }`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className={error ? 'ring-2 ring-red-500 rounded-md' : ''}>
        {children}
      </div>
      <FieldError error={error} />
    </div>
  );
};

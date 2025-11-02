import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Test component for Error Boundary demonstration
 * 
 * Usage:
 * 1. Import this component into any page
 * 2. Click the buttons to trigger different types of errors
 * 3. Verify that Error Boundaries catch and display errors properly
 * 
 * @example
 * import { ErrorBoundaryTest } from './components/ErrorBoundaryTest';
 * 
 * <ErrorBoundaryTest />
 */

export const ErrorBoundaryTest: React.FC = () => {
  const [throwError, setThrowError] = useState(false);
  const [throwAsyncError, setThrowAsyncError] = useState(false);

  // Trigger render error (caught by Error Boundary)
  if (throwError) {
    throw new Error('🧪 Test Error: Render error triggered for Error Boundary testing');
  }

  // Trigger async error (NOT caught by Error Boundary - needs try-catch)
  if (throwAsyncError) {
    setTimeout(() => {
      throw new Error('🧪 Test Error: Async error (not caught by boundary)');
    }, 100);
    setThrowAsyncError(false); // Reset to prevent infinite loop
  }

  const handleEventHandlerError = () => {
    // Event handler errors are NOT caught by Error Boundary
    // This will show in console but won't trigger Error Boundary
    throw new Error('🧪 Test Error: Event handler error (not caught by boundary)');
  };

  const handleCaughtError = () => {
    try {
      throw new Error('🧪 This error is caught with try-catch');
    } catch (error) {
      console.error('✅ Caught error:', error);
      alert('Error was caught! Check console for details.');
    }
  };

  return (
    <div
      style={{
        padding: '2rem',
        border: '2px dashed #f59e0b',
        borderRadius: '8px',
        backgroundColor: '#fffbeb',
        margin: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <AlertTriangle size={24} color="#f59e0b" />
        <h3 style={{ margin: 0, color: '#92400e', fontSize: '1.25rem', fontWeight: 'bold' }}>
          Error Boundary Test Panel
        </h3>
      </div>

      <p style={{ color: '#78350f', marginBottom: '1rem', fontSize: '0.875rem' }}>
        Use these buttons to test error handling. Check the console for detailed logs.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Render Error - Caught by Error Boundary */}
        <button
          onClick={() => setThrowError(true)}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            textAlign: 'left',
          }}
        >
          <strong>1. Trigger Render Error</strong>
          <br />
          <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
            ✅ Caught by Error Boundary - Will show error screen
          </span>
        </button>

        {/* Event Handler Error - NOT caught by Error Boundary */}
        <button
          onClick={handleEventHandlerError}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#ea580c',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            textAlign: 'left',
          }}
        >
          <strong>2. Trigger Event Handler Error</strong>
          <br />
          <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
            ❌ NOT caught by Error Boundary - Shows in console only
          </span>
        </button>

        {/* Async Error - NOT caught by Error Boundary */}
        <button
          onClick={() => setThrowAsyncError(true)}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#d97706',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            textAlign: 'left',
          }}
        >
          <strong>3. Trigger Async Error</strong>
          <br />
          <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
            ❌ NOT caught by Error Boundary - Shows in console only
          </span>
        </button>

        {/* Properly Caught Error */}
        <button
          onClick={handleCaughtError}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            textAlign: 'left',
          }}
        >
          <strong>4. Properly Handled Error</strong>
          <br />
          <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
            ✅ Caught with try-catch - Shows alert
          </span>
        </button>
      </div>

      <div
        style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#fef3c7',
          borderRadius: '6px',
          fontSize: '0.75rem',
          color: '#78350f',
        }}
      >
        <strong>💡 Testing Tips:</strong>
        <ul style={{ margin: '0.5rem 0 0 1.25rem', paddingLeft: 0 }}>
          <li>Click button #1 to see the Error Boundary in action</li>
          <li>Open browser console to see all error logs</li>
          <li>Test recovery options (Reload, Try Again, Go Home)</li>
          <li>Test "Copy Error" and "Report Bug" buttons</li>
          <li>Buttons #2 and #3 demonstrate errors NOT caught by boundaries</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Component that throws error on mount (for testing)
 */
export const BrokenComponent: React.FC = () => {
  throw new Error('🧪 This component is intentionally broken for testing');
  return <div>This will never render</div>;
};

/**
 * Component that conditionally throws error
 */
interface ConditionalErrorProps {
  shouldThrow?: boolean;
  errorMessage?: string;
}

export const ConditionalError: React.FC<ConditionalErrorProps> = ({
  shouldThrow = false,
  errorMessage = '🧪 Conditional error triggered',
}) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }

  return (
    <div style={{ padding: '1rem', backgroundColor: '#dcfce7', borderRadius: '6px' }}>
      <p style={{ margin: 0, color: '#166534' }}>
        ✅ No error - Component rendered successfully
      </p>
    </div>
  );
};

export default ErrorBoundaryTest;

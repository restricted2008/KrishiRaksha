import React, { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { Home } from 'lucide-react';

interface PageErrorBoundaryProps {
  children: ReactNode;
  pageName: string;
  onReset?: () => void;
}

/**
 * Page-specific Error Boundary
 * Wraps individual pages/routes for granular error handling
 */
export const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({
  children,
  pageName,
  onReset,
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log page-specific error
    console.error(`❌ Error in ${pageName}:`, error);
    console.error('Error Info:', errorInfo);
    
    // You could send to analytics/monitoring service here
    // Example: analytics.trackError(pageName, error, errorInfo);
  };

  const customFallback = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '500px',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '0.75rem',
            color: '#dc2626',
          }}
        >
          Error in {pageName}
        </h2>
        <p
          style={{
            marginBottom: '1.5rem',
            color: '#6b7280',
          }}
        >
          This page encountered an error. Other parts of the application should still work.
        </p>
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
            }}
          >
            Reload Page
          </button>
          {onReset && (
            <button
              onClick={onReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
              }}
            >
              <Home size={18} />
              Go to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary onError={handleError} fallback={customFallback}>
      {children}
    </ErrorBoundary>
  );
};

export default PageErrorBoundary;

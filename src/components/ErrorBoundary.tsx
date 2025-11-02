import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '../utils/errorHandling';
import { AlertTriangle, RefreshCw, Bug, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console for debugging
    console.error('🔴 Error Boundary Caught:', error);
    console.error('📍 Component Stack:', errorInfo.componentStack);
    
    // Store error info in state
    this.setState({ errorInfo });
    
    // Log using error handling utility
    logError(error, { errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, copied: false });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleCopyError = async () => {
    const { error, errorInfo } = this.state;
    const errorText = `Error: ${error?.message}\n\nStack Trace:\n${error?.stack}\n\nComponent Stack:${errorInfo?.componentStack}`;
    
    try {
      await navigator.clipboard.writeText(errorText);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  private handleReportBug = () => {
    const { error, errorInfo } = this.state;
    const subject = encodeURIComponent(`Bug Report: ${error?.message || 'Application Error'}`);
    const body = encodeURIComponent(
      `Error Details:\n\n` +
      `Message: ${error?.message}\n\n` +
      `Stack Trace:\n${error?.stack}\n\n` +
      `Component Stack:${errorInfo?.componentStack}\n\n` +
      `Browser: ${navigator.userAgent}\n` +
      `URL: ${window.location.href}\n` +
      `Timestamp: ${new Date().toISOString()}`
    );
    
    // Open email client with pre-filled bug report
    // Replace with your bug reporting system URL or email
    window.location.href = `mailto:support@krishiraksha.com?subject=${subject}&body=${body}`;
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#f9fafb',
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          }}>
            {/* Error Icon */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}>
              <div style={{
                backgroundColor: '#fee2e2',
                borderRadius: '50%',
                padding: '1rem',
              }}>
                <AlertTriangle size={48} color="#dc2626" />
              </div>
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              marginBottom: '0.75rem',
              color: '#111827',
            }}>
              Oops! Something went wrong
            </h1>
            
            {/* Description */}
            <p style={{
              marginBottom: '1.5rem',
              color: '#6b7280',
              fontSize: '1rem',
              lineHeight: '1.5',
            }}>
              We're sorry for the inconvenience. The application encountered an unexpected error.
              You can try reloading the page or report this issue to help us improve.
            </p>
            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
              >
                <RefreshCw size={18} />
                Reload Page
              </button>

              <button
                onClick={this.handleReportBug}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#047857';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669';
                }}
              >
                <Bug size={18} />
                Report Bug
              </button>
            </div>

            {/* Error Details */}
            {this.state.error && (
              <details style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                textAlign: 'left',
                fontSize: '0.875rem',
              }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  fontWeight: '600',
                  color: '#991b1b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <AlertTriangle size={16} />
                  Technical Details (for developers)
                </summary>
                
                <div style={{ marginTop: '1rem' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}>
                    <span style={{ fontWeight: '500', color: '#7f1d1d' }}>Error Message:</span>
                    <button
                      onClick={this.handleCopyError}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: this.state.copied ? '#dcfce7' : '#f3f4f6',
                        color: this.state.copied ? '#166534' : '#374151',
                        border: '1px solid',
                        borderColor: this.state.copied ? '#86efac' : '#d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                      }}
                    >
                      {this.state.copied ? (
                        <>
                          <Check size={14} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy Error
                        </>
                      )}
                    </button>
                  </div>
                  <pre style={{
                    padding: '0.75rem',
                    backgroundColor: '#fee2e2',
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '0.75rem',
                    color: '#991b1b',
                    maxHeight: '200px',
                  }}>
                    {this.state.error.message}
                    {'\n\n--- Stack Trace ---\n'}
                    {this.state.error.stack}
                  </pre>
                </div>
              </details>
            )}

            {/* Try Again Button */}
            <button
              onClick={this.handleReset}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#111827';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              Try recovering without reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

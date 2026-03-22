import React from 'react';
import logger from '../utils/logger.js';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorId
    });

    // Log comprehensive error information
    logger.error('React Error Boundary caught an error', {
      errorId,
      errorBoundary: this.props.name || 'UnnamedErrorBoundary',
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      },
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      deviceInfo: {
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      }
    }, 'error_boundary');

    // Also log to console for development
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    // Log retry attempt
    logger.info('User attempted to retry after error', {
      errorId: this.state.errorId,
      componentStack: this.state.errorInfo?.componentStack,
      retryTimestamp: new Date().toISOString()
    }, 'error_recovery');

    // Reset error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReportError = () => {
    // Log error reporting action
    logger.info('User reported error', {
      errorId: this.state.errorId,
      errorMessage: this.state.error?.message,
      componentStack: this.state.errorInfo?.componentStack,
      reportTimestamp: new Date().toISOString()
    }, 'user_action');

    // In a real application, this would send the error to a reporting service
    alert('Error reported. Thank you for helping us improve!');
  };

  render() {
    if (this.state.hasError) {
      // Render the fallback UI passed via props, or enhanced default error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Enhanced default error UI with logging integration
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#ff6b6b',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          margin: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ margin: '0 0 16px 0', color: '#495057' }}>
            Something went wrong
          </h2>
          <p style={{
            margin: '0 0 20px 0',
            color: '#6c757d',
            lineHeight: '1.5'
          }}>
            We encountered an unexpected error. Our team has been notified and is working to fix this issue.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <details style={{
              margin: '20px 0',
              textAlign: 'left',
              backgroundColor: '#ffffff',
              padding: '12px',
              borderRadius: '4px',
              border: '1px solid #dee2e6'
            }}>
              <summary style={{
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#495057'
              }}>
                Error Details (Development Only)
              </summary>
              <pre style={{
                margin: '12px 0 0 0',
                fontSize: '12px',
                color: '#dc3545',
                whiteSpace: 'pre-wrap',
                overflow: 'auto'
              }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo && `\n\nComponent Stack:\n${this.state.errorInfo.componentStack}`}
              </pre>
              <div style={{
                marginTop: '8px',
                fontSize: '11px',
                color: '#6c757d'
              }}>
                Error ID: {this.state.errorId}
              </div>
            </details>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => {
                logger.interaction('hover', 'error_retry_button', e, {
                  errorId: this.state.errorId
                });
              }}
            >
              Try Again
            </button>

            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => {
                logger.interaction('hover', 'error_refresh_button', e, {
                  errorId: this.state.errorId
                });
              }}
            >
              Refresh Page
            </button>

            <button
              onClick={this.handleReportError}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => {
                logger.interaction('hover', 'error_report_button', e, {
                  errorId: this.state.errorId
                });
              }}
            >
              Report Error
            </button>
          </div>

          <div style={{
            marginTop: '20px',
            fontSize: '12px',
            color: '#6c757d'
          }}>
            If the problem persists, please contact support with Error ID: {this.state.errorId}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

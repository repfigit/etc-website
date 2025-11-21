'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error monitoring service (e.g., Sentry)
      console.error('Error caught by boundary:', error, errorInfo);
    } else {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '2em',
          border: '2px solid #e74c3c',
          borderRadius: '4px',
          backgroundColor: '#2c1e1e',
          color: '#e8ebe8',
          margin: '1em 0'
        }}>
          <h2 style={{ color: '#e74c3c' }}>⚠️ Something went wrong</h2>
          <p>We're sorry, but something unexpected happened. Please try refreshing the page.</p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '1em' }}>
              <summary style={{ cursor: 'pointer', color: '#4ecdc4' }}>
                Error details (development only)
              </summary>
              <pre style={{
                marginTop: '0.5em',
                padding: '1em',
                backgroundColor: '#0a0f0a',
                border: '1px solid #4ecdc4',
                overflow: 'auto',
                fontSize: '0.85em'
              }}>
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1em',
              padding: '0.5em 1em',
              backgroundColor: '#4ecdc4',
              color: '#0a0f0a',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

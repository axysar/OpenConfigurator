import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[OpenConfigurator] Uncaught error:', error, info.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleHardReset = (): void => {
    try {
      localStorage.removeItem('oc.pergola.recent');
      localStorage.removeItem('oc.pergola.saved');
    } catch { /* noop */ }
    if (typeof window !== 'undefined') {
      window.location.hash = '';
      window.location.reload();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="error-boundary" role="alert">
          <div className="error-card">
            <h2>Something went wrong</h2>
            <p>The configurator encountered an unexpected error. Your saved configurations are safe.</p>
            {this.state.error && (
              <pre className="error-detail">{this.state.error.message}</pre>
            )}
            <div className="error-actions">
              <button type="button" className="oc-icon-btn primary" onClick={this.handleReset}>
                Try Again
              </button>
              <button type="button" className="oc-icon-btn" onClick={this.handleHardReset}>
                Reset & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import React, { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * ErrorBoundary — catches render errors, shows a styled fallback,
 * and prevents the entire app from unmounting.
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorMessage: '' };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
        this.setState({ errorMessage: error.toString() });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary-container">
                    <h2>⚠️ Component Error</h2>
                    <p>A UI component crashed. The rest of the app is still running.</p>
                    {this.state.errorMessage && (
                        <pre>{this.state.errorMessage}</pre>
                    )}
                    <button className="btn-reload" onClick={() => window.location.reload()}>
                        Reload Dashboard
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;

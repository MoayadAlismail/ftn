"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);

        // In production, you would send this to your error reporting service
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
            // Report to error tracking service (e.g., Sentry)
            // reportError(error, errorInfo);
        }
    }

    resetError = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback;
                return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
            }

            return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
        }

        return this.props.children;
    }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
    const isNetworkError = error?.message?.includes('fetch') || error?.message?.includes('network');
    const isDevelopment = process.env.NODE_ENV === 'development';

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">
                        {isNetworkError ? 'Connection Problem' : 'Something went wrong'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-gray-600">
                        {isNetworkError
                            ? 'Unable to connect to our servers. Please check your internet connection and try again.'
                            : 'An unexpected error occurred. Our team has been notified and is working to fix this.'
                        }
                    </p>

                    {isDevelopment && error && (
                        <details className="mt-4 text-left">
                            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                                Technical Details (Development)
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                                {error.toString()}
                                {error.stack && `\n\n${error.stack}`}
                            </pre>
                        </details>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <Button
                            onClick={resetError}
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = '/'}
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            <Home className="h-4 w-4" />
                            Go Home
                        </Button>
                    </div>

                    <p className="text-xs text-gray-500 mt-4">
                        If this problem persists, please contact our support team.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default ErrorBoundary;


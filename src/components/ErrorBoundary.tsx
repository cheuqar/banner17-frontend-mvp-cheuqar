import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import Bugsnag from '@bugsnag/js';
import { isBugsnagEnabled } from '../config/bugsnag';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallbackMessage?: string;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

/**
 * Error Boundary Component
 *
 * Catches React errors in child components and displays a graceful fallback UI
 * instead of crashing the entire application.
 *
 * Usage:
 * <ErrorBoundary fallbackMessage="Map temporarily unavailable">
 *   <MapContainer>...</MapContainer>
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error details for debugging
        console.error('Error Boundary caught error:', error, errorInfo);

        // Report to BugSnag with component stack
        if (isBugsnagEnabled()) {
            Bugsnag.notify(error, (event) => {
                event.addMetadata('react', {
                    componentStack: errorInfo.componentStack,
                });
            });
        }
    }

    handleReload = () => {
        // Reset error state and reload page
        this.setState({ hasError: false, error: undefined });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        bgcolor: 'background.default'
                    }}
                >
                    <Typography variant="h6" color="error" gutterBottom>
                        {this.props.fallbackMessage || 'Something went wrong'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        An unexpected error occurred. Please try reloading the page.
                    </Typography>
                    {this.state.error && (
                        <Typography
                            variant="caption"
                            color="text.disabled"
                            sx={{
                                mb: 3,
                                fontFamily: 'monospace',
                                bgcolor: 'grey.100',
                                p: 1,
                                borderRadius: 1,
                                maxWidth: 600,
                                overflow: 'auto'
                            }}
                        >
                            {this.state.error.message}
                        </Typography>
                    )}
                    <Button
                        variant="contained"
                        onClick={this.handleReload}
                        sx={{ minWidth: 150 }}
                    >
                        Reload Page
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

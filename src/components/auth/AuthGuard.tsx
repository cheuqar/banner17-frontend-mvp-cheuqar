import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'
import AuthModal from './AuthModal'

interface AuthGuardProps {
  children?: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    // Show auth modal if not authenticated and not loading
    if (!isLoading && !isAuthenticated) {
      setShowAuthModal(true)
    } else if (isAuthenticated) {
      setShowAuthModal(false)
    }
  }, [isAuthenticated, isLoading])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      fallback || (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            bgcolor: '#fafbfc',
          }}
        >
          <CircularProgress size={40} sx={{ mb: 2, color: '#2563eb' }} />
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      )
    )
  }

  // Show auth modal if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            bgcolor: '#fafbfc',
            px: 3,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, color: '#1f2937' }}>
              Welcome to Banner17
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
              Your AI-powered property listing assistant. Sign in to get started with intelligent property analysis and market insights.
            </Typography>
          </Box>
        </Box>

        <AuthModal
          open={showAuthModal}
          onClose={() => {
            // Don't allow closing the modal if not authenticated
            // User must sign in to proceed
          }}
          initialTab="signin"
        />
      </>
    )
  }

  // User is authenticated, render the protected content
  // Support both wrapper mode (children) and layout mode (Outlet)
  return children ? <>{children}</> : <Outlet />
}
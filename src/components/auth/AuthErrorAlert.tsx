import React from 'react';
import { Alert } from '@mui/material';

interface AuthErrorAlertProps {
  error: string | null | undefined;
}

/**
 * AuthErrorAlert Component
 *
 * Displays authentication error messages with Style4-V2 compliance.
 * Uses Material-UI Alert component with error severity for visual consistency.
 *
 * Requirements:
 * - FR-036: Visual error state with red color (#D32F2F), ErrorOutline icon, 8px positioning
 * - FR-046: Display validation error messages
 * - FR-048: Display network failure error messages
 *
 * @param {string | null | undefined} error - Error message to display
 *
 * @example
 * // Display validation error
 * <AuthErrorAlert error="Invalid email format" />
 *
 * // Display network error
 * <AuthErrorAlert error="Network error - please check your connection" />
 *
 * // No error (component not rendered)
 * <AuthErrorAlert error={null} />
 */
export default function AuthErrorAlert({ error }: AuthErrorAlertProps) {
  // Don't render if no error
  if (!error || error.trim() === '') {
    return null;
  }

  return (
    <Alert
      severity="error"
      sx={{
        mt: 1, // 8px top margin per FR-036 (MUI default spacing: 1 = 8px)
        // MUI Alert error severity automatically applies:
        // - Red color (#D32F2F) per FR-036
        // - ErrorOutline icon per FR-036
        // - role="alert" for accessibility
      }}
    >
      {error}
    </Alert>
  );
}

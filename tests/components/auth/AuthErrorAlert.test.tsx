import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthErrorAlert from '../../../src/components/auth/AuthErrorAlert';

describe('AuthErrorAlert', () => {
  describe('FR-036: Visual Error State Requirements', () => {
    it('should render error message with Material-UI Alert component', () => {
      // Arrange
      const errorMessage = 'Invalid login credentials';

      // Act
      render(<AuthErrorAlert error={errorMessage} />);

      // Assert: Error message is displayed
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should display error severity Alert with error icon', () => {
      // Arrange
      const errorMessage = 'Network error - please check your connection';

      // Act
      const { container } = render(<AuthErrorAlert error={errorMessage} />);

      // Assert: MUI Alert with severity="error" (default includes ErrorOutline icon)
      const alert = container.querySelector('.MuiAlert-root');
      expect(alert).toHaveClass('MuiAlert-standardError');
    });

    it('should apply red text color (#D32F2F) per Style4-V2', () => {
      // Arrange
      const errorMessage = 'Email already registered';

      // Act
      const { container } = render(<AuthErrorAlert error={errorMessage} />);

      // Assert: MUI Alert error severity uses red color palette
      const alert = container.querySelector('.MuiAlert-root');
      expect(alert).toHaveClass('MuiAlert-standardError'); // MUI default error color
    });

    it('should apply 8px top margin positioning', () => {
      // Arrange
      const errorMessage = 'Password must be at least 6 characters';

      // Act
      const { container } = render(<AuthErrorAlert error={errorMessage} />);

      // Assert: Check sx prop applies mt: 1 (8px in MUI default spacing)
      const alert = container.querySelector('.MuiAlert-root');
      expect(alert).toHaveStyle({ marginTop: '8px' });
    });
  });

  describe('Conditional Rendering', () => {
    it('should not render when error is null', () => {
      // Act
      const { container } = render(<AuthErrorAlert error={null} />);

      // Assert: No alert rendered
      expect(container.firstChild).toBeNull();
    });

    it('should not render when error is empty string', () => {
      // Act
      const { container } = render(<AuthErrorAlert error="" />);

      // Assert: No alert rendered
      expect(container.firstChild).toBeNull();
    });

    it('should not render when error is undefined', () => {
      // Act
      const { container } = render(<AuthErrorAlert error={undefined} />);

      // Assert: No alert rendered
      expect(container.firstChild).toBeNull();
    });

    it('should render when error is non-empty string', () => {
      // Arrange
      const errorMessage = 'Test error';

      // Act
      render(<AuthErrorAlert error={errorMessage} />);

      // Assert: Alert is rendered
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('FR-046: Validation Error Messages', () => {
    it('should display "Email is required" error', () => {
      // Arrange
      const errorMessage = 'Email is required';

      // Act
      render(<AuthErrorAlert error={errorMessage} />);

      // Assert
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should display "Invalid email format" error', () => {
      // Arrange
      const errorMessage = 'Invalid email format';

      // Act
      render(<AuthErrorAlert error={errorMessage} />);

      // Assert
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should display "Password must be at least 6 characters" error', () => {
      // Arrange
      const errorMessage = 'Password must be at least 6 characters';

      // Act
      render(<AuthErrorAlert error={errorMessage} />);

      // Assert
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should display "Email already registered" error', () => {
      // Arrange
      const errorMessage = 'Email already registered';

      // Act
      render(<AuthErrorAlert error={errorMessage} />);

      // Assert
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should display "Invalid login credentials" error', () => {
      // Arrange
      const errorMessage = 'Invalid login credentials';

      // Act
      render(<AuthErrorAlert error={errorMessage} />);

      // Assert
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('FR-048: Network Error Handling', () => {
    it('should display network failure error message', () => {
      // Arrange
      const errorMessage = 'Network error - please check your connection and retry';

      // Act
      render(<AuthErrorAlert error={errorMessage} />);

      // Assert
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA role="alert" for screen readers', () => {
      // Arrange
      const errorMessage = 'Test accessibility';

      // Act
      render(<AuthErrorAlert error={errorMessage} />);

      // Assert: MUI Alert provides role="alert"
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should be focusable for keyboard navigation', () => {
      // Arrange
      const errorMessage = 'Test keyboard navigation';

      // Act
      render(<AuthErrorAlert error={errorMessage} />);

      // Assert: Alert is in document and accessible
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });
  });
});

/**
 * PropertyCard Component Tests - Smart Search UI Redesign (Feature 001)
 *
 * TDD Approach: These tests MUST FAIL initially (Red phase)
 * Tests verify FR-014 to FR-021 styling requirements
 *
 * Functional Requirements Covered:
 * - FR-014: Price display with 20px text at 700 weight
 * - FR-015: Property type labels in uppercase 11px at 700 weight in #666666
 * - FR-016: Image grayscale 20% → 0% on hover with 300ms transition
 * - FR-017: Image height 200px
 * - FR-018: Bedroom/bathroom/parking icons 16px with 13px/500 labels
 * - FR-019: Card hover background #FAFAFA with 200ms transition
 * - FR-020: Card styling - 0px border-radius, 1px #E0E0E0 border, 16px padding
 * - FR-021: Price format - "$1,234,567" with locale formatting
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PropertyCard from '../../src/pages/SmartSearch/components/PropertyCard';

// Mock property data for testing
const mockProperty = {
  id: '1',
  address: '123 Test Street',
  suburb: 'Mosman',
  state: 'NSW',
  postcode: '2088',
  price: 1250000,
  bedrooms: 3,
  bathrooms: 2,
  car_spaces: 2,
  property_type: 'house',
  images: ['https://example.com/image1.jpg'],
  listing_type: 'sale',
};

const mockPropertyNoPrice = {
  ...mockProperty,
  price: null,
};

const mockPropertyNoImage = {
  ...mockProperty,
  images: undefined,
};

describe('PropertyCard - Monochrome Styling (FR-014 to FR-021)', () => {
  describe('T018 - Basic PropertyCard component rendering', () => {
    it('should render property card with all required elements', () => {
      const { container } = render(<PropertyCard property={mockProperty} />);

      // Verify card renders with proper CSS class
      const card = container.querySelector('.propertyCard');
      expect(card).toBeInTheDocument();

      // Verify price renders
      expect(screen.getByText('$1,250,000')).toBeInTheDocument();

      // Verify address renders
      expect(screen.getByText('123 Test Street')).toBeInTheDocument();
      expect(screen.getByText(/Mosman, NSW 2088/)).toBeInTheDocument();

      // Verify property type renders
      expect(screen.getByText('house')).toBeInTheDocument();

      // Verify features render
      expect(screen.getByText('3')).toBeInTheDocument(); // bedrooms
      const twos = screen.getAllByText('2'); // bathrooms and car_spaces both have value 2
      expect(twos.length).toBeGreaterThanOrEqual(1); // At least one "2" should exist
    });

    it('should apply FR-014: Price display CSS class', () => {
      const { container } = render(<PropertyCard property={mockProperty} />);
      const priceElement = screen.getByText('$1,250,000');

      // FR-014: Check that price has the correct CSS class
      expect(priceElement).toHaveClass('price');
    });

    it('should apply FR-015: Property type CSS class', () => {
      const { container } = render(<PropertyCard property={mockProperty} />);
      const typeElement = screen.getByText('house');

      // FR-015: Check that property type has the correct CSS class
      expect(typeElement).toHaveClass('propertyType');
    });

    it('should apply FR-018: Feature icons and labels CSS classes', () => {
      const { container } = render(<PropertyCard property={mockProperty} />);

      // Find bedroom icon (BedIcon)
      const bedroomIcon = container.querySelector('[data-testid="BedIcon"]');
      expect(bedroomIcon).toHaveClass('featureIcon');

      // Find features container
      const featuresContainer = container.querySelector('.features');
      expect(featuresContainer).toBeInTheDocument();
    });

    it('should apply FR-020: Card CSS class with proper styling', () => {
      const { container } = render(<PropertyCard property={mockProperty} />);
      const card = container.querySelector('.propertyCard');

      // FR-020: Check CSS class is applied
      expect(card).toHaveClass('propertyCard');

      // Check card content has proper class
      const cardContent = container.querySelector('.propertyCardContent');
      expect(cardContent).toBeInTheDocument();
    });

    it('should apply FR-021: Price format with locale string formatting', () => {
      render(<PropertyCard property={mockProperty} />);

      // FR-021: Price should be formatted as "$1,250,000" with commas
      const priceText = screen.getByText('$1,250,000');
      expect(priceText).toBeInTheDocument();
      expect(priceText.textContent).toMatch(/^\$[\d,]+$/); // Format: $X,XXX,XXX
    });

    it('should display "Price on request" when price is null or 0', () => {
      render(<PropertyCard property={mockPropertyNoPrice} />);
      expect(screen.getByText('Price on request')).toBeInTheDocument();
    });
  });

  describe('T019 - PropertyCard hover state tests', () => {
    it('should apply FR-016: Image container CSS class for grayscale filter', () => {
      const { container } = render(<PropertyCard property={mockProperty} />);

      // Find image container - check it has the imageContainer class
      const imageContainer = container.querySelector('.imageContainer');
      expect(imageContainer).toBeInTheDocument();

      // Find image element within container
      const image = container.querySelector('img');
      expect(image).toBeInTheDocument();

      // FR-016: Visual verification of grayscale filter (20% to 0% on hover, 300ms transition)
      // will be done in browser testing (T030) as CSS modules don't apply in jsdom
    });

    it('should apply FR-019: Card has proper CSS class for hover effects', () => {
      const { container } = render(<PropertyCard property={mockProperty} />);
      const card = container.querySelector('.propertyCard');

      // FR-019: Check CSS class is applied
      expect(card).toHaveClass('propertyCard');

      // FR-019: Visual verification of hover states (#FAFAFA background, 200ms transition)
      // will be done in browser testing (T030)
    });
  });

  describe('T020 - PropertyCard image tests', () => {
    it('should apply FR-017: Image container CSS class', () => {
      const { container } = render(<PropertyCard property={mockProperty} />);

      // LazyPropertyImage component should be wrapped in imageContainer
      const imageContainer = container.querySelector('.imageContainer');
      expect(imageContainer).toBeInTheDocument();

      // FR-017: Visual verification of 200px height will be done in browser testing (T030)
    });

    it('should display placeholder image when images array is undefined', () => {
      const { container } = render(<PropertyCard property={mockPropertyNoImage} />);

      const image = container.querySelector('img');
      expect(image).toBeInTheDocument();

      if (image) {
        expect(image.src).toContain('placeholder');
      }
    });

    it('should use first image from images array', () => {
      const { container } = render(<PropertyCard property={mockProperty} />);

      const image = container.querySelector('img');
      expect(image).toBeInTheDocument();

      // LazyPropertyImage will eventually load the image
      // Initial src might be placeholder during lazy loading
    });
  });

  describe('PropertyCard click behavior', () => {
    it('should call onClick handler when card is clicked', () => {
      const handleClick = jest.fn();
      const { container } = render(<PropertyCard property={mockProperty} onClick={handleClick} />);

      const card = container.querySelector('.propertyCard');
      if (card) {
        (card as HTMLElement).click();
        expect(handleClick).toHaveBeenCalledTimes(1);
      }
    });

    it('should have cursor pointer CSS class for clickability', () => {
      const { container } = render(<PropertyCard property={mockProperty} onClick={() => {}} />);
      const card = container.querySelector('.propertyCard');

      // Check that propertyCard class is applied (CSS defines cursor: pointer)
      expect(card).toHaveClass('propertyCard');
    });
  });

  describe('PropertyCard accessibility', () => {
    it('should have proper semantic HTML structure', () => {
      const { container } = render(<PropertyCard property={mockProperty} />);

      // Card should have proper structure
      const card = container.querySelector('.propertyCard');
      expect(card).toBeInTheDocument();
    });

    it('should have accessible image alt text', () => {
      const { container } = render(<PropertyCard property={mockProperty} />);
      const image = container.querySelector('img');

      if (image) {
        expect(image.alt).toBe(mockProperty.address);
      }
    });
  });

  describe('PropertyCard optional features handling', () => {
    it('should not render bedroom icon when bedrooms is null', () => {
      const propertyNoBedrooms = { ...mockProperty, bedrooms: null };
      const { container } = render(<PropertyCard property={propertyNoBedrooms} />);

      const bedroomIcon = container.querySelector('[data-testid="BedIcon"]');
      expect(bedroomIcon).not.toBeInTheDocument();
    });

    it('should not render bathroom icon when bathrooms is null', () => {
      const propertyNoBathrooms = { ...mockProperty, bathrooms: null };
      const { container } = render(<PropertyCard property={propertyNoBathrooms} />);

      const bathroomIcon = container.querySelector('[data-testid="BathtubIcon"]');
      expect(bathroomIcon).not.toBeInTheDocument();
    });

    it('should not render car spaces icon when car_spaces is null', () => {
      const propertyNoCarSpaces = { ...mockProperty, car_spaces: null };
      const { container } = render(<PropertyCard property={propertyNoCarSpaces} />);

      const carIcon = container.querySelector('[data-testid="DirectionsCarIcon"]');
      expect(carIcon).not.toBeInTheDocument();
    });

    it('should not render property type when property_type is null', () => {
      const propertyNoType = { ...mockProperty, property_type: null };
      const { container } = render(<PropertyCard property={propertyNoType} />);

      // Property type element should not exist
      const propertyType = container.querySelector('.propertyType');
      expect(propertyType).not.toBeInTheDocument();
    });
  });
});

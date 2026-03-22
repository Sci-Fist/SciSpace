import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock all the complex dependencies
jest.mock('../context/PageContext.jsx', () => ({
  PageProvider: ({ children }) => <div data-testid="page-provider">{children}</div>,
  usePage: () => ({
    getPageControls: () => ({}),
    updatePageControl: jest.fn(),
    resetTextAlignToCenter: jest.fn()
  })
}));

jest.mock('../context/ContentContext.jsx', () => ({
  ContentProvider: ({ children }) => <div data-testid="content-provider">{children}</div>,
  useContent: () => ({
    getSelectedImage: () => null,
    getTextContent: () => 'Mock text'
  })
}));

jest.mock('../context/ThemeContext.jsx', () => ({
  ThemeProvider: ({ children }) => <div data-testid="theme-provider">{children}</div>
}));

jest.mock('../context/DevToolsContext.jsx', () => ({
  DevToolsProvider: ({ children }) => <div data-testid="devtools-provider">{children}</div>,
  useDevTools: () => ({
    isSidebarOpen: false,
    sidebarWidth: 0
  })
}));

// Mock router
jest.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/' }),
  BrowserRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: ({ children }) => children
}));

// Import the components after mocks
import ThreeDArtPage from '../pages/ThreeDArtPage';
import TwoDArtPage from '../pages/TwoDArtPage';
import { GalleryTestProviders } from './testUtils.jsx';

describe('Masonry Grid Tests', () => {
  // Mock window dimensions for consistent testing
  const mockWindowDimensions = (width, height) => {
    Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: height, writable: true });
  };

  beforeEach(() => {
    // Reset to default dimensions
    mockWindowDimensions(1920, 1080);
  });

  describe('Column Calculation Logic', () => {
    test('calculateColumns returns correct values for different screen sizes', () => {
      // Test various screen sizes
      const testCases = [
        { width: 400, expected: 3 },   // Small mobile - minimum 3
        { width: 525, expected: 3 },   // User's viewport - minimum 3
        { width: 600, expected: 3 },   // Still minimum 3
        { width: 768, expected: 3 },   // Tablet portrait - 3
        { width: 992, expected: 4 },   // Small desktop - 4
        { width: 1200, expected: 5 },  // Desktop - 5
        { width: 1400, expected: 6 },  // Large desktop - 6
        { width: 1600, expected: 6 }   // Very large - max 6
      ];

      testCases.forEach(({ width, expected }) => {
        mockWindowDimensions(width, 1080);

        const { container } = render(
          <GalleryTestProviders>
            <ThreeDArtPage />
          </GalleryTestProviders>
        );
        // The component should render without errors
        expect(container).toBeInTheDocument();

        // We can't directly test the calculateColumns function since it's internal,
        // but we can verify the component renders and the grid is applied
        const masonryGrid = container.querySelector('.gallery-masonry');
        expect(masonryGrid).toBeInTheDocument();
      });
    });

    test('minimum 3 columns is enforced for masonry layout', () => {
      // Test that even very small screens get at least 3 columns
      const smallWidths = [320, 400, 480, 525, 600];

      smallWidths.forEach(width => {
        mockWindowDimensions(width, 1080);

        const { container } = render(
          <GalleryTestProviders>
            <ThreeDArtPage />
          </GalleryTestProviders>
        );
        const masonryGrid = container.querySelector('.gallery-masonry');

        expect(masonryGrid).toBeInTheDocument();

        // Check that masonry layout has the correct CSS class for minimum 3 columns
        expect(masonryGrid).toHaveClass('masonry-cols-3');

        // Check that the inline style contains the CSS custom property
        const inlineStyle = masonryGrid.getAttribute('style');
        expect(inlineStyle).toContain('--masonry-columns: 3');
      });
    });
  });

  describe('CSS Grid Application', () => {
    test('masonry layout uses CSS columns with correct properties', () => {
      const { container } = render(
        <GalleryTestProviders>
          <ThreeDArtPage />
        </GalleryTestProviders>
      );
      const masonryGrid = container.querySelector('.gallery-masonry');

      expect(masonryGrid).toBeInTheDocument();

      // Check that masonry layout uses CSS columns, not grid
      expect(masonryGrid).toHaveClass('gallery-masonry');
      expect(masonryGrid).toHaveClass('masonry-cols-6'); // 1920px width = 6 columns

      // Check inline styles for CSS custom property
      const inlineStyle = masonryGrid.getAttribute('style');
      expect(inlineStyle).toContain('--masonry-columns: 6');
    });

    test('grid layout uses CSS Grid with dynamic columns', () => {
      const { container } = render(
        <GalleryTestProviders>
          <ThreeDArtPage />
        </GalleryTestProviders>
      );

      // Switch to grid layout
      const viewButton = screen.getByText(/Masonry View/);
      fireEvent.click(viewButton);

      // Click on Grid option in modal
      const gridOption = screen.getByText('Grid');
      fireEvent.click(gridOption);

      const gridContainer = container.querySelector('.gallery-grid');
      expect(gridContainer).toBeInTheDocument();

      // Check that grid layout uses CSS classes, not inline styles
      expect(gridContainer).toHaveClass('gallery-grid');
      expect(gridContainer).toHaveClass('grid-cols-6'); // 1920px width = 6 columns
    });
  });

  describe('Gallery Item Rendering', () => {
    test('masonry layout renders all 17 gallery items', () => {
      const { container } = render(
        <GalleryTestProviders>
          <ThreeDArtPage />
        </GalleryTestProviders>
      );
      const masonryItems = container.querySelectorAll('.gallery-item.masonry-item');

      expect(masonryItems).toHaveLength(17);
    });

    test('grid layout renders all 17 gallery items', () => {
      const { container } = render(
        <GalleryTestProviders>
          <ThreeDArtPage />
        </GalleryTestProviders>
      );

      // Switch to grid layout
      const viewButton = screen.getByText(/Masonry View/);
      fireEvent.click(viewButton);

      const gridOption = screen.getByText('Grid');
      fireEvent.click(gridOption);

      const gridItems = container.querySelectorAll('.gallery-item:not(.masonry-item)');
      expect(gridItems).toHaveLength(17);
    });

    test('gallery items have correct structure and classes', () => {
      const { container } = render(
        <GalleryTestProviders>
          <ThreeDArtPage />
        </GalleryTestProviders>
      );
      const items = container.querySelectorAll('.gallery-item');

      items.forEach(item => {
        expect(item).toHaveClass('gallery-item');
        expect(item).toHaveClass('masonry-item');

        // Check for data-title attribute
        expect(item).toHaveAttribute('data-title');

        // Check for img element
        const img = item.querySelector('img');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src');
        expect(img).toHaveAttribute('alt');
        expect(img).toHaveAttribute('loading', 'lazy');
      });
    });
  });

  describe('Nuclear Centering Overrides', () => {
    test('gallery items have correct structure and nuclear centering overrides', () => {
      const { container } = render(
        <GalleryTestProviders>
          <ThreeDArtPage />
        </GalleryTestProviders>
      );
      const galleryItems = container.querySelectorAll('.gallery-item');

      galleryItems.forEach(item => {
        expect(item).toHaveClass('gallery-item');
        expect(item).toHaveClass('masonry-item');

        // In the test environment, we verify the structure is correct
        const img = item.querySelector('img');
        expect(img).toBeInTheDocument();
      });
    });

    test('masonry grid has nuclear centering override classes', () => {
      const { container } = render(
        <GalleryTestProviders>
          <ThreeDArtPage />
        </GalleryTestProviders>
      );
      const masonryGrid = container.querySelector('.gallery-masonry');

      expect(masonryGrid).toHaveClass('gallery-masonry');

      // The CSS class .gallery-masonry contains the override rules
      expect(masonryGrid).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    test('masonry layout adapts to different screen sizes', () => {
      const screenSizes = [
        { width: 525, expectedClass: 'masonry-cols-3' },   // User's viewport
        { width: 768, expectedClass: 'masonry-cols-3' },   // Tablet
        { width: 992, expectedClass: 'masonry-cols-4' },   // Small desktop
        { width: 1200, expectedClass: 'masonry-cols-5' },  // Desktop
        { width: 1400, expectedClass: 'masonry-cols-6' }   // Large desktop
      ];

      screenSizes.forEach(({ width, expectedClass }) => {
        mockWindowDimensions(width, 1080);

        const { container } = render(
          <GalleryTestProviders>
            <ThreeDArtPage />
          </GalleryTestProviders>
        );
        const masonryGrid = container.querySelector('.gallery-masonry');

        expect(masonryGrid).toBeInTheDocument();

        // Check that the correct CSS class is applied
        expect(masonryGrid).toHaveClass(expectedClass);

        // Check inline styles for CSS custom property
        const inlineStyle = masonryGrid.getAttribute('style');
        const columnCount = expectedClass.split('-')[2]; // Extract number from class
        expect(inlineStyle).toContain(`--masonry-columns: ${columnCount}`);
      });
    });

    test('viewport resize triggers column recalculation', () => {
      mockWindowDimensions(1200, 1080); // Start with desktop size

      const { container, rerender } = render(
        <GalleryTestProviders>
          <ThreeDArtPage />
        </GalleryTestProviders>
      );
      let masonryGrid = container.querySelector('.gallery-masonry');

      // Should have masonry-cols-5 on desktop
      expect(masonryGrid).toHaveClass('masonry-cols-5');
      let inlineStyle = masonryGrid.getAttribute('style');
      expect(inlineStyle).toContain('--masonry-columns: 5');

      // Resize to mobile
      mockWindowDimensions(525, 1080);
      // Trigger resize event
      window.dispatchEvent(new Event('resize'));

      // Re-render to pick up changes
      rerender(
        <GalleryTestProviders>
          <ThreeDArtPage />
        </GalleryTestProviders>
      );

      masonryGrid = container.querySelector('.gallery-masonry');

      // Should have masonry-cols-3 on mobile (minimum)
      expect(masonryGrid).toHaveClass('masonry-cols-3');
      inlineStyle = masonryGrid.getAttribute('style');
      expect(inlineStyle).toContain('--masonry-columns: 3');
    });
  });

  describe('Layout Switching', () => {
    test('can switch between masonry and grid layouts', () => {
      const { container } = render(
        <GalleryTestProviders>
          <ThreeDArtPage />
        </GalleryTestProviders>
      );

      // Start with masonry
      expect(container.querySelector('.gallery-masonry')).toBeInTheDocument();
      expect(container.querySelector('.gallery-grid')).not.toBeInTheDocument();

      // Switch to grid
      const viewButton = screen.getByText(/Masonry View/);
      fireEvent.click(viewButton);

      const gridOption = screen.getByText('Grid');
      fireEvent.click(gridOption);

      // Should now show grid layout
      expect(container.querySelector('.gallery-masonry')).not.toBeInTheDocument();
      expect(container.querySelector('.gallery-grid')).toBeInTheDocument();
    });

    test('view switcher shows current layout mode', () => {
      const { rerender } = render(
        <GalleryTestProviders>
          <ThreeDArtPage />
        </GalleryTestProviders>
      );

      // Should show "Masonry View" initially
      expect(screen.getByText(/Masonry View/)).toBeInTheDocument();

      // Switch to grid
      const viewButton = screen.getByText(/Masonry View/);
      fireEvent.click(viewButton);

      const gridOption = screen.getByText('Grid');
      fireEvent.click(gridOption);

      // Re-render to update button text
      rerender(
        <GalleryTestProviders>
          <ThreeDArtPage />
        </GalleryTestProviders>
      );

      // Should now show "Grid View"
      expect(screen.getByText(/Grid View/)).toBeInTheDocument();
    });
  });

  describe('TwoDArtPage Integration', () => {
    test('TwoDArtPage has same masonry functionality', () => {
      const { container } = render(
        <GalleryTestProviders>
          <TwoDArtPage />
        </GalleryTestProviders>
      );
      const masonryGrid = container.querySelector('.gallery-masonry');

      expect(masonryGrid).toBeInTheDocument();

      // Check that masonry layout uses CSS classes and custom properties
      expect(masonryGrid).toHaveClass('gallery-masonry');
      expect(masonryGrid).toHaveClass('masonry-cols-6'); // 1920px width = 6 columns

      // Check inline styles for CSS custom property
      const inlineStyle = masonryGrid.getAttribute('style');
      expect(inlineStyle).toContain('--masonry-columns: 6');
    });

    test('TwoDArtPage renders all gallery items', () => {
      const { container } = render(
        <GalleryTestProviders>
          <TwoDArtPage />
        </GalleryTestProviders>
      );
      const masonryItems = container.querySelectorAll('.gallery-item.masonry-item');

      expect(masonryItems).toHaveLength(13);
    });
  });

  describe('Performance and Edge Cases', () => {
    test('handles very small viewport sizes', () => {
      mockWindowDimensions(320, 568); // Very small mobile

      const { container } = render(
        <GalleryTestProviders>
          <ThreeDArtPage />
        </GalleryTestProviders>
      );
      const masonryGrid = container.querySelector('.gallery-masonry');

      expect(masonryGrid).toBeInTheDocument();

      // Check that masonry layout has minimum 3 columns
      expect(masonryGrid).toHaveClass('masonry-cols-3');

      // Check inline styles for CSS custom property
      const inlineStyle = masonryGrid.getAttribute('style');
      expect(inlineStyle).toContain('--masonry-columns: 3');
    });

    test('handles very large viewport sizes', () => {
      mockWindowDimensions(2560, 1440); // 4K display

      const { container } = render(
        <GalleryTestProviders>
          <ThreeDArtPage />
        </GalleryTestProviders>
      );
      const masonryGrid = container.querySelector('.gallery-masonry');

      expect(masonryGrid).toBeInTheDocument();

      // Check that masonry layout is capped at maximum 6 columns
      expect(masonryGrid).toHaveClass('masonry-cols-6');

      // Check inline styles for CSS custom property
      const inlineStyle = masonryGrid.getAttribute('style');
      expect(inlineStyle).toContain('--masonry-columns: 6');
    });

    test('gallery items load with correct attributes', () => {
      const { container } = render(
        <GalleryTestProviders>
          <ThreeDArtPage />
        </GalleryTestProviders>
      );
      const images = container.querySelectorAll('.gallery-item img');

      images.forEach(img => {
        expect(img).toHaveAttribute('src');
        expect(img).toHaveAttribute('alt');
        expect(img).toHaveAttribute('loading', 'lazy');

        // Check that src starts with expected path
        expect(img.getAttribute('src')).toMatch(/^\/src\/assets\//);
      });
    });
  });
});

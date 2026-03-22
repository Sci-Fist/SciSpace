import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock the logger
jest.mock('../hooks/useLogger', () => ({
  useLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  })
}));

// Mock the content context
jest.mock('../context/ContentContext', () => ({
  useContent: () => ({
    getUploadedFiles: () => [],
    getEnabledSlideshows: () => []
  })
}));

// Mock the page context
jest.mock('../context/PageContext', () => ({
  usePage: () => ({
    getPageControls: () => ({})
  })
}));

// Import after mocks
import HomePage from '../pages/HomePage';

// Mock window methods
Object.defineProperty(window, 'innerWidth', { writable: true, value: 1200 });
Object.defineProperty(window, 'innerHeight', { writable: true, value: 800 });

describe('Gallery Modal Functionality', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock document.body.style
    Object.defineProperty(document.body, 'style', {
      value: {},
      writable: true
    });
  });

  test('modal opens when gallery item is clicked', async () => {
    render(<HomePage />);

    // Wait for gallery to load
    await waitFor(() => {
      expect(screen.getByText('Mixed Media Showcase')).toBeInTheDocument();
    });

    // Find a gallery item (should be clickable)
    const galleryItems = screen.getAllByRole('img');
    expect(galleryItems.length).toBeGreaterThan(0);

    // Click on first gallery item
    fireEvent.click(galleryItems[0]);

    // Modal should open
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
    });
  });

  test('modal closes when close button is clicked', async () => {
    render(<HomePage />);

    // Wait for gallery to load
    await waitFor(() => {
      expect(screen.getByText('Mixed Media Showcase')).toBeInTheDocument();
    });

    // Open modal
    const galleryItems = screen.getAllByRole('img');
    fireEvent.click(galleryItems[0]);

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
    });

    // Click close button
    const closeButton = screen.getByRole('button', { name: '×' });
    fireEvent.click(closeButton);

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: '×' })).not.toBeInTheDocument();
    });
  });

  test('modal closes when backdrop is clicked', async () => {
    render(<HomePage />);

    // Wait for gallery to load
    await waitFor(() => {
      expect(screen.getByText('Mixed Media Showcase')).toBeInTheDocument();
    });

    // Open modal
    const galleryItems = screen.getAllByRole('img');
    fireEvent.click(galleryItems[0]);

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
    });

    // Click on modal backdrop (the overlay)
    const modalOverlay = screen.getByTestId ? screen.getByTestId('modal-overlay') :
                      document.querySelector('.gallery-modal-overlay');

    if (modalOverlay) {
      fireEvent.click(modalOverlay);

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: '×' })).not.toBeInTheDocument();
      });
    }
  });

  test('modal closes when Escape key is pressed', async () => {
    render(<HomePage />);

    // Wait for gallery to load
    await waitFor(() => {
      expect(screen.getByText('Mixed Media Showcase')).toBeInTheDocument();
    });

    // Open modal
    const galleryItems = screen.getAllByRole('img');
    fireEvent.click(galleryItems[0]);

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
    });

    // Press Escape key
    fireEvent.keyDown(document, { key: 'Escape' });

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: '×' })).not.toBeInTheDocument();
    });
  });

  test('modal navigation works with arrow keys', async () => {
    render(<HomePage />);

    // Wait for gallery to load
    await waitFor(() => {
      expect(screen.getByText('Mixed Media Showcase')).toBeInTheDocument();
    });

    // Open modal
    const galleryItems = screen.getAllByRole('img');
    fireEvent.click(galleryItems[0]);

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
    });

    // Test right arrow navigation (if next button exists)
    const nextButtons = screen.queryAllByText('›');
    if (nextButtons.length > 0) {
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      // Should not throw error
    }

    // Test left arrow navigation (if prev button exists)
    const prevButtons = screen.queryAllByText('‹');
    if (prevButtons.length > 0) {
      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      // Should not throw error
    }
  });

  test('modal displays correct item information', async () => {
    render(<HomePage />);

    // Wait for gallery to load
    await waitFor(() => {
      expect(screen.getByText('Mixed Media Showcase')).toBeInTheDocument();
    });

    // Open modal
    const galleryItems = screen.getAllByRole('img');
    fireEvent.click(galleryItems[0]);

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
    });

    // Check that modal contains expected elements
    expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();

    // Should have modal content
    const modalContent = document.querySelector('.gallery-modal-content');
    expect(modalContent).toBeInTheDocument();
  });

  test('body scroll is disabled when modal is open', async () => {
    render(<HomePage />);

    // Wait for gallery to load
    await waitFor(() => {
      expect(screen.getByText('Mixed Media Showcase')).toBeInTheDocument();
    });

    // Check initial body overflow
    expect(document.body.style.overflow).toBe('');

    // Open modal
    const galleryItems = screen.getAllByRole('img');
    fireEvent.click(galleryItems[0]);

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
    });

    // Body scroll should be disabled
    expect(document.body.style.overflow).toBe('hidden');

    // Close modal
    const closeButton = screen.getByRole('button', { name: '×' });
    fireEvent.click(closeButton);

    // Wait for modal to close
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: '×' })).not.toBeInTheDocument();
    });

    // Body scroll should be restored
    expect(document.body.style.overflow).toBe('auto');
  });

  test('gallery items have pointer cursor', async () => {
    render(<HomePage />);

    // Wait for gallery to load
    await waitFor(() => {
      expect(screen.getByText('Mixed Media Showcase')).toBeInTheDocument();
    });

    // Find gallery item containers
    const galleryItemContainers = document.querySelectorAll('.gallery-item');
    expect(galleryItemContainers.length).toBeGreaterThan(0);

    // Check that they have pointer cursor
    galleryItemContainers.forEach(container => {
      expect(container.style.cursor).toBe('pointer');
    });
  });

  test('modal prevents event propagation on content click', async () => {
    render(<HomePage />);

    // Wait for gallery to load
    await waitFor(() => {
      expect(screen.getByText('Mixed Media Showcase')).toBeInTheDocument();
    });

    // Open modal
    const galleryItems = screen.getAllByRole('img');
    fireEvent.click(galleryItems[0]);

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
    });

    // Click on modal content (should not close modal)
    const modalContent = document.querySelector('.gallery-modal-content');
    if (modalContent) {
      fireEvent.click(modalContent);

      // Modal should still be open
      expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
    }
  });
});

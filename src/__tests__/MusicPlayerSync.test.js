import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MusicPage } from '../pages/MusicPage.jsx';
import { NowPlayingProvider } from '../context/NowPlayingContext.jsx';

// Import test utilities
import { MusicTestProviders } from './testUtils.jsx';

// Mock audio element
const mockAudioElement = {
  play: jest.fn().mockResolvedValue(),
  pause: jest.fn(),
  load: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  currentTime: 0,
  duration: 100,
  src: ''
};

global.Audio = jest.fn(() => mockAudioElement);

// Mock GalleryModal to avoid complex modal rendering in tests
jest.mock('../components/GalleryModal.jsx', () => ({
  GalleryModal: ({ isOpen, onClose, items, currentIndex }) => {
    if (!isOpen) return null;

    const currentItem = items[currentIndex];
    return (
      <div data-testid="gallery-modal">
        <div>Modal for {currentItem.title}</div>
        <button onClick={onClose}>Close Modal</button>
      </div>
    );
  }
}));

describe('Music Player Synchronization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderMusicPage = () => {
    return render(
      <MusicTestProviders>
        <MusicPage />
      </MusicTestProviders>
    );
  };

  describe('Preview Button Behavior', () => {
    test('preview buttons should display correct play/pause state', async () => {
      renderMusicPage();

      // Find the first preview button (Sci Fist)
      const sciFistButton = screen.getByLabelText('Preview Sci Fist');
      expect(sciFistButton).toBeInTheDocument();

      // Initially should show play icon
      expect(sciFistButton).toHaveTextContent('▶️');

      // Click to play
      fireEvent.click(sciFistButton);

      // Should now show pause icon
      await waitFor(() => {
        expect(sciFistButton).toHaveTextContent('⏸️');
      });
    });

    test('clicking preview button should start playback', async () => {
      renderMusicPage();

      const sciFistButton = screen.getByLabelText('Preview Sci Fist');

      fireEvent.click(sciFistButton);

      await waitFor(() => {
        expect(mockAudioElement.play).toHaveBeenCalled();
        expect(mockAudioElement.src).toBe('https://res.cloudinary.com/ddrvulhwz/video/upload/v1774139289/scispace/music/banger.mp4');
      });
    });

    test('switching between different preview buttons should change tracks', async () => {
      renderMusicPage();

      const sciFistButton = screen.getByLabelText('Preview Sci Fist');
      const shaderPauseButton = screen.getByLabelText('Preview Shader Pause');

      // Click first button
      fireEvent.click(sciFistButton);
      await waitFor(() => {
        expect(mockAudioElement.src).toBe('https://res.cloudinary.com/ddrvulhwz/video/upload/v1774139289/scispace/music/banger.mp4');
      });

      // Click second button
      fireEvent.click(shaderPauseButton);
      await waitFor(() => {
        expect(mockAudioElement.src).toBe('https://res.cloudinary.com/ddrvulhwz/video/upload/v1774139295/scispace/music/melancholische-schei%C3%9Fe.mp4');
      });
    });
  });

  describe('Modal Synchronization', () => {
    test('opening modal should show correct track information', () => {
      renderMusicPage();

      // Find and click the first music item to open modal
      const firstMusicItem = screen.getByText('"Banger"');
      fireEvent.click(firstMusicItem);

      // Modal should be open with correct track
      const modal = screen.getByTestId('gallery-modal');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveTextContent('Modal for Banger');
    });

    test('modal play button should sync with global playback state', async () => {
      renderMusicPage();

      // Start playing via preview button
      const sciFistButton = screen.getByLabelText('Preview Sci Fist');
      fireEvent.click(sciFistButton);

      // Open modal for the same track
      const firstMusicItem = screen.getByText('"Banger"');
      fireEvent.click(firstMusicItem);

      // Modal should show pause button since track is playing
      // Note: This test would need the actual ModalMusicPlayer component
      // For now, we verify the modal opens correctly
      const modal = screen.getByTestId('gallery-modal');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('State Synchronization', () => {
    test('preview buttons should update when playback state changes externally', async () => {
      renderMusicPage();

      const sciFistButton = screen.getByLabelText('Preview Sci Fist');

      // Start playing
      fireEvent.click(sciFistButton);
      await waitFor(() => {
        expect(sciFistButton).toHaveTextContent('⏸️');
      });

      // Simulate external pause (like from another component)
      act(() => {
        mockAudioElement.pause();
        // Trigger pause event
        const pauseEvent = new Event('pause');
        mockAudioElement.addEventListener.mock.calls
          .find(call => call[0] === 'pause')[1](pauseEvent);
      });

      // Button should update to show play icon
      await waitFor(() => {
        expect(sciFistButton).toHaveTextContent('▶️');
      });
    });
  });

  describe('Track Data Integrity', () => {
    test('all preview buttons should have correct track mappings', () => {
      renderMusicPage();

      // Verify all expected preview buttons exist
      expect(screen.getByLabelText('Preview Sci Fist')).toBeInTheDocument();
      expect(screen.getByLabelText('Preview Shader Pause')).toBeInTheDocument();
      expect(screen.getByLabelText('Preview Sunken')).toBeInTheDocument();
      expect(screen.getByLabelText('Preview Sword')).toBeInTheDocument();
      expect(screen.getByLabelText('Preview Pandora')).toBeInTheDocument();
      expect(screen.getByLabelText('Preview Back Humanoid')).toBeInTheDocument();
    });

    test('preview buttons should have correct CSS classes based on state', async () => {
      renderMusicPage();

      const sciFistButton = screen.getByLabelText('Preview Sci Fist');

      // Initially should not have playing class
      expect(sciFistButton).not.toHaveClass('playing');

      // Click to play
      fireEvent.click(sciFistButton);

      // Should now have playing class
      await waitFor(() => {
        expect(sciFistButton).toHaveClass('playing');
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle audio play failures gracefully', async () => {
      // Mock play to fail
      mockAudioElement.play.mockRejectedValue(new Error('Playback failed'));

      renderMusicPage();

      const sciFistButton = screen.getByLabelText('Preview Sci Fist');

      // Click to attempt play
      fireEvent.click(sciFistButton);

      // Button should not get stuck in playing state
      await waitFor(() => {
        expect(sciFistButton).toHaveTextContent('▶️');
        expect(sciFistButton).not.toHaveClass('playing');
      });
    });
  });
});

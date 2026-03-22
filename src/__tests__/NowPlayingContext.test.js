import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { NowPlayingProvider, useNowPlaying } from '../context/NowPlayingContext.jsx';

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

// Mock the audio constructor
global.Audio = jest.fn(() => mockAudioElement);

// Test component that uses the context
function TestComponent({ onContext }) {
  const context = useNowPlaying();
  React.useEffect(() => {
    onContext(context);
  }, [context, onContext]);
  return null;
}

describe('NowPlayingContext', () => {
  let mockContext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockContext = null;
  });

  const renderWithProvider = (component) => {
    return render(
      <NowPlayingProvider>
        {component}
      </NowPlayingProvider>
    );
  };

  const getContext = () => {
    let contextValue;
    renderWithProvider(
      <TestComponent onContext={(ctx) => { contextValue = ctx; }} />
    );
    return contextValue;
  };

  describe('Initial State', () => {
    test('should initialize with correct default state', () => {
      const context = getContext();

      expect(context.currentTrack).toBeNull();
      expect(context.isNotificationVisible).toBe(false);
      expect(context.isPlaying).toBe(false);
      expect(context.currentTime).toBe(0);
      expect(context.duration).toBe(0);
      expect(context.audioRef.current).toBe(mockAudioElement);
    });
  });

  describe('playTrack', () => {
    test('should load and play a new track', async () => {
      const context = getContext();
      const track = { title: 'Test Track', category: 'Music', albumCover: 'test.jpg' };
      const audioSrc = '/test/audio.mp3';

      await act(async () => {
        context.playTrack(track, audioSrc);
      });

      expect(mockAudioElement.src).toBe(audioSrc);
      expect(mockAudioElement.load).toHaveBeenCalled();
      expect(mockAudioElement.play).toHaveBeenCalled();
      expect(context.currentTrack).toEqual(track);
    });

    test('should switch tracks when different track is requested', async () => {
      const context = getContext();

      const track1 = { title: 'Track 1', category: 'Music', albumCover: 'track1.jpg' };
      const track2 = { title: 'Track 2', category: 'Music', albumCover: 'track2.jpg' };

      // Play first track
      await act(async () => {
        context.playTrack(track1, '/audio1.mp3');
      });

      // Play second track
      await act(async () => {
        context.playTrack(track2, '/audio2.mp3');
      });

      expect(mockAudioElement.src).toBe('/audio2.mp3');
      expect(mockAudioElement.load).toHaveBeenCalledTimes(2);
      expect(context.currentTrack).toEqual(track2);
    });

    test('should resume same track without reloading', async () => {
      const context = getContext();
      const track = { title: 'Test Track', category: 'Music', albumCover: 'test.jpg' };

      // Play track first time
      await act(async () => {
        context.playTrack(track, '/test/audio.mp3');
      });

      // Reset mocks to check second call
      jest.clearAllMocks();

      // Play same track again
      await act(async () => {
        context.playTrack(track, '/test/audio.mp3');
      });

      // Should not reload audio
      expect(mockAudioElement.load).not.toHaveBeenCalled();
      expect(mockAudioElement.play).toHaveBeenCalledTimes(1);
    });
  });

  describe('togglePlayPause', () => {
    test('should pause when playing', async () => {
      const context = getContext();

      // Set up playing state
      await act(async () => {
        const track = { title: 'Test Track', category: 'Music', albumCover: 'test.jpg' };
        context.playTrack(track, '/test/audio.mp3');
      });

      // Toggle to pause
      act(() => {
        context.togglePlayPause();
      });

      expect(mockAudioElement.pause).toHaveBeenCalled();
    });

    test('should play when paused with loaded track', async () => {
      const context = getContext();

      // Load a track first
      await act(async () => {
        const track = { title: 'Test Track', category: 'Music', albumCover: 'test.jpg' };
        context.playTrack(track, '/test/audio.mp3');
      });

      // Pause it
      act(() => {
        context.pauseTrack();
      });

      // Reset play mock
      mockAudioElement.play.mockClear();

      // Toggle back to play
      await act(async () => {
        context.togglePlayPause();
      });

      expect(mockAudioElement.play).toHaveBeenCalled();
    });

    test('should do nothing when no track is loaded', () => {
      const context = getContext();

      act(() => {
        context.togglePlayPause();
      });

      expect(mockAudioElement.play).not.toHaveBeenCalled();
      expect(mockAudioElement.pause).not.toHaveBeenCalled();
    });
  });

  describe('seekTo', () => {
    test('should seek to specified time', () => {
      const context = getContext();

      act(() => {
        context.seekTo(50);
      });

      expect(mockAudioElement.currentTime).toBe(50);
    });
  });

  describe('showNowPlaying and hideNowPlaying', () => {
    test('should show and hide notification', () => {
      const context = getContext();
      const track = { title: 'Test Track', category: 'Music', albumCover: 'test.jpg' };

      act(() => {
        context.showNowPlaying(track);
      });

      expect(context.isNotificationVisible).toBe(true);
      expect(context.currentTrack).toEqual(track);

      act(() => {
        context.hideNowPlaying();
      });

      expect(context.isNotificationVisible).toBe(false);
      // Track is cleared after timeout, but we can't easily test that
    });
  });

  describe('Error Handling', () => {
    test('should handle play promise rejection', async () => {
      const context = getContext();
      const track = { title: 'Test Track', category: 'Music', albumCover: 'test.jpg' };

      // Mock play to reject
      mockAudioElement.play.mockRejectedValue(new Error('Play failed'));

      await act(async () => {
        context.playTrack(track, '/test/audio.mp3');
      });

      // Should still set playing to false on error
      expect(context.isPlaying).toBe(false);
    });
  });

  describe('useNowPlaying Hook', () => {
    test('should throw error when used outside provider', () => {
      // Mock console.error to avoid test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent onContext={() => {}} />);
      }).toThrow('useNowPlaying must be used within a NowPlayingProvider');

      consoleSpy.mockRestore();
    });
  });
});

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

// Global tracks data - available across the entire app
const GLOBAL_TRACKS = [
  {
    src: "https://res.cloudinary.com/ddrvulhwz/video/upload/v1774139289/scispace/music/banger.mp4",
    alt: "Banger - Electronic Track",
    title: "Banger",
    category: "Music",
    description: "Genre: Electronic | Mood: Energetic, Driving",
    isAudio: true,
    albumCover: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139229/scispace/media/glassesroompostpc1.png",
    type: "audio"
  },
  {
    src: "https://res.cloudinary.com/ddrvulhwz/video/upload/v1774139290/scispace/music/blaaaaaaaaaaa.mp4",
    alt: "Blaaaaaaaa - Ambient Track",
    title: "Blaaaaaaaa",
    category: "Music",
    description: "Genre: Ambient | Mood: Atmospheric, Experimental",
    isAudio: true,
    albumCover: "/src/assets/photography/Sushi-2.jpg",
    type: "audio"
  },
  {
    src: "https://res.cloudinary.com/ddrvulhwz/video/upload/v1774139295/scispace/music/melancholische-schei%C3%9Fe.mp4",
    alt: "Melancholische Scheiße - Ambient Track",
    title: "Melancholische Scheiße",
    category: "Music",
    description: "Genre: Ambient | Mood: Melancholic, Reflective",
    isAudio: true,
    albumCover: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139240/scispace/media/shader_pause.jpg",
    type: "audio"
  },
  {
    src: "https://res.cloudinary.com/ddrvulhwz/video/upload/v1774139309/scispace/music/strangev2-1.wav",
    alt: "Strange V2-1 - Experimental Track",
    title: "Strange V2-1",
    category: "Music",
    description: "Genre: Experimental | Mood: Abstract, Unconventional",
    isAudio: true,
    albumCover: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139238/scispace/media/sci_fist.jpg",
    type: "audio"
  },
  {
    src: "https://res.cloudinary.com/ddrvulhwz/video/upload/v1774139322/scispace/music/strangev2.wav",
    alt: "Strange V2 - Experimental Track",
    title: "Strange V2",
    category: "Music",
    description: "Genre: Experimental | Mood: Abstract, Unconventional",
    isAudio: true,
    albumCover: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139238/scispace/media/sci_fist.jpg",
    type: "audio"
  },
  {
    src: "https://res.cloudinary.com/ddrvulhwz/video/upload/v1774139292/scispace/music/chronic-stress-syndrom.mp3",
    alt: "Chronic Stress Syndrom - Ambient Track",
    title: "Chronic Stress Syndrom",
    category: "Music",
    description: "Genre: Ambient | Mood: Atmospheric, Meditative",
    isAudio: true,
    albumCover: "/src/assets/photography/Sushi-1.jpg",
    type: "audio"
  },
  {
    src: "https://res.cloudinary.com/ddrvulhwz/video/upload/v1774139294/scispace/music/idee1.mp3",
    alt: "Idee1 - Experimental Track",
    title: "Idee1",
    category: "Music",
    description: "Genre: Experimental | Mood: Abstract, Conceptual",
    isAudio: true,
    albumCover: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139219/scispace/media/backhumanoid.png",
    type: "audio"
  },
  {
    src: "https://res.cloudinary.com/ddrvulhwz/video/upload/v1774139297/scispace/music/still.mp3",
    alt: "Still - Ambient Track",
    title: "Still",
    category: "Music",
    description: "Genre: Ambient | Mood: Calm, Serene",
    isAudio: true,
    albumCover: "/src/assets/photography/01090055.jpg",
    type: "audio"
  }
];

/**
 * NowPlayingContext - Global audio player state management
 *
 * This context provides centralized audio playback functionality across the entire application.
 * It manages a single global audio element and synchronizes playback state between
 * preview buttons, modals, and notification components.
 *
 * Key Features:
 * - Single global audio element for consistent playback
 * - Track switching with proper state management
 * - Real-time playback synchronization
 * - Comprehensive logging for debugging
 * - Error handling and recovery
 */
const NowPlayingContext = createContext();

/**
 * NowPlayingProvider - Context provider for global audio playback
 *
 * Manages the global audio state and provides methods for controlling playback.
 * Ensures only one audio track plays at a time across the entire application.
 */
export function NowPlayingProvider({ children }) {
  // Core playback state
  const [currentTrack, setCurrentTrack] = useState(null); // Currently loaded track info
  const [isNotificationVisible, setIsNotificationVisible] = useState(false); // Now playing notification visibility
  const [isPlaying, setIsPlaying] = useState(false); // Global playing state
  const [currentTime, setCurrentTime] = useState(0); // Current playback position
  const [duration, setDuration] = useState(0); // Total track duration
  const [tracks, setTracks] = useState([]); // Available tracks for navigation

  // Global audio element reference
  const audioRef = useRef(null);

  // Initialize global tracks on mount
  useEffect(() => {
    console.log('🎵 Initializing global tracks:', GLOBAL_TRACKS.length, 'tracks');
    setTracks(GLOBAL_TRACKS);
  }, []);

  /**
   * Shows the now playing notification with track information
   * @param {Object} track - Track object with title, category, albumCover
   */
  const showNowPlaying = useCallback((track) => {
    console.log('🎵 Showing now playing notification:', track?.title);
    setCurrentTrack(track);
    setIsNotificationVisible(true);
  }, []);

  /**
   * Hides the now playing notification with animation delay
   */
  const hideNowPlaying = useCallback(() => {
    console.log('🎵 Hiding now playing notification');
    setIsNotificationVisible(false);
    // Clear track after animation completes (300ms)
    setTimeout(() => {
      setCurrentTrack(null);
      console.log('🎵 Track cleared from state');
    }, 300);
  }, []);

  /**
   * Plays a specific track, handling track switching if necessary
   * @param {Object} track - Track object with title, category, albumCover
   * @param {string} audioSrc - Audio file source URL
   */
  const playTrack = useCallback((track, audioSrc) => {
    console.log('🎵 playTrack called:', {
      trackTitle: track?.title,
      audioSrc,
      currentTrackTitle: currentTrack?.title,
      isDifferentTrack: !currentTrack || currentTrack.title !== track.title
    });

    // If different track or no current track, load new audio
    if (!currentTrack || currentTrack.title !== track.title) {
      console.log('🎵 Loading new track:', track.title);
      if (audioRef.current) {
        audioRef.current.src = audioSrc;
        audioRef.current.load();
        console.log('🎵 Audio source set and loaded');
      }
      setCurrentTrack(track);
      setCurrentTime(0);
      setDuration(0);
    } else {
      console.log('🎵 Same track already loaded, continuing playback');
    }

    // Start playback
    if (audioRef.current) {
      console.log('🎵 Starting audio playback');
      audioRef.current.play()
        .then(() => {
          console.log('🎵 Audio playback started successfully');
          setIsPlaying(true);
          showNowPlaying(track);
        })
        .catch((error) => {
          console.error('🎵 Audio playback failed:', error);
          setIsPlaying(false);
        });
    } else {
      console.error('🎵 Audio element not available');
    }
  }, [currentTrack, showNowPlaying]);

  /**
   * Pauses the currently playing track
   */
  const pauseTrack = useCallback(() => {
    console.log('🎵 pauseTrack called');
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      console.log('🎵 Audio paused');
    } else {
      console.warn('🎵 No audio element available to pause');
    }
  }, []);

  /**
   * Toggles between play and pause states
   * Only works if a track is currently loaded
   */
  const togglePlayPause = useCallback(() => {
    console.log('🎵 togglePlayPause called:', {
      isPlaying,
      hasCurrentTrack: !!currentTrack,
      currentTrackTitle: currentTrack?.title
    });

    if (isPlaying) {
      pauseTrack();
    } else if (currentTrack) {
      if (audioRef.current) {
        console.log('🎵 Resuming playback');
        audioRef.current.play()
          .then(() => {
            console.log('🎵 Playback resumed successfully');
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error('🎵 Playback resume failed:', error);
            setIsPlaying(false);
          });
      } else {
        console.error('🎵 No audio element available for playback');
      }
    } else {
      console.warn('🎵 No track loaded, cannot toggle playback');
    }
  }, [isPlaying, currentTrack, pauseTrack]);

  /**
   * Seeks to a specific time in the current track
   * @param {number} time - Time in seconds to seek to
   */
  const seekTo = useCallback((time) => {
    console.log('🎵 seekTo called:', {
      seekTime: time,
      currentTime,
      duration
    });

    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      console.log('🎵 Seek completed to:', time);
    } else {
      console.warn('🎵 No audio element available for seeking');
    }
  }, [currentTime, duration]);

  /**
   * Navigates to the next track in the playlist
   */
  const navigateToNextTrack = useCallback(() => {
    console.log('🎵 navigateToNextTrack called:', {
      tracksLength: tracks.length,
      currentTrackTitle: currentTrack?.title,
      tracksTitles: tracks.map(t => t.title)
    });

    if (tracks.length === 0 || !currentTrack) {
      console.log('🎵 Cannot navigate: no tracks or no current track');
      return;
    }

    const currentIndex = tracks.findIndex(track => track.title === currentTrack.title);
    console.log('🎵 Current track index:', currentIndex);

    if (currentIndex === -1) {
      console.log('🎵 Current track not found in tracks array');
      return;
    }

    const nextIndex = (currentIndex + 1) % tracks.length;
    const nextTrack = tracks[nextIndex];

    console.log('🎵 Navigating to next track:', nextTrack.title);
    playTrack({
      title: nextTrack.title,
      category: nextTrack.category || 'Music',
      albumCover: nextTrack.albumCover
    }, nextTrack.src);
  }, [tracks, currentTrack, playTrack]);

  /**
   * Navigates to the previous track in the playlist
   */
  const navigateToPreviousTrack = useCallback(() => {
    if (tracks.length === 0 || !currentTrack) return;

    const currentIndex = tracks.findIndex(track => track.title === currentTrack.title);
    if (currentIndex === -1) return;

    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    const prevTrack = tracks[prevIndex];

    console.log('🎵 Navigating to previous track:', prevTrack.title);
    playTrack({
      title: prevTrack.title,
      category: prevTrack.category || 'Music',
      albumCover: prevTrack.albumCover
    }, prevTrack.src);
  }, [tracks, currentTrack, playTrack]);

  // Audio event handlers - synchronize DOM audio element with React state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      console.warn('🎵 Audio element not found during event handler setup');
      return;
    }

    console.log('🎵 Setting up audio event handlers');

    // Update current time as audio plays
    const handleTimeUpdate = () => {
      const newTime = audio.currentTime;
      setCurrentTime(newTime);
      // Log time updates less frequently to avoid spam
      if (Math.floor(newTime) % 10 === 0) {
        console.log('🎵 Time update:', newTime);
      }
    };

    // Set duration when metadata loads
    const handleLoadedMetadata = () => {
      const newDuration = audio.duration;
      setDuration(newDuration);
      console.log('🎵 Metadata loaded, duration:', newDuration);
    };

    // Handle track end
    const handleEnded = () => {
      console.log('🎵 Track ended');
      setIsPlaying(false);
    };

    // Handle play events (user initiated or programmatic)
    const handlePlay = () => {
      console.log('🎵 Play event received');
      setIsPlaying(true);
    };

    // Handle pause events (user initiated or programmatic)
    const handlePause = () => {
      console.log('🎵 Pause event received');
      setIsPlaying(false);
    };

    // Handle errors
    const handleError = (e) => {
      console.error('🎵 Audio error:', e);
      setIsPlaying(false);
    };

    // Attach event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    console.log('🎵 Audio event handlers attached');

    // Cleanup function
    return () => {
      console.log('🎵 Cleaning up audio event handlers');
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Context value object - all methods and state available to consumers
  const value = {
    // State
    currentTrack,
    isNotificationVisible,
    isPlaying,
    currentTime,
    duration,
    tracks,
    audioRef,

    // Methods
    showNowPlaying,
    hideNowPlaying,
    playTrack,
    pauseTrack,
    togglePlayPause,
    seekTo,
    setTracks,
    navigateToNextTrack,
    navigateToPreviousTrack
  };

  console.log('🎵 NowPlayingProvider rendering with state:', {
    currentTrack: currentTrack?.title,
    isPlaying,
    currentTime,
    duration,
    isNotificationVisible
  });

  return (
    <NowPlayingContext.Provider value={value}>
      {children}
      {/* Hidden global audio element - single source of truth for all audio playback */}
      <audio
        ref={audioRef}
        preload="none"
        style={{ display: 'none' }}
        // Additional attributes for better browser compatibility
        controls={false}
        autoPlay={false}
      />
    </NowPlayingContext.Provider>
  );
}

/**
 * useNowPlaying - Custom hook for accessing the NowPlaying context
 *
 * @returns {Object} NowPlaying context value with all methods and state
 * @throws {Error} If used outside of NowPlayingProvider
 */
export function useNowPlaying() {
  const context = useContext(NowPlayingContext);
  if (!context) {
    const error = new Error('useNowPlaying must be used within a NowPlayingProvider');
    console.error('🎵 Context error:', error.message);
    throw error;
  }
  return context;
}

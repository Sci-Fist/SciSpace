import React, { useState, useEffect, useRef } from 'react';
import { useNowPlaying } from '../context/NowPlayingContext.jsx';
import '../styles/components/_audioPlayerControls.scss';

function AudioPlayerControls({ track, audioSrc, compact = false, tracks = [], currentIndex = 0, onTrackChange, onControlClick }) {
  const { isPlaying: globalIsPlaying, currentTrack: globalCurrentTrack, currentTime: globalCurrentTime, duration: globalDuration, togglePlayPause, seekTo, playTrack } = useNowPlaying();

  const [volume, setVolume] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [localDuration, setLocalDuration] = useState(0);

  const audioRef = useRef(null);
  const progressRef = useRef(null);

  // Check if this control is for the currently playing track
  const isThisTrackPlaying = globalIsPlaying && globalCurrentTrack?.title === track?.title;

  // Detect mobile devices for responsive styling
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, []);

  // Audio event listeners - only for local audio element when this track is playing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Load intrinsic duration immediately regardless of playback state
    const handleLoadedMetadata = () => {
      setLocalDuration(audio.duration);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    if (audio.readyState >= 1) {
      setLocalDuration(audio.duration);
    }

    if (!isThisTrackPlaying) {
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }

    const handleTimeUpdate = () => {
      // Time updates are handled by global context
    };

    const handleEnded = () => {
      // Track ending is handled by global context
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isThisTrackPlaying, audioSrc]);

  // Format time in MM:SS format
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle progress bar click
  const handleProgressClick = (e) => {
    if (!progressRef.current || !globalDuration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * globalDuration;

    seekTo(newTime);
  };

  // Handle progress bar drag
  const handleProgressMouseDown = (e) => {
    setIsDragging(true);
    handleProgressClick(e);
  };

  const handleProgressMouseMove = (e) => {
    if (isDragging) {
      handleProgressClick(e);
    }
  };

  const handleProgressMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleProgressMouseMove);
      document.addEventListener('mouseup', handleProgressMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleProgressMouseMove);
        document.removeEventListener('mouseup', handleProgressMouseUp);
      };
    }
  }, [isDragging]);

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Handle previous track
  const handlePreviousTrack = () => {
    if (!onTrackChange) return;
    onTrackChange(-1); // -1 for previous
    if (onControlClick) onControlClick(); // Reset auto-hide timer
  };

  // Handle next track
  const handleNextTrack = () => {
    if (!onTrackChange) return;
    onTrackChange(1); // 1 for next
    if (onControlClick) onControlClick(); // Reset auto-hide timer
  };

  // Handle play/pause - use global context
  const handlePlayPause = () => {
    if (isThisTrackPlaying) {
      // This track is currently playing, so pause it
      togglePlayPause();
    } else {
      // This track is not playing, so start playing it
      playTrack(track, audioSrc);
    }
    if (onControlClick) onControlClick(); // Reset auto-hide timer
  };

  // Get responsive button styles
  const getButtonStyle = (buttonType) => {
    const baseStyle = {
      backgroundColor: hoveredButton === buttonType ? '#073642' : '#002b36',
      color: '#839496',
      border: '1px solid #073642',
      borderRadius: '4px',
      padding: isMobile ? '6px 8px' : '8px 12px',
      fontSize: isMobile ? '14px' : '16px',
      transition: 'all 0.2s ease',
      transform: hoveredButton === buttonType ? 'scale(1.05)' : 'scale(1)',
      cursor: 'pointer'
    };
    return baseStyle;
  };

  // Derive explicit rendering values securely. Inactive tracks gracefully default to 0 progress.
  const displayCurrentTime = isThisTrackPlaying ? globalCurrentTime : 0;
  const displayDuration = (isThisTrackPlaying && globalDuration > 0) ? globalDuration : localDuration;
  const progressPercentage = displayDuration > 0 ? (displayCurrentTime / displayDuration) * 100 : 0;

  if (compact) {
    return (
      <div
        className="audio-player-controls compact"
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: isMobile ? '4px' : '8px',
          flexWrap: 'wrap'
        }}
      >
        <audio ref={audioRef} src={audioSrc} preload="metadata" />
        <button
          className="control-btn skip-backward compact"
          onClick={handlePreviousTrack}
          onMouseEnter={() => setHoveredButton('prev')}
          onMouseLeave={() => setHoveredButton(null)}
          aria-label="Previous track"
          style={getButtonStyle('prev')}
        >
          ⏮️
        </button>
        <button
          className={`control-btn play-pause compact ${isThisTrackPlaying ? 'playing' : ''}`}
          onClick={handlePlayPause}
          onMouseEnter={() => setHoveredButton('play')}
          onMouseLeave={() => setHoveredButton(null)}
          aria-label={isThisTrackPlaying ? 'Pause' : 'Play'}
          style={getButtonStyle('play')}
        >
          {isThisTrackPlaying ? '⏸️' : '▶️'}
        </button>
        <button
          className="control-btn skip-forward compact"
          onClick={handleNextTrack}
          onMouseEnter={() => setHoveredButton('next')}
          onMouseLeave={() => setHoveredButton(null)}
          aria-label="Next track"
          style={getButtonStyle('next')}
        >
          ⏭️
        </button>
      </div>
    );
  }

  return (
    <div className="audio-player-controls full">
      <audio ref={audioRef} src={audioSrc} preload="metadata" />

      {/* Progress Bar */}
      <div className="progress-section">
        <div
          className="progress-bar"
          ref={progressRef}
          onClick={handleProgressClick}
          onMouseDown={handleProgressMouseDown}
        >
          <div
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
          <div
            className="progress-handle"
            style={{ left: `${progressPercentage}%` }}
          />
        </div>
        <div className="time-display">
          <span className="current-time">
            {formatTime(displayCurrentTime)}
          </span>
          <span className="duration">
            {formatTime(displayDuration)}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="controls-section">
        <button
          className="control-btn skip-backward"
          onClick={handlePreviousTrack}
          aria-label="Previous track"
          disabled={tracks.length <= 1}
        >
          ⏮️
        </button>

        <button
          className={`control-btn play-pause ${isThisTrackPlaying ? 'playing' : ''}`}
          onClick={handlePlayPause}
          aria-label={isThisTrackPlaying ? 'Pause' : 'Play'}
        >
          {isThisTrackPlaying ? '⏸️' : '▶️'}
        </button>

        <button
          className="control-btn skip-forward"
          onClick={handleNextTrack}
          aria-label="Next track"
          disabled={tracks.length <= 1}
        >
          ⏭️
        </button>
      </div>

      {/* Volume Control */}
      <div className="volume-section">
        <span className="volume-icon">🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
      </div>
    </div>
  );
}

export default AudioPlayerControls;

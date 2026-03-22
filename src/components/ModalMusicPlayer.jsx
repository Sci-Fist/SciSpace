import React, { useState, useEffect, useRef } from 'react';
import { useLogger } from '../hooks/useLogger.js';
import { useNowPlaying } from '../context/NowPlayingContext.jsx';

// Modal Music Player Component - Enhanced Premium Design with Visualizer
function ModalMusicPlayer({ item }) {
  console.log('🎵 ModalMusicPlayer rendering with item:', item);

  const logger = useLogger();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    seekTo,
    playTrack
  } = useNowPlaying();
  const modalRef = useRef(null);
  const waveformIntervalRef = useRef(null);
  const [waveformBars, setWaveformBars] = useState(Array(20).fill(0));

  // Check if this track is currently playing globally
  const isCurrentlyPlayingTrack = currentTrack && currentTrack.title === item.title;

  // Debug logging for modal layout
  useEffect(() => {
    console.log('🎵 ModalMusicPlayer mounted - direct console log');
    console.log('🎵 Item received:', item);
    console.log('🎵 Modal ref exists:', !!modalRef.current);

    logger.debug('ModalMusicPlayer mounted', {
      itemTitle: item?.title,
      itemCategory: item?.category,
      modalRef: !!modalRef.current
    }, 'music-modal');

    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      console.log('🎵 Modal dimensions:', rect);
      logger.debug('Modal dimensions', {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        modalElement: modalRef.current
      }, 'music-modal');
    }
  }, [item]);

  // Log timeline visibility
  useEffect(() => {
    const checkTimelineVisibility = () => {
      if (modalRef.current) {
        const timelineElement = modalRef.current.querySelector('.music-progress');
        console.log('🎵 Timeline element found:', !!timelineElement);

        if (timelineElement) {
          const timelineRect = timelineElement.getBoundingClientRect();
          const modalRect = modalRef.current.getBoundingClientRect();

          console.log('🎵 Timeline visibility details:', {
            timelineRect,
            modalRect,
            windowHeight: window.innerHeight,
            isVisible: timelineRect.top < window.innerHeight && timelineRect.bottom > 0
          });

          logger.debug('Timeline visibility check', {
            timelineVisible: timelineRect.top < window.innerHeight && timelineRect.bottom > 0,
            timelineRect: {
              top: timelineRect.top,
              bottom: timelineRect.bottom,
              height: timelineRect.height
            },
            modalRect: {
              top: modalRect.top,
              bottom: modalRect.bottom,
              height: modalRect.height
            },
            windowHeight: window.innerHeight
          }, 'music-modal');
        } else {
          console.log('🎵 Timeline element NOT found in DOM');
        }
      } else {
        console.log('🎵 Modal ref not available for timeline check');
      }
    };

    // Check immediately and after a short delay to allow rendering
    checkTimelineVisibility();
    const timeoutId = setTimeout(checkTimelineVisibility, 100);

    return () => clearTimeout(timeoutId);
  }, [currentTime, duration]);

  // Waveform animation when playing
  useEffect(() => {
    if (isCurrentlyPlayingTrack && isPlaying) {
      waveformIntervalRef.current = setInterval(() => {
        setWaveformBars(prev => prev.map(() =>
          Math.random() * 0.8 + 0.2 // Random height between 0.2 and 1.0
        ));
      }, 150);
    } else {
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
      }
      // Reset waveform when paused
      setWaveformBars(Array(20).fill(0.1));
    }

    return () => {
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
      }
    };
  }, [isCurrentlyPlayingTrack, isPlaying]);

  /**
   * Handles play/pause button clicks with proper track synchronization
   * Ensures modal can start playing its track even when different track is active
   */
  const handlePlayPause = () => {
    logger.debug('Modal Play/Pause button clicked', {
      currentState: isPlaying,
      currentTrackTitle: currentTrack?.title,
      modalItemTitle: item.title,
      isCurrentlyPlayingTrack,
      currentTime,
      duration,
      timestamp: new Date().toISOString()
    }, 'music-player-interaction');

    console.log('🎵 Modal Play/Pause clicked:', {
      wasPlaying: isPlaying,
      currentTrack: currentTrack?.title,
      modalTrack: item.title,
      isCurrentlyPlayingTrack,
      currentTime: formatTime(currentTime),
      duration: formatTime(duration)
    });

    // If this modal's track is currently playing, toggle play/pause
    if (isCurrentlyPlayingTrack) {
      logger.info('Toggling play/pause for current track', {
        trackTitle: item.title,
        wasPlaying: isPlaying
      }, 'music-player');
      togglePlayPause();
    } else {
      // If different track is playing or nothing is playing, start this track
      logger.info('Starting new track from modal', {
        newTrackTitle: item.title,
        previousTrackTitle: currentTrack?.title,
        audioSrc: item.src
      }, 'music-player');

      playTrack({
        title: item.title,
        category: item.category,
        albumCover: item.albumCover
      }, item.src);
    }
  };

  const handleSeek = (e) => {
    const rect = e.target.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    logger.debug('Audio seek initiated', {
      itemTitle: item.title,
      clickPosition: clickX,
      percentage,
      seekToTime: newTime,
      formattedSeekTime: formatTime(newTime),
      currentTime,
      duration,
      timestamp: new Date().toISOString()
    }, 'music-player-seek');

    console.log('🎵 Seeking to:', formatTime(newTime), `(${percentage.toFixed(2)}%)`);

    seekTo(newTime);
  };

  const handleSkip = (seconds) => {
    const oldTime = currentTime;
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));

    logger.debug('Skip operation', {
      itemTitle: item.title,
      skipDirection: seconds > 0 ? 'forward' : 'backward',
      skipAmount: Math.abs(seconds),
      oldTime,
      newTime,
      formattedOldTime: formatTime(oldTime),
      formattedNewTime: formatTime(newTime),
      timestamp: new Date().toISOString()
    }, 'music-player-skip');

    console.log('🎵 Skipping:', seconds > 0 ? 'forward' : 'backward', `${Math.abs(seconds)}s to`, formatTime(newTime));

    seekTo(newTime);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-music-player enhanced" ref={modalRef}>
      <div className="music-card enhanced">
        {/* Enhanced Album Art / Visual Section */}
        <div className="music-album-art enhanced">
          <div className="album-art-container">
            <div className="album-art-image-wrapper">
              <img
                src={item.albumCover}
                alt={`${item.title} - Album Cover`}
                className="album-cover-image-display"
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="album-art-placeholder enhanced fallback">
                <div className="album-art-icon">🎵</div>
                <div className="album-art-bg"></div>
                <div className="album-art-overlay"></div>
              </div>
            </div>
            <div className="album-art-glow"></div>
          </div>
          <div className="album-art-reflection"></div>
        </div>

        {/* Enhanced Main Content Section */}
        <div className="music-content enhanced">
          {/* Enhanced Top Section */}
          <div className="music-top-section enhanced">
            {/* Enhanced Track Info */}
            <div className="music-info enhanced">
              <h4 className="music-title enhanced">{item.title}</h4>
              <span className="music-category enhanced">{item.category}</span>
              <div className="music-meta">
                <span className="music-genre">Electronic</span>
                <span className="music-year">2024</span>
              </div>
            </div>

            {/* Enhanced Control Buttons */}
            <div className="music-controls enhanced">
              <button
                className="control-btn skip-back enhanced"
                onClick={() => handleSkip(-10)}
                aria-label="Skip backward 10 seconds"
              >
                ⏪
              </button>

              <button
                className="control-btn play-pause enhanced"
                onClick={handlePlayPause}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>

              <button
                className="control-btn skip-forward enhanced"
                onClick={() => handleSkip(10)}
                aria-label="Skip forward 10 seconds"
              >
                ⏩
              </button>

            {/* Volume controls removed - using global context */}
            </div>
          </div>

          {/* Enhanced Progress Section */}
          <div className="music-progress enhanced">
            <div className="progress-container">
              <div className="progress-bar enhanced" onClick={handleSeek}>
                <div
                  className="progress-fill enhanced"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                >
                  <div className="progress-shine"></div>
                </div>
                <div
                  className="progress-handle enhanced"
                  style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="time-display enhanced">
              <span className="current-time enhanced">{formatTime(currentTime)}</span>
              <span className="time-separator">/</span>
              <span className="duration enhanced">{formatTime(duration)}</span>
            </div>

            {/* Playback controls removed - using global context */}
          </div>

          {/* Enhanced Waveform Visualizer */}
          <div className="music-waveform">
            <div className="waveform-bars">
              {waveformBars.map((height, index) => (
                <div
                  key={index}
                  className={`waveform-bar ${isPlaying ? 'active' : ''}`}
                  style={{
                    height: `${height * 100}%`,
                    animationDelay: `${index * 0.05}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Background Effects */}
        <div className="music-card-bg-effects">
          <div className="bg-gradient"></div>
          <div className="bg-particles">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="bg-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 6}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Audio element removed - using global context */}
    </div>
  );
}

export default ModalMusicPlayer;

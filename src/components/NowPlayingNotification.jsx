import React, { useEffect, useState } from 'react';
import { useNowPlaying } from '../context/NowPlayingContext.jsx';
import AudioPlayerControls from './AudioPlayerControls.jsx';
import '../styles/components/_nowPlayingNotification.scss';

function NowPlayingNotification() {
  const { currentTrack, isNotificationVisible, hideNowPlaying, isPlaying, togglePlayPause, navigateToNextTrack, navigateToPreviousTrack } = useNowPlaying();

  // Handle track navigation for notification controls
  const handleNotificationTrackChange = (direction) => {
    if (direction === 1) {
      navigateToNextTrack();
    } else if (direction === -1) {
      navigateToPreviousTrack();
    }
  };

  const [isAnimating, setIsAnimating] = useState(false);
  const [autoHideTimer, setAutoHideTimer] = useState(null);
  const [progressAnimation, setProgressAnimation] = useState(null);
  const [progressPercentage, setProgressPercentage] = useState(100);

  // Function to reset the auto-hide timer
  const resetAutoHideTimer = () => {
    console.log('🎵 resetAutoHideTimer called - resetting progress bar');

    // Clear existing timers
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
    }
    if (progressAnimation) {
      clearInterval(progressAnimation);
    }

    // Reset progress bar to 100% (full) immediately
    setProgressPercentage(100);
    console.log('🎵 Progress bar reset to 100%');

    // Start progress animation using setInterval for reliability
    const startTime = Date.now();
    const animationInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.max(100 - (elapsed / 5000) * 100, 0);
      setProgressPercentage(progress);

      // Stop animation when it reaches 0
      if (progress <= 0) {
        clearInterval(animationInterval);
        setProgressAnimation(null);
      }
    }, 50); // Update every 50ms for smooth animation

    setProgressAnimation(animationInterval);

    // Start new 5-second timer
    const newTimer = setTimeout(() => {
      console.log('🎵 Auto-hide timer expired, hiding notification');
      if (progressAnimation) {
        clearInterval(progressAnimation);
        setProgressAnimation(null);
      }
      setIsAnimating(false);
      setTimeout(hideNowPlaying, 300); // Wait for animation to complete
    }, 5000);

    setAutoHideTimer(newTimer);
    console.log('🎵 New 5-second timer started');
  };

  useEffect(() => {
    if (isNotificationVisible) {
      setIsAnimating(true);
      resetAutoHideTimer();
    }

    // Cleanup on unmount
    return () => {
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
      }
      if (progressAnimation) {
        clearInterval(progressAnimation);
      }
    };
  }, [isNotificationVisible, hideNowPlaying]);

  if (!currentTrack || !isNotificationVisible) return null;

  return (
    <div className={`now-playing-notification ${isAnimating ? 'visible' : ''}`}>
      <div className="notification-content">
        {/* Album Cover */}
        <div className="album-cover">
          {currentTrack.albumCover ? (
            <img
              src={currentTrack.albumCover}
              alt={`${currentTrack.title} cover`}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="fallback-icon" style={{ display: currentTrack.albumCover ? 'none' : 'flex' }}>
            🎵
          </div>
        </div>

        {/* Track Info */}
        <div className="track-info">
          <div className="now-playing-label">Now Playing</div>
          <div className="track-title">{currentTrack.title}</div>
          <div className="track-category">{currentTrack.category}</div>
        </div>

        {/* Close Button */}
        <button className="close-btn" onClick={hideNowPlaying}>
          ×
        </button>
      </div>

      {/* Progress Bar Animation */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${progressPercentage}%`,
            transition: progressPercentage === 0 ? 'none' : 'width 0.1s linear'
          }}
        ></div>
      </div>

      {/* Audio Controls */}
      <div className="notification-controls">
        <AudioPlayerControls
          track={currentTrack}
          audioSrc="" // Not needed since it's already playing globally
          compact={true}
          tracks={[]} // Not needed for notification controls
          currentIndex={0} // Not needed for notification controls
          onTrackChange={handleNotificationTrackChange} // Connect to global navigation
          onControlClick={resetAutoHideTimer} // Reset auto-hide timer on control interaction
        />
      </div>
    </div>
  );
}

export default NowPlayingNotification;

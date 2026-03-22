import React from 'react';
import { useNowPlaying } from '../context/NowPlayingContext.jsx';

// Music Card Component - Clickable track cover art display like MusicPage
function MusicCard({ item, onClick }) {
  const { playTrack, togglePlayPause, isPlaying, currentTrack } = useNowPlaying();

  // Check if this track is currently playing
  const isCurrentlyPlayingTrack = currentTrack && currentTrack.title === item.title;

  const handlePlayPause = (e) => {
    e.stopPropagation();

    if (isCurrentlyPlayingTrack) {
      // If this track is playing, toggle play/pause
      togglePlayPause();
    } else {
      // If different track or nothing playing, start this track
      playTrack({
        title: item.title,
        category: item.category,
        albumCover: item.albumCover
      }, item.src);
    }
  };

  return (
    <div
      className="music-track-cover"
      data-category={item.category}
      onClick={onClick}
      style={{
        cursor: 'pointer',
        backgroundImage: item.albumCover ? `url(${item.albumCover})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="music-card-overlay"></div>

      {/* Fallback icon when no album cover */}
      {!item.albumCover && (
        <div className="fallback-icon">
          🎵
        </div>
      )}

      {/* Music controls overlay - centered on screen */}
      <div className="music-card-controls">
        {/* Play/Pause */}
        <button
          className={`music-control-btn music-play-pause modern-play-btn ${isCurrentlyPlayingTrack ? 'playing' : ''}`}
          onClick={handlePlayPause}
          title={isCurrentlyPlayingTrack ? 'Pause' : 'Play'}
          aria-label={isCurrentlyPlayingTrack ? `Pause ${item.title}` : `Play ${item.title}`}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="play-icon"
          >
            {isCurrentlyPlayingTrack && isPlaying ? (
              // Pause icon
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            ) : (
              // Play icon
              <path d="M8 5v14l11-7z"/>
            )}
          </svg>
        </button>
      </div>

      {/* Track title overlay - removed per user request */}
      {/* <div className="music-card-content">
        <p className="cover-caption">{item.title}</p>
      </div> */}
    </div>
  );
}

export default MusicCard;

import React, { useState, useEffect, useRef } from 'react';
import { useLogger } from '../hooks/useLogger.js';
import { useNowPlaying } from '../context/NowPlayingContext.jsx';

/**
 * GalleryModal Component - Advanced modal with sophisticated controls and animations
 *
 * Features:
 * - Header with title and navigation controls
 * - Hide/show controls with smooth animations
 * - Support for images and audio content
 * - Keyboard navigation (arrow keys, escape)
 * - Expandable description section
 * - Category display
 */
function GalleryModal({ isOpen, onClose, items, currentIndex, onNavigate }) {
  const logger = useLogger();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);
  const [areControlsHidden, setAreControlsHidden] = useState(false);
  const [animationSequence, setAnimationSequence] = useState({
    animating: false,
    showing: false, // Whether we're showing or hiding controls
    step1Complete: false, // Move to/from X position
    step2Complete: false  // X button shown/hidden, move to/from initial position
  });
  const currentItem = items[currentIndex];
  const modalRef = useRef(null);
  const hideButtonRef = useRef(null);

  // Position and spacing logging (removed excessive logging)

  if (!isOpen || !currentItem) {
    return null;
  }

  return (
    <div className="gallery-modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className={`gallery-modal-content ${areControlsHidden ? 'controls-hidden' : 'controls-visible'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Section - Only show for non-music items */}
        {(currentItem.type !== 'audio' && currentItem.category !== 'Music') && (
          <div className="modal-header-section">
            {/* Title in header - only for non-music items */}
            <div className="modal-header-title">
              <h3>{currentItem.title}</h3>
            </div>

            {/* Control buttons container */}
            <div className="modal-controls-container">
              {/* Header navigation buttons - positioned to the left of hide button */}
              <div className="modal-header-nav-buttons">
                {currentIndex > 0 && (
                  <button
                    className="modal-nav-btn prev"
                    onClick={() => onNavigate(-1)}
                  >
                    ‹
                  </button>
                )}
                {currentIndex < items.length - 1 && (
                  <button
                    className="modal-nav-btn next"
                    onClick={() => onNavigate(1)}
                  >
                    ›
                  </button>
                )}
              </div>

              {/* Hide Controls button - positioned inside header */}
              <button
                ref={hideButtonRef}
                className={`modal-hide-controls-btn ${
                  areControlsHidden ? 'full-hide-mode' : ''
                } ${
                  animationSequence.animating ? (animationSequence.showing ? 'showing' : 'animating') : ''
                } ${
                  animationSequence.step1Complete ? 'step1-complete' : ''
                } ${
                  animationSequence.step2Complete ? 'step2-complete' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent modal close
                  if (animationSequence.animating) return; // Prevent multiple clicks during animation

                  if (areControlsHidden) {
                    // Show controls - start showing animation sequence
                    setAnimationSequence({
                      animating: true,
                      showing: true,
                      step1Complete: false,
                      step2Complete: false
                    });

                    // Step 1: Move from above media to X position (0.5s)
                    setTimeout(() => {
                      setAnimationSequence(prev => ({ ...prev, step1Complete: true }));
                    }, 500);

                    // Step 2: Show X button and move to initial position (1.0s total)
                    setTimeout(() => {
                      setAreControlsHidden(false);
                      setAnimationSequence(prev => ({
                        animating: false,
                        showing: false,
                        step1Complete: true,
                        step2Complete: true
                      }));
                    }, 1000);
                  } else {
                    // Hide controls - start hiding animation sequence
                    setAnimationSequence({
                      animating: true,
                      showing: false,
                      step1Complete: false,
                      step2Complete: false
                    });

                    // Step 1: Move to X button position (0.5s)
                    setTimeout(() => {
                      setAnimationSequence(prev => ({ ...prev, step1Complete: true }));
                    }, 500);

                    // Step 2: Hide X button and move above media (1.0s total)
                    setTimeout(() => {
                      setAreControlsHidden(true);
                      setAnimationSequence(prev => ({
                        animating: false,
                        showing: false,
                        step1Complete: true,
                        step2Complete: true
                      }));
                    }, 1000);
                  }
                }}
                title={areControlsHidden ? 'Show controls' : 'Hide controls'}
              >
                {areControlsHidden ? '👁️' : '🙈'}
              </button>

              {/* Close button - only show when controls are not hidden */}
              {!areControlsHidden && (
                <button
                  className="modal-close-btn"
                  onClick={onClose}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        )}

        {/* Music Modal Header - Compact header for music items */}
        {(currentItem.type === 'audio' || currentItem.category === 'Music') && (
          <div className="music-modal-header">
            <div className="music-modal-controls">
              {/* Navigation buttons for music items */}
              {currentIndex > 0 && (
                <button
                  className="modal-nav-btn prev music-nav"
                  onClick={() => onNavigate(-1)}
                >
                  ‹
                </button>
              )}
              {currentIndex < items.length - 1 && (
                <button
                  className="modal-nav-btn next music-nav"
                  onClick={() => onNavigate(1)}
                >
                  ›
                </button>
              )}

              {/* Close button for music items */}
              <button
                className="modal-close-btn music-close"
                onClick={onClose}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Modal content based on item type and category */}
        <div className="modal-media-container">
          {(currentItem.type === 'audio' || currentItem.category === 'Music') ? (
            <ModalMusicPlayer item={currentItem} />
          ) : (
            <img
              src={currentItem.src}
              alt={currentItem.alt}
              className="modal-image"
            />
          )}
        </div>

        {/* Category - Bottom Right */}
        {!areControlsHidden && (
          <div className="modal-category-bottom-right">
            <p>{currentItem.category}</p>
          </div>
        )}

        {/* Description section - Bottom area */}
        {!areControlsHidden && (
          <div className="modal-description-section">
            <button
              className="description-toggle-btn"
              onClick={() => {
                const newExpanded = !isDescriptionExpanded;
                logger.debug('Description toggle clicked', {
                  itemTitle: currentItem.title,
                  wasExpanded: isDescriptionExpanded,
                  nowExpanded: newExpanded,
                  timestamp: new Date().toISOString()
                }, 'modal-description');
                console.log('📝 Description toggle clicked:', {
                  itemTitle: currentItem.title,
                  expanding: newExpanded,
                  wasExpanded: isDescriptionExpanded
                });
                setIsDescriptionExpanded(newExpanded);
              }}
              aria-expanded={isDescriptionExpanded}
              aria-label={isDescriptionExpanded ? 'Hide description' : 'Show description'}
            >
              <span className="toggle-icon">{isDescriptionExpanded ? '−' : '+'}</span>
              <span className="toggle-text">Description</span>
            </button>
            {isDescriptionExpanded && (
              <div className="description-content">
                <p className="modal-description">{currentItem.description || currentItem.alt}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ModalMusicPlayer Component - Specialized audio player for modal view
 */
function ModalMusicPlayer({ item }) {
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

  // Check if this track is currently playing globally
  const isCurrentlyPlayingTrack = currentTrack && currentTrack.title === item.title;

  // Centralized album cover mapping for consistent, meaningful cover assignment
  const albumCoverMapping = {
    "Banger": "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139229/scispace/media/glassesroompostpc1.png", // Futuristic room - energetic electronic
    "Blaaaaaaaa": "/src/assets/photography/Sushi-2.jpg", // Sushi - ambient, atmospheric
    "Melancholische Scheiße": "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139240/scispace/media/shader_pause.jpg", // Shader work - melancholic, introspective
    "Strange V2-1": "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139238/scispace/media/sci_fist.jpg", // Digital portrait - experimental, abstract
    "Strange V2": "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139238/scispace/media/sci_fist.jpg", // Digital portrait - experimental, abstract
    "Chronic Stress Syndrom": "/src/assets/photography/Sushi-1.jpg", // Sushi - meditative, calm
    "Idee1": "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139219/scispace/media/backhumanoid.png", // Sci-fi character - conceptual, abstract
    "Still": "/src/assets/photography/01090055.jpg", // Architecture - serene, calm
    "Sci Fist": "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139238/scispace/media/sci_fist.jpg", // Digital portrait - track cover
    "Shader Pause": "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139240/scispace/media/shader_pause.jpg", // Shader work - track cover
    "Sunken": "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139240/scispace/media/sunken.jpg", // Abstract art - track cover
    "Sword": "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139241/scispace/media/sword.png", // Fantasy art - track cover
    "Pandora": "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139237/scispace/media/pandora.png", // Character art - track cover
    "Back Humanoid": "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139219/scispace/media/backhumanoid.png", // Sci-fi character - track cover
    "Glasses Book Room": "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139222/scispace/media/glasses-book-room.png", // Room scene - album cover
    "Glasses Book Room Vol. 2": "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139224/scispace/media/glasses-book-room1.png", // Room scene variant - album cover
    "Room Perspective": "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139228/scispace/media/glassesroompostpc.png", // Room perspective - album cover
    "Pixel Art Collection": "/src/assets/images/Sharing my pixel art.png", // Pixel art - album cover
    "Untitled Study": "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139242/scispace/media/untitled-08-07-2024-12-37-07.png", // Digital study - album cover
    "Digital Study": "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139239/scispace/media/screenshot_2025.04.14_15.02.05.335.png" // Digital study - album cover
  };

  // Get album cover with proper fallback logic
  const getAlbumCover = () => {
    // First priority: Use explicitly assigned album cover from item data
    if (item.albumCover) {
      return item.albumCover;
    }

    // Second priority: Use mapping based on title
    if (albumCoverMapping[item.title]) {
      return albumCoverMapping[item.title];
    }

    // Third priority: Use the actual item image if it's from assets (for cover art)
    if (item.src && item.src.includes('/src/assets/images/')) {
      return item.src;
    }

    // Final fallback: Default album cover
    return "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139229/scispace/media/glassesroompostpc1.png";
  };


  /**
   * Handles play/pause button clicks with proper track synchronization
   * Ensures modal can start playing its track even when different track is active
   */
  const handlePlayPause = () => {
    // If this modal's track is currently playing, toggle play/pause
    if (isCurrentlyPlayingTrack) {
      togglePlayPause();
    } else {
      // If different track is playing or nothing is playing, start this track
      playTrack({
        title: item.title,
        category: item.category,
        albumCover: getAlbumCover()
      }, item.src);
    }
  };

  const handleSeek = (e) => {
    const rect = e.target.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    seekTo(newTime);
  };

  const handleSkip = (seconds) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    seekTo(newTime);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-music-player" ref={modalRef}>
      <div className="music-card enhanced">
        {/* Enhanced Album Art / Visual Section */}
        <div className="music-album-art enhanced">
          <div className="album-art-container">
            <div className="album-art-image-wrapper">
              <img
                src={getAlbumCover()}
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
          {/* Enhanced Top section - Track info and controls */}
          <div className="music-top-section enhanced">
            {/* Enhanced Track Info */}
            <div className="music-info enhanced">
              <h4 className="music-title enhanced">{item.title}</h4>
              <span className="music-category enhanced">{item.category}</span>
              <div className="music-meta">
                <span className="music-genre">Electronic • Ambient</span>
                <span className="music-year">2024</span>
              </div>
            </div>

            {/* Enhanced Control Buttons */}
            <div className="music-controls enhanced">
              <button
                className="control-btn skip-back enhanced"
                onClick={() => handleSkip(-10)}
                aria-label="Skip backward 10 seconds"
                title="Skip backward 10 seconds"
              >
                ⏪
              </button>

              <button
                className="control-btn play-pause enhanced"
                onClick={handlePlayPause}
                aria-label={isCurrentlyPlayingTrack ? 'Pause' : 'Play'}
                title={isCurrentlyPlayingTrack ? 'Pause' : 'Play'}
              >
                {isCurrentlyPlayingTrack ? '⏸️' : '▶️'}
              </button>

              <button
                className="control-btn skip-forward enhanced"
                onClick={() => handleSkip(10)}
                aria-label="Skip forward 10 seconds"
                title="Skip forward 10 seconds"
              >
                ⏩
              </button>


            </div>
          </div>

          {/* Enhanced Timeline/progress bar */}
          <div className="music-progress enhanced">
            <div className="progress-container">
              <div className="progress-bar enhanced" onClick={handleSeek}>
                <div
                  className="progress-fill enhanced"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
                <div
                  className="progress-handle enhanced"
                  style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
                <div className="progress-shine"></div>
              </div>
            </div>
            <div className="time-display enhanced">
              <span className="current-time enhanced">{formatTime(currentTime)}</span>
              <span className="time-separator">/</span>
              <span className="duration enhanced">{formatTime(duration)}</span>
            </div>


          </div>

          {/* Enhanced Waveform Visualization */}
          <div className="music-waveform">
            <div className="waveform-bars">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className={`waveform-bar ${isPlaying ? 'active' : ''}`}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    height: `${Math.random() * 100}%`
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Background Effects */}
        <div className="music-card-bg-effects">
          <div className="bg-gradient"></div>
          <div className="bg-particles">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="bg-particle" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}></div>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
}

export { GalleryModal, ModalMusicPlayer };

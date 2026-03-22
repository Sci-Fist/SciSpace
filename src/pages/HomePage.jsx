import React, { useState, useEffect, useRef } from 'react';
import { usePage } from '../context/PageContext.jsx'; // Import page context
import { useFileManager } from '../context/FileManagerContext.jsx'; // Import file manager context
import { useSlideshow } from '../context/SlideshowContext.jsx'; // Import slideshow context
import { useTextContent } from '../context/TextContentContext.jsx'; // Import text content context
import { useNowPlaying } from '../context/NowPlayingContext.jsx'; // Import now playing context
import { useLogger } from '../hooks/useLogger.js'; // Import logger hook
import MixedMediaGallery from '../components/MixedMediaGallery.jsx'; // Import extracted gallery component
import '../styles/pages/_homePage.scss'; // Specific styles for the home page
import HeroVisual from '../assets/images/glassesroompostpc1.png'; // Import your new image as fallback

function HomePage() {
  const logger = useLogger();

  logger.debug('Component rendering started', {
    timestamp: new Date().toISOString(),
    location: window.location.pathname
  }, 'home');

  const { getPageControls } = usePage();
  const { getSelectedImage, getEnabledSlideshows } = useSlideshow();
  const { getUploadedFiles } = useFileManager();
  const { getTextContent } = useTextContent();
  const controls = getPageControls('/');

  logger.debug('Page controls loaded', {
    controls,
    hasControls: !!controls,
    controlKeys: controls ? Object.keys(controls) : []
  }, 'home');

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [nextHeroIndex, setNextHeroIndex] = useState(1);
  const [isHeroPlaying, setIsHeroPlaying] = useState(true);
  const [isHeroTransitioning, setIsHeroTransitioning] = useState(false);
  const heroIntervalRef = useRef(null);

  logger.debug('State initialized', {
    currentHeroIndex,
    nextHeroIndex,
    isHeroPlaying,
    isHeroTransitioning,
    timestamp: new Date().toISOString()
  }, 'home');

  // Get hero images from slideshow and selected images
  const enabledSlideshows = getEnabledSlideshows('/');
  const allFiles = getUploadedFiles('/');
  const selectedHeroImage = getSelectedImage('/', 'Hero Images');
  const selectedBackgroundImage = getSelectedImage('/', 'Background Images');

  // Collect hero images from enabled slideshows
  const slideshowHeroImages = [];
  enabledSlideshows.forEach(({ category, images: imageIds }) => {
    if (imageIds.length > 0 && category === 'Hero Images') {
      imageIds.forEach(imageId => {
        const image = allFiles.find(file => file.id === imageId);
        if (image) {
          slideshowHeroImages.push(image);
        }
      });
    }
  });

  // Use selected image if available, otherwise use slideshow images
  const heroImages = selectedHeroImage ? [selectedHeroImage] :
    (slideshowHeroImages.length > 0 ? slideshowHeroImages : []);

  // Get slideshow settings from page controls
  const slideshowSpeed = controls.slideshowSpeed || 3; // seconds
  const transitionType = controls.slideshowTransition || 'fade';
  const transitionDuration = controls.slideshowTransitionDuration || 0.5; // seconds
  const autoPlay = controls.slideshowAutoPlay !== false;
  const loop = controls.slideshowLoop !== false;
  const shuffle = controls.slideshowShuffle || false;

  // Get background image
  const backgroundImageSrc = selectedBackgroundImage ? selectedBackgroundImage.url : null;

  // Auto-advance hero image slideshow with ultra-smooth transitions
  useEffect(() => {
    if (heroIntervalRef.current) {
      clearInterval(heroIntervalRef.current);
    }

    if (heroImages.length > 1 && isHeroPlaying && autoPlay) {
      heroIntervalRef.current = setInterval(() => {
        // Calculate the next image index BEFORE starting transition
        const nextIndex = (() => {
          if (shuffle) {
            // Shuffle mode: pick random image
            let newIndex;
            do {
              newIndex = Math.floor(Math.random() * heroImages.length);
            } while (newIndex === currentHeroIndex && heroImages.length > 1);
            return newIndex;
          } else {
            // Normal mode: next image
            const nextIndex = currentHeroIndex + 1;
            return loop ? nextIndex % heroImages.length : Math.min(nextIndex, heroImages.length - 1);
          }
        })();

        // Set the next image index
        setNextHeroIndex(nextIndex);

        // Start the smooth crossfade transition
        setIsHeroTransitioning(true);

        // After transition completes, make next image the current image
        setTimeout(() => {
          setCurrentHeroIndex(nextIndex);
          setIsHeroTransitioning(false);
        }, transitionDuration * 1000 + 50);

      }, slideshowSpeed * 1000);

      return () => {
        if (heroIntervalRef.current) {
          clearInterval(heroIntervalRef.current);
        }
      };
    }
  }, [heroImages.length, isHeroPlaying, slideshowSpeed, shuffle, loop, transitionDuration, autoPlay, currentHeroIndex]);

  // Reset to first image when images change
  useEffect(() => {
    setCurrentHeroIndex(0);
    setNextHeroIndex(heroImages.length > 1 ? 1 : 0);
    setIsHeroTransitioning(false);
  }, [heroImages.length]);

  // Get current and next hero images for smooth crossfade
  const currentHeroImage = heroImages.length > 0 ? heroImages[currentHeroIndex] : null;
  const nextHeroImage = heroImages.length > 0 ? heroImages[nextHeroIndex] : null;

  const heroImageSrc = currentHeroImage ? currentHeroImage.url : HeroVisual;
  const nextHeroImageSrc = nextHeroImage ? nextHeroImage.url : HeroVisual;

  // Convert hex color to RGB for rgba usage
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 230, b: 230 }; // Default teal
  };

  const glowColorRgb = hexToRgb(controls.heroGlowColor || '#00e6e6');

  return (
    <section
      className="home-page"
      style={{
        backgroundImage: backgroundImageSrc ? `url(${backgroundImageSrc})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: controls.backgroundOpacity || 1
      }}
    >
      <div className="hero-section">
        {/* Placeholder for a striking hero image or video background */}
        <div
          className="hero-visual"
          style={{
            filter: controls.backgroundBlur ? `blur(${controls.backgroundBlur}px)` : 'none'
          }}
        >
          {/* Layered images for smooth crossfade */}
          <img
            src={heroImageSrc}
            alt="Retro-Futuristic Hero Visual"
            className="hero-image hero-image-current"
            style={{
              transform: controls.heroScale ? `scale(${controls.heroScale})` : 'scale(1)',
              filter: controls.heroBlur ? `blur(${controls.heroBlur}px)` : 'none',
              boxShadow: controls.heroGlowIntensity && controls.heroGlowIntensity > 0
                ? `
                  inset 0 0 10px rgba(${glowColorRgb.r}, ${glowColorRgb.g}, ${glowColorRgb.b}, ${0.8 * (controls.heroGlowIntensity / 100)}),
                  0 0 20px rgba(${glowColorRgb.r}, ${glowColorRgb.g}, ${glowColorRgb.b}, ${0.6 * (controls.heroGlowIntensity / 100)}),
                  0 0 40px rgba(${glowColorRgb.r}, ${glowColorRgb.g}, ${glowColorRgb.b}, ${0.4 * (controls.heroGlowIntensity / 100)})
                `
                : 'none'
            }}
          />
          {heroImages.length > 1 && (
            <img
              src={nextHeroImageSrc}
              alt="Next Hero Visual"
              className={`hero-image hero-image-next ${isHeroTransitioning ? 'fading-in' : ''}`}
              style={{
                transform: controls.heroScale ? `scale(${controls.heroScale})` : 'scale(1)',
                filter: controls.heroBlur ? `blur(${controls.heroBlur}px)` : 'none',
                boxShadow: controls.heroGlowIntensity && controls.heroGlowIntensity > 0
                  ? `
                    inset 0 0 10px rgba(${glowColorRgb.r}, ${glowColorRgb.g}, ${glowColorRgb.b}, ${0.8 * (controls.heroGlowIntensity / 100)}),
                    0 0 20px rgba(${glowColorRgb.r}, ${glowColorRgb.g}, ${glowColorRgb.b}, ${0.6 * (controls.heroGlowIntensity / 100)}),
                    0 0 40px rgba(${glowColorRgb.r}, ${glowColorRgb.g}, ${glowColorRgb.b}, ${0.4 * (controls.heroGlowIntensity / 100)})
                  `
                  : 'none',
                transition: `opacity ${transitionDuration}s cubic-bezier(0.4, 0, 0.2, 1)`
              }}
            />
          )}
        </div>
        <div
          className="hero-content"
          style={{
            backgroundColor: controls.contentOpacity ? `rgba(var(--color-background-rgb), ${controls.contentOpacity})` : 'rgba(var(--color-background-rgb), 0.7)'
          }}
        >
          <h2 style={{ opacity: controls.welcomeOpacity || 1 }}>
            {getTextContent('home.welcomeText') || 'Welcome'}
          </h2>
          {controls.showDescription !== false && (
            <p style={{ opacity: controls.descriptionOpacity || 1 }}>
              {getTextContent('home.descriptionText') || 'Showcasing a blend of digital art and sonic landscapes.'}
            </p>
          )}
          <div
            className="call-to-action"
            style={{
              transform: controls.buttonSize ? `scale(${controls.buttonSize})` : 'scale(1)'
            }}
          >
            <a
              href="/3d-art"
              className="btn primary-btn"
              style={{
                opacity: controls.artButtonOpacity || 1
              }}
            >
              {getTextContent('home.artButtonText') || 'Explore 3D Art'}
            </a>
            <a
              href="/music"
              className="btn secondary-btn"
              style={{
                opacity: controls.musicButtonOpacity || 1
              }}
            >
              {getTextContent('home.musicButtonText') || 'Listen to Music'}
            </a>
          </div>
        </div>
      </div>

      {/* Mixed Media Gallery - Showcasing All Website Content */}
      <MixedMediaGallery />
    </section>
  );
}

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

// Gallery Modal Component - Popout functionality for gallery items
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

  // Position and spacing logging
  useEffect(() => {
    if (modalRef.current && hideButtonRef.current) {
      const modalRect = modalRef.current.getBoundingClientRect();
      const buttonRect = hideButtonRef.current.getBoundingClientRect();

      logger.debug('Modal and button positioning', {
        modalDimensions: {
          width: modalRect.width,
          height: modalRect.height,
          top: modalRect.top,
          left: modalRect.left,
          right: modalRect.right,
          bottom: modalRect.bottom
        },
        buttonPosition: {
          top: buttonRect.top,
          left: buttonRect.left,
          right: buttonRect.right,
          bottom: buttonRect.bottom,
          width: buttonRect.width,
          height: buttonRect.height
        },
        relativePosition: {
          buttonTopFromModal: buttonRect.top - modalRect.top,
          buttonLeftFromModal: buttonRect.left - modalRect.left,
          buttonRightFromModal: modalRect.right - buttonRect.right
        },
        animationState: animationSequence,
        controlsHidden: areControlsHidden,
        timestamp: new Date().toISOString()
      }, 'modal-positioning');
    }
  }, [animationSequence, areControlsHidden]);

  // Log animation sequence changes
  useEffect(() => {
    logger.debug('Animation sequence changed', {
      newSequence: animationSequence,
      controlsHidden: areControlsHidden,
      timestamp: new Date().toISOString()
    }, 'modal-animation');
  }, [animationSequence, areControlsHidden]);

  console.log('GalleryModal render:', { isOpen, currentIndex, currentItem, itemsLength: items?.length });

  if (!isOpen || !currentItem) {
    console.log('GalleryModal not rendering:', { isOpen, hasCurrentItem: !!currentItem });
    return null;
  }

  console.log('GalleryModal rendering modal for item:', currentItem.title);

  return (
    <div className="gallery-modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className={`gallery-modal-content ${areControlsHidden ? 'controls-hidden' : 'controls-visible'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Section - Always present, contains title and control buttons */}
        <div className="modal-header-section">
          {/* Title in header - always show */}
          <div className="modal-header-title">
            <h3>{currentItem.title}</h3>
          </div>

          {/* Control buttons container */}
          <div className="modal-controls-container">
            {/* Header navigation buttons - positioned to the left of hide button */}
            <div className="modal-header-nav-buttons">
              {currentIndex > 0 && (
                <button className="modal-nav-btn prev" onClick={() => onNavigate(-1)}>
                  ‹
                </button>
              )}
              {currentIndex < items.length - 1 && (
                <button className="modal-nav-btn next" onClick={() => onNavigate(1)}>
                  ›
                </button>
              )}
            </div>

            {/* Debug: Hide button should be visible */}
            {console.log('🎭 Rendering hide button, areControlsHidden:', areControlsHidden, 'animationSequence:', animationSequence)}
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
              <button className="modal-close-btn" onClick={onClose}>
                ×
              </button>
            )}
          </div>
        </div>

        {/* Modal content based on item type */}
        <div className="modal-media-container">
          {(() => {
            console.log('🎵 GalleryModal rendering item:', {
              title: currentItem.title,
              type: currentItem.type,
              typeType: typeof currentItem.type,
              typeEqualsAudio: currentItem.type === 'audio',
              category: currentItem.category,
              src: currentItem.src
            });
            return currentItem.type === 'audio' ? (
              <ModalMusicPlayer item={currentItem} />
            ) : (
              <img
                src={currentItem.src}
                alt={currentItem.alt}
                className="modal-image"
              />
            );
          })()}
        </div>

        {/* Navigation buttons are now in the header - removed old navigation section */}

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
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
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

export default HomePage;

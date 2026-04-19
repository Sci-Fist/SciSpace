import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLogger } from '../hooks/useLogger.js';
import { useNowPlaying } from '../context/NowPlayingContext.jsx';
import '../styles/components/_galleryModal.scss';

/**
 * Custom SVG Icons for a professional, retro-futuristic console look
 */
const GalleryIcons = {
  ChevronLeft: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
  X: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  Eye: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  ),
  EyeOff: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  )
};

/**
 * GalleryModal Component - Refined with professional SVGs and calibrated transparency
 */
function GalleryModal({ isOpen, onClose, items, currentIndex, onNavigate }) {
  const logger = useLogger('GalleryModal', { logMount: true });
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [areControlsHidden, setAreControlsHidden] = useState(false);
  
  const currentItem = items[currentIndex];
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen || !currentItem) return null;

  const modalRoot = document.getElementById('modal-root');
  
  const modalContent = (
    <div className="gallery-modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className={`gallery-modal-content ${areControlsHidden ? 'controls-hidden' : 'controls-visible'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Section */}
        {(currentItem.type !== 'audio' && currentItem.category !== 'Music') && (
          <div className="modal-header-section">
            <div className="modal-header-title">
              <h3>{currentItem.title}</h3>
            </div>

            <div className="modal-controls-container">
              <div className="modal-header-nav-buttons">
                {currentIndex > 0 && (
                  <button className="modal-nav-btn prev" onClick={() => onNavigate(-1)}>
                    <GalleryIcons.ChevronLeft />
                  </button>
                )}
                {currentIndex < items.length - 1 && (
                  <button className="modal-nav-btn next" onClick={() => onNavigate(1)}>
                    <GalleryIcons.ChevronRight />
                  </button>
                )}
              </div>

              <button
                className={`modal-hide-controls-btn ${areControlsHidden ? 'full-hide-mode' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setAreControlsHidden(!areControlsHidden);
                }}
                title={areControlsHidden ? 'Show controls' : 'Hide controls'}
              >
                {areControlsHidden ? <GalleryIcons.Eye /> : <GalleryIcons.EyeOff />}
              </button>

              <button className="modal-close-btn" onClick={onClose}>
                <GalleryIcons.X />
              </button>
            </div>
          </div>
        )}

        {/* Music Modal Header */}
        {(currentItem.type === 'audio' || currentItem.category === 'Music') && (
          <div className="music-modal-header">
            <div className="music-modal-controls">
              {currentIndex > 0 && (
                <button className="modal-nav-btn prev music-nav" onClick={() => onNavigate(-1)}>
                  <GalleryIcons.ChevronLeft />
                </button>
              )}
              {currentIndex < items.length - 1 && (
                <button className="modal-nav-btn next music-nav" onClick={() => onNavigate(1)}>
                  <GalleryIcons.ChevronRight />
                </button>
              )}
              <button className="modal-close-btn music-close" onClick={onClose}>
                <GalleryIcons.X />
              </button>
            </div>
          </div>
        )}

        {/* Modal Media Content */}
        <div 
          className="modal-media-container"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Category badge shows on hover in top right */}
          {!areControlsHidden && (
            <div className={`modal-category-top-right ${isHovered ? 'visible' : ''}`}>
              <p>{currentItem.category}</p>
            </div>
          )}

          <div className="media-wrapper">
            {(currentItem.src && currentItem.src.endsWith('.mp3')) || currentItem.category === 'Music' ? (
              <ModalMusicPlayer item={currentItem} />
            ) : (
              <img
                src={currentItem.src}
                alt={currentItem.alt}
                className="modal-image"
              />
            )}

            {/* Description Overlay - Slides up over media */}
            {!areControlsHidden && (
              <div className={`modal-description-overlay ${isDescriptionExpanded || isHovered ? 'expanded' : ''}`}>
                <div className="description-content">
                  <p className="modal-description">{currentItem.description || currentItem.alt}</p>
                </div>
              </div>
            )}
          </div>

          {/* External toggle button completely decoupled from media boundaries */}
          {!areControlsHidden && (
            <button 
              className="description-toggle-btn-external" 
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              title="Toggle Description Permanently"
            >
              <span className="toggle-text">Description</span>
              <span className="toggle-icon">{isDescriptionExpanded || isHovered ? '▼' : '▲'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return modalRoot ? createPortal(modalContent, modalRoot) : modalContent;
}

/**
 * ModalMusicPlayer Component - Specialized audio player for modal view
 */
function ModalMusicPlayer({ item }) {
  const { currentTrack, isPlaying, currentTime, duration, togglePlayPause, seekTo, playTrack } = useNowPlaying();
  
  const isCurrentlyPlayingTrack = currentTrack && currentTrack.title === item.title;

  const getAlbumCover = () => {
    // Simplified fallback logic for brevity in refined component
    return item.albumCover || "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139229/scispace/media/glassesroompostpc1.png";
  };

  const handlePlayPause = () => {
    if (isCurrentlyPlayingTrack) {
      togglePlayPause();
    } else {
      playTrack({
        title: item.title,
        category: item.category,
        albumCover: getAlbumCover()
      }, item.src);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-music-player">
      <div className="music-card enhanced">
        <div className="music-album-art enhanced">
          <img src={getAlbumCover()} alt={item.title} className="album-cover-image-display" />
        </div>
        <div className="music-content enhanced">
          <div className="music-top-section enhanced">
            <div className="music-info enhanced">
              <h4 className="music-title enhanced">{item.title}</h4>
              <span className="music-category enhanced">{item.category}</span>
            </div>
            <div className="music-controls enhanced">
              <button className="control-btn play-pause enhanced" onClick={handlePlayPause}>
                {isCurrentlyPlayingTrack && isPlaying ? '⏸️' : '▶️'}
              </button>
            </div>
          </div>
          <div className="music-progress enhanced">
            <div className="progress-bar enhanced" onClick={(e) => {
               const rect = e.target.getBoundingClientRect();
               seekTo(((e.clientX - rect.left) / rect.width) * duration);
            }}>
              <div className="progress-fill enhanced" style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }} />
            </div>
            <div className="time-display enhanced">
              <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { GalleryModal, ModalMusicPlayer };

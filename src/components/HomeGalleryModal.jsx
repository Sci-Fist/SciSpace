import React, { useState, useEffect, useRef } from 'react';
import { useLogger } from '../hooks/useLogger.js';
import ModalMusicPlayer from './ModalMusicPlayer.jsx';

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

export default GalleryModal;

import React, { useState, useEffect, useRef } from 'react';
import { useContent } from '../context/ContentContext.jsx';
import { usePage } from '../context/PageContext.jsx';
import '../styles/components/_imageSlideshow.scss';

function ImageSlideshowSection() {
  const { currentPage, getPageControls, updatePageControl, isSlideshowCollapsed, setIsSlideshowCollapsed } = usePage();
  const { getEnabledSlideshows, getUploadedFiles } = useContent();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);
  const controls = getPageControls(currentPage) || {};

  // Get enabled slideshows for current page
  const enabledSlideshows = getEnabledSlideshows(currentPage);
  const allFiles = getUploadedFiles(currentPage);

  // Collect all selected images from enabled slideshows
  const slideshowImages = [];
  const categorySeparators = [];

  enabledSlideshows.forEach(({ category, images: imageIds }) => {
    if (imageIds.length > 0) {
      // Add category separator
      categorySeparators.push({
        type: 'separator',
        category,
        index: slideshowImages.length
      });

      // Add images for this category
      imageIds.forEach(imageId => {
        const image = allFiles.find(file => file.id === imageId);
        if (image) {
          slideshowImages.push({
            ...image,
            category
          });
        }
      });
    }
  });

  // Get slideshow settings from page controls
  const slideshowSpeed = controls.slideshowSpeed || 3; // seconds
  const transitionType = controls.slideshowTransition || 'fade';
  const transitionDuration = controls.slideshowTransitionDuration || 0.5; // seconds
  const autoPlay = controls.slideshowAutoPlay !== false;
  const loop = controls.slideshowLoop !== false;
  const shuffle = controls.slideshowShuffle || false;
  const showThumbnails = controls.slideshowShowThumbnails !== false;
  const showControls = controls.slideshowShowControls !== false;

  // Auto-advance slideshow with configurable speed
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (slideshowImages.length > 1 && isPlaying && autoPlay) {
      intervalRef.current = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentImageIndex(prev => {
            if (shuffle) {
              // Shuffle mode: pick random image
              let newIndex;
              do {
                newIndex = Math.floor(Math.random() * slideshowImages.length);
              } while (newIndex === prev && slideshowImages.length > 1);
              return newIndex;
            } else {
              // Normal mode: next image
              const nextIndex = prev + 1;
              return loop ? nextIndex % slideshowImages.length : Math.min(nextIndex, slideshowImages.length - 1);
            }
          });
          setIsTransitioning(false);
        }, transitionDuration * 1000);
      }, slideshowSpeed * 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [slideshowImages.length, isPlaying, slideshowSpeed, shuffle, loop, transitionDuration, autoPlay]);

  // Reset to first image when images change
  useEffect(() => {
    setCurrentImageIndex(0);
    setIsTransitioning(false);
  }, [slideshowImages.length]);

  const goToNext = () => {
    setCurrentImageIndex(prev => (prev + 1) % slideshowImages.length);
  };

  const goToPrev = () => {
    setCurrentImageIndex(prev => (prev - 1 + slideshowImages.length) % slideshowImages.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (enabledSlideshows.length === 0) {
    return (
      <div className="image-slideshow-section">
        <div className="container">
          <h2 className="section-title">Image Slideshow</h2>
          <div className="slideshow-empty">
            <p>No slideshows enabled yet.</p>
            <small>Use the dev sidebar to enable slideshows for image categories.</small>
          </div>
        </div>
      </div>
    );
  }

  if (slideshowImages.length === 0) {
    return (
      <div className="image-slideshow-section">
        <div className="container">
          <h2 className="section-title">Image Slideshow</h2>
          <div className="slideshow-empty">
            <p>Slideshows are enabled but no images are selected.</p>
            <small>Use the dev sidebar to select images for slideshows.</small>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = slideshowImages[currentImageIndex];

  // Find current category separator
  const currentSeparator = categorySeparators
    .slice()
    .reverse()
    .find(sep => sep.index <= currentImageIndex);

  return (
    <div className={`image-slideshow-section ${isSlideshowCollapsed ? 'collapsed' : ''}`}>

      <div className="container">
        <h2 className="section-title">
          Image Slideshow ({slideshowImages.length} images from {enabledSlideshows.length} categories)
        </h2>

        {currentSeparator && (
          <div className="current-category-indicator">
            <span className="category-badge">{currentSeparator.category}</span>
          </div>
        )}

        <div className="slideshow-main">
          <button
            className="slideshow-nav prev"
            onClick={goToPrev}
            disabled={slideshowImages.length <= 1}
            aria-label="Previous image"
          >
            ‹
          </button>

          <div className="slideshow-image-container">
            {currentImage.needsReupload ? (
              <div className="slideshow-placeholder">
                <span>🔄</span>
                <p>Re-upload needed<br />Browser restart</p>
              </div>
            ) : (
              <img
                src={currentImage.url}
                alt={currentImage.name}
                className={`slideshow-image ${isTransitioning ? 'transitioning' : ''}`}
                style={{
                  transition: `all ${transitionDuration}s ease-in-out`,
                  animation: transitionType === 'instant' ? 'none' :
                           transitionType === 'fade' ? `fadeIn ${transitionDuration}s ease-in-out` :
                           transitionType === 'zoom' ? `zoomIn ${transitionDuration}s ease-in-out` :
                           'none'
                }}
                onError={(e) => {
                  console.error('Slideshow image failed to load:', currentImage.name);
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            )}
            <div className="slideshow-error" style={{ display: 'none' }}>
              <span>✕</span>
              <p>Image Error</p>
            </div>

            <div className="slideshow-info">
              <h3>{currentImage.name}</h3>
              <p>{(currentImage.size / 1024 / 1024).toFixed(2)} MB</p>
              <small>{currentImage.category}</small>
            </div>
          </div>

          <button
            className="slideshow-nav next"
            onClick={goToNext}
            disabled={slideshowImages.length <= 1}
            aria-label="Next image"
          >
            ›
          </button>
        </div>

        {showControls && (
          <div className="slideshow-controls">
            <button
              className="control-btn first-btn"
              onClick={() => setCurrentImageIndex(0)}
              disabled={slideshowImages.length <= 1}
              aria-label="Go to first image"
            >
              ⏮️
            </button>
            <button
              className="control-btn prev-btn"
              onClick={goToPrev}
              disabled={slideshowImages.length <= 1}
              aria-label="Previous image"
            >
              ⏪
            </button>
            <button
              className="control-btn play-pause-btn"
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button
              className="control-btn next-btn"
              onClick={goToNext}
              disabled={slideshowImages.length <= 1}
              aria-label="Next image"
            >
              ⏩
            </button>
            <button
              className="control-btn last-btn"
              onClick={() => setCurrentImageIndex(slideshowImages.length - 1)}
              disabled={slideshowImages.length <= 1}
              aria-label="Go to last image"
            >
              ⏭️
            </button>
            <button
              className={`control-btn shuffle-btn ${shuffle ? 'active' : ''}`}
              onClick={() => updatePageControl(currentPage, 'slideshowShuffle', !shuffle)}
              aria-label={shuffle ? 'Disable shuffle' : 'Enable shuffle'}
            >
              🔀
            </button>
            <button
              className={`control-btn loop-btn ${loop ? 'active' : ''}`}
              onClick={() => updatePageControl(currentPage, 'slideshowLoop', !loop)}
              aria-label={loop ? 'Disable loop' : 'Enable loop'}
            >
              🔁
            </button>
            <span className="slideshow-counter">
              {currentImageIndex + 1} / {slideshowImages.length}
            </span>
          </div>
        )}

        {/* Category separators in slideshow */}
        <div className="category-separators">
          {categorySeparators.map((separator, index) => (
            <div key={index} className="category-separator">
              <span className="separator-line">───</span>
              <span className="separator-text">{separator.category}</span>
              <span className="separator-line">───</span>
            </div>
          ))}
        </div>

        {showThumbnails && (
          <div className="slideshow-thumbnails">
            {slideshowImages.map((image, index) => (
              <button
                key={`${image.id}-${index}`}
                className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
                aria-label={`Go to image ${index + 1}`}
              >
                {image.needsReupload ? (
                  <div className="thumbnail-placeholder">
                    <span>🔄</span>
                    <small>Re-upload</small>
                  </div>
                ) : (
                  <img
                    src={image.url}
                    alt={image.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                )}
                <div className="thumbnail-error" style={{ display: 'none' }}>
                  ✕
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageSlideshowSection;

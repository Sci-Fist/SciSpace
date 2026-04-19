/**
 * HomePage Component - Main landing page with hero section and mixed media gallery
 *
 * Features:
 * - Dynamic hero image slideshow with smooth crossfade transitions
 * - Configurable content via page controls
 * - Integration with MixedMediaGallery for showcasing all content
 * - Responsive layout with background image support
 *
 * Dependencies:
 * - PageContext: Page-level controls and settings
 * - FileManagerContext: Uploaded files for hero images
 * - SlideshowContext: Slideshow configuration and images
 * - TextContentContext: Dynamic text content
 * - MixedMediaGallery: Gallery component for mixed media display
 */
import React, { useState, useEffect, useRef } from 'react';
import { usePage } from '../context/PageContext.jsx'; // Import page context
import { useFileManager } from '../context/FileManagerContext.jsx'; // Import file manager context
import { useSlideshow } from '../context/SlideshowContext.jsx'; // Import slideshow context
import { useTextContent } from '../context/TextContentContext.jsx'; // Import text content context
import { useLogger } from '../hooks/useLogger.js'; // Import logger hook
import MixedMediaGallery from '../components/MixedMediaGallery.jsx'; // Import extracted gallery component
import '../styles/pages/_homePage.scss'; // Specific styles for the home page
const HeroVisual = 'https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139229/scispace/media/glassesroompostpc1.png'; // Your hero image from Cloudinary

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
              {getTextContent('home.artButtonText') || 'Explore Art'}
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

export default HomePage;

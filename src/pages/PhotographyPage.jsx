import React, { useState, useEffect } from 'react';
import { GalleryModal } from '../components/GalleryModal.jsx';
import '../styles/pages/_portfolioPage.scss';

/**
 * PhotographyPage Component - Professional Photography Portfolio Gallery
 *
 * 🎯 ACHIEVEMENT: Dedicated photography portfolio with advanced gallery system
 * - High-quality photography showcase with masonry layout
 * - Professional presentation of photographic work
 * - Consistent with existing portfolio page architecture
 * - Optimized for visual storytelling and artistic presentation
 *
 * 🚀 KEY FEATURES:
 * - Dynamic column calculation (3-6 columns based on viewport width)
 * - View switcher with dropdown (Grid, Masonry, List)
 * - Space-filling algorithm for optimal image arrangement
 * - True masonry layout using CSS columns for natural flow
 * - Real-time responsive adjustment on viewport resize
 * - Professional photography presentation
 * - Full viewport width layout
 *
 * 🔧 TECHNICAL IMPLEMENTATION:
 * - CSS custom properties for dynamic column count
 * - Masonry algorithm: places items in shortest column first
 * - Flexbox grid with calculated flex-basis for controlled columns
 * - CSS columns for true masonry behavior
 * - Photography-specific metadata and presentation
 * - Photography-specific metadata and presentation
 */
function PhotographyPage() {
  // 🎯 CORE STATE MANAGEMENT
  const [columns, setColumns] = useState(4); // Dynamic column count (3-6 based on viewport)
  const [currentLayout, setCurrentLayout] = useState('masonry'); // Current layout mode
  const [showLayoutModal, setShowLayoutModal] = useState(false); // Layout selector modal
  const [imageDimensions, setImageDimensions] = useState({}); // Cache for image dimensions
  const [sortedIndices, setSortedIndices] = useState([]); // Sorted indices for grid view
  const [masonryColumns, setMasonryColumns] = useState([]); // Masonry column arrangement

  // 🎯 MODAL STATE MANAGEMENT - Popout functionality
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate dynamic columns based on viewport width
  const calculateColumns = (width) => {
    if (width >= 1400) return 6;      // Large desktop
    if (width >= 1200) return 5;      // Desktop
    if (width >= 992) return 4;       // Small desktop/tablet
    if (width >= 768) return 3;       // Tablet portrait
    return Math.max(3, Math.min(6, Math.floor(width / 200))); // Minimum 3 columns for masonry
  };

  // Update columns on resize
  useEffect(() => {
    const handleResize = () => {
      const newColumns = calculateColumns(window.innerWidth);
      setColumns(newColumns);
    };

    // Set initial columns
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle image load for space-filling algorithm
  const handleImageLoad = (index, img) => {
    const dimensions = {
      width: img.naturalWidth,
      height: img.naturalHeight,
      aspectRatio: img.naturalWidth / img.naturalHeight,
      area: img.naturalWidth * img.naturalHeight
    };

    setImageDimensions(prev => ({
      ...prev,
      [index]: dimensions
    }));

    // Trigger space-filling sort when all images loaded
    if (Object.keys(imageDimensions).length + 1 >= galleryItems.length && currentLayout === 'grid') {
      setTimeout(() => {
        const sorted = getSortedIndicesForGrid();
        setSortedIndices(sorted);
      }, 100);
    }
  };

  // Space-filling algorithm for optimal image ordering
  const getSortedIndicesForGrid = () => {
    const totalImages = galleryItems.length;
    const loadedImages = Object.keys(imageDimensions).length;

    if (loadedImages < totalImages) {
      return Array.from({ length: totalImages }, (_, i) => i);
    }

    // Sort by space efficiency (lower aspect ratio deviation = better fit)
    const sortedIndices = Array.from({ length: totalImages }, (_, i) => i).sort((a, b) => {
      const dimA = imageDimensions[a];
      const dimB = imageDimensions[b];

      if (!dimA || !dimB) return 0;

      // Calculate efficiency score (closer to 1:1 aspect ratio = better)
      const scoreA = Math.abs(dimA.aspectRatio - 1) * dimA.area;
      const scoreB = Math.abs(dimB.aspectRatio - 1) * dimB.area;

      return scoreA - scoreB;
    });

    return sortedIndices;
  };

  // Advanced Masonry layout algorithm - arrange images in columns using height-based packing
  const arrangeMasonryLayout = () => {
    if (currentLayout !== 'masonry') {
      return [];
    }

    const loadedImages = Object.keys(imageDimensions);
    if (loadedImages.length === 0) {
      // If no images loaded yet, distribute evenly across columns
      const columnItems = Array.from({ length: columns }, () => []);
      galleryItems.forEach((_, imageIndex) => {
        columnItems[imageIndex % columns].push(imageIndex);
      });
      return columnItems;
    }

    const columnHeights = new Array(columns).fill(0);
    const columnItems = Array.from({ length: columns }, () => []);

    // Sort loaded images by height (tallest first for better packing)
    const sortedByHeight = loadedImages.map(Number).sort((a, b) => {
      const heightA = imageDimensions[a]?.height || 200;
      const heightB = imageDimensions[b]?.height || 200;
      return heightB - heightA; // Tallest first
    });

    // Place each loaded image in the shortest column
    sortedByHeight.forEach((imageIndex) => {
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      columnItems[shortestColumnIndex].push(imageIndex);
      columnHeights[shortestColumnIndex] += imageDimensions[imageIndex]?.height || 200;
    });

    // Add unloaded images to columns (distribute evenly)
    const unloadedImages = galleryItems.map((_, i) => i).filter(i => !loadedImages.includes(i.toString()));
    unloadedImages.forEach((imageIndex, i) => {
      columnItems[i % columns].push(imageIndex);
    });

    return columnItems;
  };

  // Update masonry layout when layout changes or images load
  useEffect(() => {
    if (currentLayout === 'masonry') {
      const masonryArrangement = arrangeMasonryLayout();
      setMasonryColumns(masonryArrangement);
    } else if (currentLayout === 'grid') {
      // For grid layout, use masonry algorithm for intelligent space filling
      const masonryArrangement = arrangeMasonryLayout();
      setMasonryColumns(masonryArrangement);
    } else {
      setSortedIndices([]);
      setMasonryColumns([]);
    }
  }, [currentLayout, imageDimensions, columns]);

  // 🎯 MODAL HANDLERS - Popout functionality
  const openModal = (itemIndex) => {
    setSelectedItemIndex(itemIndex);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scroll
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItemIndex(null);
    document.body.style.overflow = 'auto'; // Restore scroll
  };

  const navigateModal = (direction) => {
    const currentIndex = selectedItemIndex;
    const newIndex = currentIndex + direction;
    const maxIndex = galleryItems.length - 1;

    if (newIndex >= 0 && newIndex <= maxIndex) {
      setSelectedItemIndex(newIndex);
    }
  };

  // 🎯 KEYBOARD EVENT HANDLING - Popout functionality
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isModalOpen) return;

      switch (e.key) {
        case 'Escape':
          closeModal();
          break;
        case 'ArrowLeft':
          navigateModal(-1);
          break;
        case 'ArrowRight':
          navigateModal(1);
          break;
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isModalOpen, selectedItemIndex]);

  // Gallery items data - Professional Photography Portfolio
  const galleryItems = [
    // Sushi Photography Series
    {
      src: "/assets/photography/Sushi-1.jpg",
      alt: "Sushi Photography - Fresh Nigiri Presentation",
      title: "Sushi Elegance",
      category: "Food Photography",
      description: "Artistic presentation of traditional Japanese sushi with modern lighting techniques"
    },
    {
      src: "/assets/photography/Sushi-2.jpg",
      alt: "Sushi Photography - Sashimi Arrangement",
      title: "Sashimi Symphony",
      category: "Food Photography",
      description: "Minimalist composition showcasing the purity and freshness of premium sashimi"
    },
    {
      src: "/assets/photography/Sushi-3.jpg",
      alt: "Sushi Photography - Roll Composition",
      title: "Roll Masterpiece",
      category: "Food Photography",
      description: "Creative arrangement of sushi rolls with dramatic lighting and shadow play"
    },
    {
      src: "/assets/photography/Sushi-4.jpg",
      alt: "Sushi Photography - Platter Display",
      title: "Sushi Platter",
      category: "Food Photography",
      description: "Comprehensive sushi platter showcasing variety and culinary artistry"
    },

    // Architectural/Urban Photography
    {
      src: "/assets/photography/01090055.jpg",
      alt: "Architectural Photography - Modern Structure",
      title: "Urban Geometry",
      category: "Architecture",
      description: "Geometric patterns and modern architectural elements captured with precision"
    },
    {
      src: "/assets/photography/01090060.jpg",
      alt: "Urban Photography - Cityscape Detail",
      title: "Metropolitan Detail",
      category: "Urban",
      description: "Intricate details of urban environment showcasing texture and form"
    },
    {
      src: "/assets/photography/01090079.jpg",
      alt: "Architectural Photography - Structural Lines",
      title: "Structural Harmony",
      category: "Architecture",
      description: "Bold lines and structural elements creating visual rhythm and balance"
    },

    // Additional Photography
    {
      src: "/assets/photography/01030007.jpg",
      alt: "Photography Study - 01030007",
      title: "Photography Study 01030007",
      category: "Photography",
      description: "Detailed photographic study capturing unique perspectives and artistic vision"
    },

    // Video Content
    {
      src: "/assets/videos/even tho.mp4",
      alt: "Video Work - Even Though",
      title: "Even Though",
      category: "Video",
      description: "A video exploration capturing movement, emotion, and visual storytelling",
      isVideo: true
    }
  ];

  return (
    <section className="portfolio-page">
      <h2>Photography Portfolio</h2>
      <p>Explore my collection of professional photography, from culinary artistry to architectural studies.</p>

      {/* View Style Selector with Dropdown */}
      <div className="view-style-selector">
        <button
          className="view-style-btn main-btn"
          onClick={() => setShowLayoutModal(true)}
        >
          {currentLayout.charAt(0).toUpperCase() + currentLayout.slice(1)} View
          <span className="dropdown-arrow">▼</span>
        </button>

        {/* Layout Modal */}
        {showLayoutModal && (
          <>
            <div
              className="modal-backdrop"
              onClick={() => setShowLayoutModal(false)}
            />
            <div className="layout-modal">
              <h4>Choose Layout</h4>
              <div className="modal-options">
                <button
                  className={`modal-option ${currentLayout === 'grid' ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentLayout('grid');
                    setShowLayoutModal(false);
                  }}
                >
                  <span className="option-icon">⊞</span>
                  <span>Grid</span>
                </button>
                <button
                  className={`modal-option ${currentLayout === 'masonry' ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentLayout('masonry');
                    setShowLayoutModal(false);
                  }}
                >
                  <span className="option-icon">⊟</span>
                  <span>Masonry</span>
                </button>
                <button
                  className={`modal-option ${currentLayout === 'list' ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentLayout('list');
                    setShowLayoutModal(false);
                  }}
                >
                  <span className="option-icon">☰</span>
                  <span>List</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Dynamic Gallery - Grid, Masonry, or List Layout */}
      {currentLayout === 'masonry' ? (
        /* Masonry Layout - True masonry with CSS columns */
        <div
          className={`gallery-masonry masonry-cols-${columns}`}
          style={{ '--masonry-columns': columns }}
        >
          {/* Render all items in masonry layout */}
          {galleryItems.map((item, imageIndex) => (
            <div
              key={imageIndex}
              className="gallery-item masonry-item"
              data-title={item.title}
              data-category={item.category}
              onClick={() => openModal(imageIndex)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                onLoad={(e) => handleImageLoad(imageIndex, e.target)}
              />
            </div>
          ))}
        </div>
      ) : currentLayout === 'list' ? (
        /* List Layout - Single column with detailed item cards */
        <div className="gallery-list">
          {/* Render items in ordered list format */}
          {galleryItems.map((item, imageIndex) => (
            <div
              key={imageIndex}
              className="gallery-item"
              data-title={item.title}
              data-category={item.category}
              onClick={() => openModal(imageIndex)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                onLoad={(e) => handleImageLoad(imageIndex, e.target)}
              />
              <div className="item-info">
                <h3 className="item-title">{item.title}</h3>
                <p className="item-description">
                  <strong>{item.category}</strong> - {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Grid Layout - Intelligent masonry-based arrangement */
        <div className={`gallery-grid grid-cols-${columns}`}>
          {/* Use masonry algorithm for intelligent space filling */}
          {masonryColumns.length > 0 ? (
            // Render items in masonry-arranged columns
            masonryColumns.flat().map((imageIndex) => {
              const item = galleryItems[imageIndex];
              return (
                <div
                  key={imageIndex}
                  className="gallery-item"
                  data-title={item.title}
                  data-category={item.category}
                  onClick={() => openModal(imageIndex)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    onLoad={(e) => handleImageLoad(imageIndex, e.target)}
                  />
                </div>
              );
            })
          ) : (
            // Fallback: render all items
            galleryItems.map((item, index) => (
              <div
                key={index}
                className="gallery-item"
                data-title={item.title}
                data-category={item.category}
                onClick={() => openModal(index)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  onLoad={(e) => handleImageLoad(index, e.target)}
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* Gallery Modal - Popout functionality */}
      <GalleryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        items={galleryItems}
        currentIndex={selectedItemIndex}
        onNavigate={navigateModal}
      />
    </section>
  );
}

export default PhotographyPage;

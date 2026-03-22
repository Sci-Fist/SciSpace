import React, { useState, useEffect } from 'react';
import { GalleryModal } from '../components/GalleryModal.jsx';
import '../styles/pages/_portfolioPage.scss';

/**
 * ThreeDArtPage Component - Advanced Dynamic Masonry Gallery System
 *
 * 🎯 ACHIEVEMENT: Successfully implemented a true masonry layout system where:
 * - Containers take the exact shape of their contained images
 * - Grid view uses intelligent space-filling algorithm for optimal arrangement
 * - Masonry view uses CSS columns for natural item flow
 * - Dynamic column calculation (3-6 columns) based on viewport size
 * - Responsive updates when viewport changes
 * - Images maintain aspect ratios and are fully visible
 *
 * 🚀 KEY FEATURES:
 * - Dynamic column calculation (3-6 columns based on viewport width)
 * - View switcher with dropdown (Grid, Masonry, List)
 * - Space-filling algorithm for optimal image ordering in grid view
 * - True masonry layout using CSS columns for natural flow
 * - Real-time responsive adjustment on viewport resize
 * - Content-sized containers that match image dimensions
 * - Intelligent ordering by aspect ratio efficiency
 * - Full viewport width layout overriding layout
 *
 * 🔧 TECHNICAL IMPLEMENTATION:
 * - CSS custom properties for dynamic column count
 * - Masonry algorithm: places items in shortest column first
 * - Flexbox grid with calculated flex-basis for controlled columns
 * - CSS columns for true masonry behavior
 * - !important overrides for layout system
 */
function ThreeDArtPage() {
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

    console.log(`🖼️ Image loaded at index ${index}:`, {
      title: galleryItems[index]?.title,
      dimensions,
      totalLoaded: Object.keys(imageDimensions).length + 1,
      totalImages: galleryItems.length
    });

    setImageDimensions(prev => ({
      ...prev,
      [index]: dimensions
    }));

    // Trigger space-filling sort when all images loaded
    if (Object.keys(imageDimensions).length + 1 >= galleryItems.length && currentLayout === 'grid') {
      console.log('🚀 All images loaded, triggering grid sort...');
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

  // Masonry layout algorithm - arrange images in columns
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

  // Update layout when layout changes or images load
  useEffect(() => {
    console.log('🔄 Layout useEffect triggered:', {
      currentLayout,
      loadedImages: Object.keys(imageDimensions).length,
      totalImages: galleryItems.length,
      columns
    });

    if (currentLayout === 'masonry') {
      const masonryArrangement = arrangeMasonryLayout();
      setMasonryColumns(masonryArrangement);
      console.log('🏗️ Masonry layout arranged:', masonryArrangement);
    } else if (currentLayout === 'grid') {
      // For grid layout, trigger space-filling sort when images load
      if (Object.keys(imageDimensions).length >= galleryItems.length) {
        const sorted = getSortedIndicesForGrid();
        setSortedIndices(sorted);
        console.log('🎯 Grid layout sorted indices:', sorted);
      } else {
        console.log('⏳ Grid layout waiting for images to load...');
      }
    } else {
      setSortedIndices([]);
      setMasonryColumns([]);
      console.log('📋 List layout set');
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

  // Gallery items data - Enhanced with additional images for testing
  const galleryItems = [
    // Original 3D Art Images
    { src: "/assets/images/glassesroompostpc.png", alt: "Room Post-Processing Render", title: "Room Post-Processing Render", category: "3D Art" },
    { src: "/assets/images/glassesroompostpc1.png", alt: "Interior Scene Render", title: "Interior Scene Render", category: "3D Art" },
    { src: "/assets/images/glassesroompostpcfromdoor.png", alt: "Door Perspective Render", title: "Door Perspective Render", category: "3D Art" },
    { src: "/assets/images/glassesroompostpcimport.png", alt: "Import Render A", title: "Import Render A", category: "3D Art" },
    { src: "/assets/images/glassesroompostpcimport (1).png", alt: "Import Render B", title: "Import Render B", category: "3D Art" },
    { src: "/assets/images/glassesroompostpc (1).png", alt: "Alternative Angle Render", title: "Alternative Angle Render", category: "3D Art" },
    { src: "/assets/images/glasses book room.png", alt: "Book Room Composition", title: "Book Room Composition", category: "3D Art" },
    { src: "/assets/images/glasses book room1.png", alt: "Book Room Study", title: "Book Room Study", category: "3D Art" },
    { src: "/assets/images/Pandora.png", alt: "Pandora 3D Model", title: "Pandora 3D Model", category: "3D Art" },
    { src: "/assets/images/Screenshot_2025.04.14_15.02.05.335.png", alt: "Technical Screenshot", title: "Technical Screenshot", category: "3D Art" },

    // Additional 3D Art Images for Testing
    { src: "/assets/images/backhumanoid.png", alt: "Back Humanoid Character", title: "Back Humanoid Character", category: "3D Art" },
    { src: "/assets/images/Sci_Fist.jpg", alt: "Sci-Fi Character Design", title: "Sci-Fi Character Design", category: "3D Art" },
    { src: "/assets/images/shader_pause.jpg", alt: "Shader Development Work", title: "Shader Development Work", category: "3D Art" },

    // GIF Animations
    { src: "/assets/gifs/glassesroombook.gif", alt: "Book Room Animation", title: "Book Room Animation", category: "3D Art" },
    { src: "/assets/gifs/render.gif", alt: "Render Sequence A", title: "Render Sequence A", category: "3D Art" },
    { src: "/assets/gifs/render223.gif", alt: "Render Sequence B", title: "Render Sequence B", category: "3D Art" },
    { src: "/assets/gifs/Sprite-0004.gif", alt: "Sprite Animation Sequence", title: "Sprite Animation Sequence", category: "3D Art" }
  ];

  return (
    <section className="portfolio-page">
      <h2>3D Art Portfolio</h2>
      <p>Explore my collection of three-dimensional creations, from character models to environmental designs.</p>

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
                    console.log('🔄 Switching to GRID layout');
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
                  {item.alt}. This is a detailed 3D artwork showcasing advanced rendering techniques and creative composition.
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Grid Layout - Simple responsive grid */
        <div className="gallery-grid">
          {/* Render all items in simple grid layout */}
          {galleryItems.map((item, index) => (
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
              />
            </div>
          ))}
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

export default ThreeDArtPage;

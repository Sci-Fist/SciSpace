import React, { useState, useEffect } from 'react';
import { GalleryModal } from '../components/GalleryModal.jsx';
import '../styles/pages/_portfolioPage.scss';

/**
 * TwoDArtPage Component - Dynamic Grid Gallery with View Controls
 *
 * Intelligent gallery with:
 * - Dynamic column calculation (1-6 columns based on viewport)
 * - View switcher with dropdown (Grid, Masonry, List)
 * - Space-filling algorithm for optimal image ordering
 * - Real-time responsive adjustment
 * - Grid layout starting at viewport left edge
 */
function TwoDArtPage() {
  const [columns, setColumns] = useState(4); // Start with masonry columns
  const [currentLayout, setCurrentLayout] = useState('masonry'); // Default to masonry
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({});
  const [sortedIndices, setSortedIndices] = useState([]);
  const [masonryColumns, setMasonryColumns] = useState([]);

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
    if (Object.keys(imageDimensions).length + 1 >= 17 && currentLayout === 'grid') {
      setTimeout(() => {
        const sorted = getSortedIndicesForGrid();
        setSortedIndices(sorted);
      }, 100);
    }
  };

  // Space-filling algorithm for optimal image ordering
  const getSortedIndicesForGrid = () => {
    const totalImages = 17;
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
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].forEach((imageIndex, i) => {
        columnItems[i % columns].push(imageIndex);
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
    const unloadedImages = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].filter(i => !loadedImages.includes(i.toString()));
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
      const sorted = getSortedIndicesForGrid();
      setSortedIndices(sorted);
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

  // Gallery items data
  const galleryItems = [
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139222/scispace/media/glasses-book-room.png", alt: "Glasses Book Room Study", title: "Glasses Book Room Study", category: "2D Art" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139224/scispace/media/glasses-book-room1.png", alt: "Glasses Book Room Composition", title: "Glasses Book Room Composition", category: "2D Art" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139237/scispace/media/pandora.png", alt: "Pandora Character Design", title: "Pandora Character Design", category: "2D Art" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139228/scispace/media/glassesroompostpc.png", alt: "Room Perspective Study", title: "Room Perspective Study", category: "2D Art" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139229/scispace/media/glassesroompostpc1.png", alt: "Interior Composition", title: "Interior Composition", category: "2D Art" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139231/scispace/media/glassesroompostpcfromdoor.png", alt: "Door Perspective", title: "Door Perspective", category: "2D Art" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139235/scispace/media/glassesroompostpcimport.png", alt: "Import Study A", title: "Import Study A", category: "2D Art" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139233/scispace/media/glassesroompostpcimport-%281%29.png", alt: "Import Study B", title: "Import Study B", category: "2D Art" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139226/scispace/media/glassesroompostpc-%281%29.png", alt: "Alternative Perspective", title: "Alternative Perspective", category: "2D Art" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139239/scispace/media/screenshot_2025.04.14_15.02.05.335.png", alt: "Screenshot Study", title: "Screenshot Study", category: "2D Art" },
    { src: "/assets/gifs/glassesroombook.gif", alt: "Book Room Animation", title: "Book Room Animation", category: "2D Art" },
    { src: "/assets/gifs/render.gif", alt: "Render Animation A", title: "Render Animation A", category: "2D Art" },
    { src: "/assets/gifs/render223.gif", alt: "Render Animation B", title: "Render Animation B", category: "2D Art" },

    // Additional 2D Art Images
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139240/scispace/media/sunken.jpg", alt: "Sunken - Digital Art Study", title: "Sunken Study", category: "2D Art" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139241/scispace/media/sword.png", alt: "Sword Design", title: "Sword Design", category: "2D Art" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139242/scispace/media/untitled-08-07-2024-12-37-07.png", alt: "Untitled Digital Study", title: "Digital Study 08-07-2024", category: "2D Art" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139242/scispace/media/arc_logo_without_first_shot%28small%29.gif", alt: "Arc Logo Animation", title: "Arc Logo Animation", category: "2D Art" }
  ];

  return (
    <section className="portfolio-page">
      <h2>2D Art Portfolio</h2>
      <p>A showcase of my two-dimensional works, including digital paintings, illustrations, and concept art.</p>

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
                  {item.alt}. This is a detailed 2D artwork showcasing digital painting techniques and creative composition.
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

export default TwoDArtPage;

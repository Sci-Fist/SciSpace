import React, { useState, useEffect } from 'react';
import { useLogger } from '../hooks/useLogger.js';
import { useFileManager } from '../context/FileManagerContext.jsx';
import { useSlideshow } from '../context/SlideshowContext.jsx';
import MusicCard from './MusicCard.jsx';
import HomeGalleryModal from './HomeGalleryModal.jsx';

// Mixed Media Gallery Component - Advanced masonry system with music playback
function MixedMediaGallery() {
  const logger = useLogger();

  logger.debug('Component rendering started', {
    timestamp: new Date().toISOString(),
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight
  }, 'gallery');

  const { getUploadedFiles } = useFileManager();
  const { getEnabledSlideshows } = useSlideshow();

  // 🎯 CORE STATE MANAGEMENT - Same as ThreeDArtPage
  const [columns, setColumns] = useState(4);
  const [currentLayout, setCurrentLayout] = useState('masonry');
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({});
  const [sortedIndices, setSortedIndices] = useState([]);
  const [masonryColumns, setMasonryColumns] = useState([]);

  // 🎯 MODAL STATE MANAGEMENT - Popout functionality
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🎯 MODAL HANDLERS - Popout functionality
  const openModal = (itemIndex) => {
    logger.debug('Opening modal for item', {
      itemIndex,
      totalItems: displayItems.length,
      itemTitle: displayItems[itemIndex]?.title,
      itemCategory: displayItems[itemIndex]?.category,
      itemType: displayItems[itemIndex]?.type
    }, 'modal');

    setSelectedItemIndex(itemIndex);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scroll

    logger.debug('Modal opened successfully', {
      selectedItemIndex: itemIndex,
      isModalOpen: true,
      bodyScrollDisabled: true
    }, 'modal');
  };

  const closeModal = () => {
    logger.debug('Closing modal', {
      currentItemIndex: selectedItemIndex,
      currentItemTitle: displayItems[selectedItemIndex]?.title
    }, 'modal');

    setIsModalOpen(false);
    setSelectedItemIndex(null);
    document.body.style.overflow = 'auto'; // Restore scroll

    logger.debug('Modal closed successfully', {
      selectedItemIndex: null,
      isModalOpen: false,
      bodyScrollRestored: true
    }, 'modal');
  };

  const navigateModal = (direction) => {
    const currentIndex = selectedItemIndex;
    const newIndex = currentIndex + direction;
    const maxIndex = displayItems.length - 1;

    logger.debug('Attempting modal navigation', {
      direction,
      currentIndex,
      newIndex,
      maxIndex,
      isValid: newIndex >= 0 && newIndex <= maxIndex
    }, 'modal');

    if (newIndex >= 0 && newIndex <= maxIndex) {
      setSelectedItemIndex(newIndex);
      logger.debug('Modal navigation successful', {
        fromIndex: currentIndex,
        toIndex: newIndex,
        newItemTitle: displayItems[newIndex]?.title,
        newItemCategory: displayItems[newIndex]?.category
      }, 'modal');
    } else {
      logger.debug('Modal navigation blocked - out of bounds', {
        attemptedIndex: newIndex,
        validRange: `0-${maxIndex}`
      }, 'modal');
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

  logger.debug('State initialized', {
    columns,
    currentLayout,
    showLayoutModal,
    timestamp: new Date().toISOString()
  }, 'gallery');

  // Calculate dynamic columns based on viewport width - Same as 3D art gallery
  const calculateColumns = (width) => {
    logger.debug('Calculating columns for width', { width }, 'gallery');
    let result;
    if (width >= 1400) result = 6;
    else if (width >= 1200) result = 5;
    else if (width >= 992) result = 4;
    else if (width >= 768) result = 3;
    else result = Math.max(3, Math.min(6, Math.floor(width / 200)));

    logger.debug('Column calculation result', {
      width,
      result,
      breakpoint: width >= 1400 ? '1400+' :
                  width >= 1200 ? '1200-1399' :
                  width >= 992 ? '992-1199' :
                  width >= 768 ? '768-991' : 'fallback'
    }, 'gallery');
    return result;
  };

  // Update columns on resize - Same as 3D art gallery
  useEffect(() => {
    const handleResize = () => {
      const newColumns = calculateColumns(window.innerWidth);
      logger.debug('Resize detected, updating columns', {
        oldColumns: columns,
        newColumns,
        windowWidth: window.innerWidth
      }, 'gallery');
      setColumns(newColumns);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    logger.debug('Resize event listener added', {}, 'gallery');

    return () => {
      window.removeEventListener('resize', handleResize);
      logger.debug('Resize event listener removed', {}, 'gallery');
    };
  }, []);

  // Handle image load for space-filling algorithm - Same as ThreeDArtPage
  const handleImageLoad = (index, img) => {
    const dimensions = {
      width: img.naturalWidth,
      height: img.naturalHeight,
      aspectRatio: img.naturalWidth / img.naturalHeight,
      area: img.naturalWidth * img.naturalHeight
    };

    logger.debug(`🖼️ Image loaded at index ${index}:`, {
      title: displayItems[index]?.title,
      dimensions,
      totalLoaded: Object.keys(imageDimensions).length + 1,
      totalImages: displayItems.length
    }, 'gallery');

    setImageDimensions(prev => ({
      ...prev,
      [index]: dimensions
    }));

    // Trigger space-filling sort when all images loaded
    if (Object.keys(imageDimensions).length + 1 >= displayItems.length && currentLayout === 'grid') {
      logger.debug('🚀 All images loaded, triggering grid sort...', {}, 'gallery');
      setTimeout(() => {
        const sorted = getSortedIndicesForGrid();
        setSortedIndices(sorted);
      }, 100);
    }
  };

  // Space-filling algorithm for optimal image ordering - Same as ThreeDArtPage
  const getSortedIndicesForGrid = () => {
    const totalImages = displayItems.length;
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

  // Masonry layout algorithm - arrange images in columns - Same as ThreeDArtPage
  const arrangeMasonryLayout = () => {
    if (currentLayout !== 'masonry') {
      return [];
    }

    const loadedImages = Object.keys(imageDimensions);
    if (loadedImages.length === 0) {
      // If no images loaded yet, distribute evenly across columns
      const columnItems = Array.from({ length: columns }, () => []);
      displayItems.forEach((_, imageIndex) => {
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
    const unloadedImages = displayItems.map((_, i) => i).filter(i => !loadedImages.includes(i.toString()));
    unloadedImages.forEach((imageIndex, i) => {
      columnItems[i % columns].push(imageIndex);
    });

    return columnItems;
  };

  // Update layout when layout changes or images load - Same as ThreeDArtPage
  useEffect(() => {
    logger.debug('🔄 Layout useEffect triggered:', {
      currentLayout,
      loadedImages: Object.keys(imageDimensions).length,
      totalImages: displayItems.length,
      columns
    }, 'gallery');

    if (currentLayout === 'masonry') {
      const masonryArrangement = arrangeMasonryLayout();
      setMasonryColumns(masonryArrangement);
      logger.debug('🏗️ Masonry layout arranged:', masonryArrangement, 'gallery');
    } else if (currentLayout === 'grid') {
      // For grid layout, trigger space-filling sort when images load
      if (Object.keys(imageDimensions).length >= displayItems.length) {
        const sorted = getSortedIndicesForGrid();
        setSortedIndices(sorted);
        logger.debug('🎯 Grid layout sorted indices:', sorted, 'gallery');
      } else {
        logger.debug('⏳ Grid layout waiting for images to load...', {}, 'gallery');
      }
    } else {
      setSortedIndices([]);
      setMasonryColumns([]);
      logger.debug('📋 List layout set', {}, 'gallery');
    }
  }, [currentLayout, imageDimensions, columns]);

  // Collect all media content from the website
  const allFiles = getUploadedFiles('/');
  const enabledSlideshows = getEnabledSlideshows('/');

  // Build comprehensive gallery from all content types
  const galleryItems = [];

  // Add images from all slideshow categories
  enabledSlideshows.forEach(({ category, images: imageIds }) => {
    if (imageIds.length > 0) {
      imageIds.forEach(imageId => {
        const image = allFiles.find(file => file.id === imageId);
        if (image) {
          galleryItems.push({
            src: image.url,
            alt: `${category} - ${image.name}`,
            title: image.name,
            category: category,
            type: 'image'
          });
        }
      });
    }
  });

  // Centralized album cover mapping for consistent, meaningful cover assignment
  const albumCoverMapping = {
    "Banger": "/assets/images/glassesroompostpc1.png", // Futuristic room - energetic electronic
    "Blaaaaaaaa": "/assets/photography/Sushi-2.jpg", // Sushi - ambient, atmospheric
    "Melancholische Scheiße": "/assets/images/shader_pause.jpg", // Shader work - melancholic, introspective
    "Strange V2-1": "/assets/images/Sci_Fist.jpg", // Digital portrait - experimental, abstract
    "Strange V2": "/assets/images/Sci_Fist.jpg", // Digital portrait - experimental, abstract
    "Chronic Stress Syndrom": "/assets/photography/Sushi-1.jpg", // Sushi - meditative, calm
    "Idee1": "/assets/images/backhumanoid.png", // Sci-fi character - conceptual, abstract
    "Still": "/assets/photography/01090055.jpg", // Architecture - serene, calm
    "Sci Fist": "/assets/images/Sci_Fist.jpg", // Digital portrait - track cover
    "Shader Pause": "/assets/images/shader_pause.jpg", // Shader work - track cover
    "Sunken": "/assets/images/Sunken.jpeg", // Abstract art - track cover
    "Sword": "/assets/images/Sword.png", // Fantasy art - track cover
    "Pandora": "/assets/images/Pandora.png", // Character art - track cover
    "Back Humanoid": "/assets/images/backhumanoid.png", // Sci-fi character - track cover
    "Glasses Book Room": "/assets/images/glasses book room.png", // Room scene - album cover
    "Glasses Book Room Vol. 2": "/assets/images/glasses book room1.png", // Room scene variant - album cover
    "Room Perspective": "/assets/images/glassesroompostpc.png", // Room perspective - album cover
    "Pixel Art Collection": "/assets/images/Sharing my pixel art.png", // Pixel art - album cover
    "Untitled Study": "/assets/images/Untitled 08-07-2024 12-37-07.png", // Digital study - album cover
    "Digital Study": "/assets/images/Screenshot_2025.04.14_15.02.05.335.png" // Digital study - album cover
  };

  // Add static assets from different categories
  const staticAssets = [
    // 3D Art
    {
      src: "/assets/images/glassesroompostpc.png",
      title: "3D Room Render",
      category: "3D Art",
      type: "image",
      description: "A detailed 3D render of a futuristic room with glass elements and post-processing effects. Showcasing advanced lighting techniques and material properties in a sci-fi environment."
    },
    {
      src: "/assets/images/glassesroompostpc1.png",
      title: "Interior Scene",
      category: "3D Art",
      type: "image",
      description: "An immersive interior scene featuring glass architecture and atmospheric lighting. Demonstrates mastery of volumetric fog, reflections, and spatial composition in 3D art."
    },
    {
      src: "/assets/images/Pandora.png",
      title: "Character Model",
      category: "3D Art",
      type: "image",
      description: "A stylized character model with intricate detailing and dynamic posing. Features custom textures, rigging, and expressive facial features that bring personality to the digital creation."
    },
    {
      src: "/assets/images/backhumanoid.png",
      title: "Sci-Fi Character",
      category: "3D Art",
      type: "image",
      description: "A biomechanical humanoid character design blending organic and mechanical elements. Explores themes of transhumanism through detailed anatomical and technological integration."
    },

    // 2D Art
    {
      src: "/assets/images/Sci_Fist.jpg",
      title: "Digital Portrait",
      category: "2D Art",
      type: "image",
      description: "A striking digital portrait combining photorealistic techniques with artistic interpretation. Features dramatic lighting, detailed textures, and emotional depth in the subject's expression."
    },
    {
      src: "/assets/images/shader_pause.jpg",
      title: "Shader Work",
      category: "2D Art",
      type: "image",
      description: "An exploration of shader effects and visual programming. Demonstrates complex mathematical functions translated into beautiful, dynamic visual patterns and color gradients."
    },

    // Photography
    {
      src: "/assets/photography/Sushi-1.jpg",
      title: "Culinary Photography",
      category: "Photography",
      type: "image",
      description: "Professional food photography capturing the artistry of sushi presentation. Features careful composition, lighting, and focus on texture, color, and culinary craftsmanship."
    },
    {
      src: "/assets/photography/Sushi-2.jpg",
      title: "Food Art",
      category: "Photography",
      type: "image",
      description: "Creative food photography transforming culinary elements into artistic compositions. Explores the intersection of gastronomy and visual art through innovative presentation."
    },
    {
      src: "/assets/photography/01090055.jpg",
      title: "Architecture",
      category: "Photography",
      type: "image",
      description: "Architectural photography capturing the geometric beauty and structural elegance of modern design. Emphasizes lines, shadows, and the interplay of light and form."
    },

    // Sketches
    {
      src: "/assets/sketching/spider 1.JPG",
      title: "Life Drawing",
      category: "Sketches",
      type: "image",
      description: "Traditional life drawing study capturing human form and anatomy. Demonstrates observational skills, gesture, and the fundamental principles of figure drawing with charcoal and paper."
    },

    // Animations/GIFs
    {
      src: "/assets/gifs/glassesroombook.gif",
      title: "3D Animation",
      category: "Animation",
      type: "gif",
      description: "A short animated sequence exploring a 3D environment with glass elements. Showcases camera movement, lighting dynamics, and the illusion of depth in animated storytelling."
    },
    {
      src: "/assets/gifs/render.gif",
      title: "Render Sequence",
      category: "Animation",
      type: "gif",
      description: "A technical animation demonstrating rendering processes and visual effects. Illustrates the transformation from raw 3D data to final polished imagery through computational artistry."
    },

    // Music (represented as audio thumbnails with meaningful album covers)
    {
      src: "/assets/music/Banger.mp4",
      title: "Banger",
      category: "Music",
      type: "audio",
      albumCover: albumCoverMapping["Banger"],
      description: "An energetic electronic composition featuring driving beats and synthesized melodies. Combines modern production techniques with creative sound design for an immersive auditory experience."
    },
    {
      src: "/assets/music/blaaaaaaaaaaa.mp4",
      title: "Blaaaaaaaa",
      category: "Music",
      type: "audio",
      albumCover: albumCoverMapping["Blaaaaaaaa"],
      description: "A minimalist ambient piece designed for contemplation and atmosphere. Uses subtle textures, drones, and spatial effects to create an immersive sonic environment."
    },
    {
      src: "/assets/music/melancholische scheiße.mp4",
      title: "Melancholische Scheiße",
      category: "Music",
      type: "audio",
      albumCover: albumCoverMapping["Melancholische Scheiße"],
      description: "An emotive musical work exploring themes of melancholy and introspection. Features delicate instrumentation, emotional phrasing, and thoughtful harmonic progressions."
    },
    {
      src: "/assets/music/StrangeV2-1.wav",
      title: "Strange V2-1",
      category: "Music",
      type: "audio",
      albumCover: albumCoverMapping["Strange V2-1"],
      description: "Cutting-edge experimental sound art pushing the boundaries of conventional music. Incorporates unconventional sound sources, processing techniques, and abstract compositional structures."
    }
  ];

  // Add static assets that aren't already in slideshows
  staticAssets.forEach(asset => {
    const exists = galleryItems.some(item => item.src === asset.src);
    if (!exists) {
      galleryItems.push(asset);
    }
  });

  // Limit to 24 items for performance and avoid overwhelming the home page
  const displayItems = galleryItems.slice(0, 24);

  logger.debug('Final data prepared', {
    totalGalleryItems: galleryItems.length,
    displayItemsCount: displayItems.length,
    columns,
    currentLayout
  }, 'gallery');

  logger.debug('About to render section with class "mixed-media-gallery-section"', {}, 'gallery');

  return (
    <section className="mixed-media-gallery-section">
      <div className="mixed-media-gallery-container">
        <h3>Mixed Media Showcase</h3>
        <p>Explore the diverse creative work across all mediums</p>

        {/* View Style Selector with Dropdown - Moved inside container below text */}
        <div className="view-style-selector">
          <button
            className="view-style-btn main-btn"
            onClick={() => {
              logger.debug('Layout modal opened', {}, 'gallery');
              setShowLayoutModal(true);
            }}
          >
            {currentLayout.charAt(0).toUpperCase() + currentLayout.slice(1)} View
            <span className="dropdown-arrow">▼</span>
          </button>

          {/* Layout Modal */}
          {showLayoutModal && (
            <>
              <div
                className="modal-backdrop"
                onClick={() => {
                  logger.debug('Layout modal closed via backdrop', {}, 'gallery');
                  setShowLayoutModal(false);
                }}
              />
              <div className="layout-modal">
                <h4>Choose Layout</h4>
                <div className="modal-options">
                  <button
                    className={`modal-option ${currentLayout === 'grid' ? 'active' : ''}`}
                    onClick={() => {
                      logger.debug('Layout changed to grid', {}, 'gallery');
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
                      logger.debug('Layout changed to masonry', {}, 'gallery');
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
                      logger.debug('Layout changed to list', {}, 'gallery');
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

        {/* Position verification logging */}
        {(() => {
          logger.debug('Rendering with layout and columns', {
            layout: currentLayout,
            columns,
            sectionClass: 'mixed-media-gallery-section',
            containerClass: 'mixed-media-gallery-container',
            galleryClass: currentLayout === 'masonry' ? `mixed-media-gallery-masonry masonry-cols-${columns}` :
                         currentLayout === 'list' ? 'mixed-media-gallery-list' :
                         `mixed-media-gallery-grid grid-cols-${columns}`
          }, 'gallery');
          return null;
        })()}

        {/* Dynamic Gallery - Grid, Masonry, or List Layout */}
        {currentLayout === 'masonry' ? (
          /* Masonry Layout - Using same implementation as 3D art gallery */
          <div
            className={`gallery-masonry masonry-cols-${columns}`}
            style={{ '--masonry-columns': columns }}
          >
            {/* Render all items in masonry layout - same as 3D art gallery */}
            {displayItems.map((item, imageIndex) => (
            <div
              key={imageIndex}
              className="gallery-item masonry-item"
              data-title={item.title}
              data-category={item.category}
              onClick={() => openModal(imageIndex)}
              style={{ cursor: 'pointer' }}
            >
                {item.type === 'audio' ? (
                  <MusicCard
                    item={item}
                    onClick={() => openModal(imageIndex)}
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    onLoad={(e) => handleImageLoad(imageIndex, e.target)}
                  />
                )}
              </div>
            ))}
          </div>
        ) : currentLayout === 'list' ? (
          /* List Layout - Single column with detailed item cards - Same as 3D art gallery */
          <div className="gallery-list">
            {/* Render items in ordered list format - Same as 3D art gallery */}
            {displayItems.map((item, imageIndex) => (
              <div
                key={imageIndex}
                className="gallery-item"
                data-title={item.title}
                data-category={item.category}
                onClick={() => openModal(imageIndex)}
                style={{ cursor: 'pointer' }}
              >
                {item.type === 'audio' ? (
                  <MusicCard
                    item={item}
                    onClick={() => openModal(imageIndex)}
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    onLoad={(e) => handleImageLoad(imageIndex, e.target)}
                  />
                )}
                <div className="item-info">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-description">
                    {item.alt}. This is a detailed creative work showcasing artistic expression and technical skill.
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Grid Layout - Simple grid arrangement - Same as 3D art gallery */
          <div className="gallery-grid">
            {/* Render all items in simple grid - Same as 3D art gallery */}
            {displayItems.map((item, index) => (
              <div
                key={index}
                className="gallery-item"
                data-title={item.title}
                data-category={item.category}
                onClick={() => openModal(index)}
                style={{ cursor: 'pointer' }}
              >
                {item.type === 'audio' ? (
                  <MusicCard
                    item={item}
                    onClick={() => openModal(index)}
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="gallery-actions">
          <a href="/3d-art" className="btn secondary-btn">View 3D Art Gallery</a>
          <a href="/photography" className="btn secondary-btn">View Photography</a>
          <a href="/sketches" className="btn secondary-btn">View Sketches</a>
          <a href="/music" className="btn secondary-btn">Listen to Music</a>
        </div>
      </div>

      {/* Gallery Modal - Popout functionality */}
      <HomeGalleryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        items={displayItems}
        currentIndex={selectedItemIndex}
        onNavigate={navigateModal}
      />
    </section>
  );
}

export default MixedMediaGallery;

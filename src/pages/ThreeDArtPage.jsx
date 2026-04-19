import React, { useState, useEffect } from 'react';
import { useContent } from '../context/ContentContext.jsx';
import { GalleryModal } from '../components/GalleryModal.jsx';
import '../styles/pages/_portfolioPage.scss';

/**
 * ThreeDArtPage Component - Dynamic Grid Gallery with View Controls
 */
function ThreeDArtPage() {
  const { registerPageMedia, getGalleryMedia, isLoading } = useContent();
  const [columns, setColumns] = useState(4);
  const [currentLayout, setCurrentLayout] = useState('masonry');
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({});

  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Real gallery items with actual Cloudinary URLs
  const defaultGalleryItems = [
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139228/scispace/media/glassesroompostpc.png", alt: "Room Post-Processing Render", title: "Room Post-Processing Render", category: "Renders" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139229/scispace/media/glassesroompostpc1.png", alt: "Interior Scene Render", title: "Interior Scene Render", category: "Renders" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139231/scispace/media/glassesroompostpcfromdoor.png", alt: "Door Perspective Render", title: "Door Perspective Render", category: "Renders" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139235/scispace/media/glassesroompostpcimport.png", alt: "Import Render A", title: "Import Render A", category: "Environments" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139233/scispace/media/glassesroompostpcimport-%281%29.png", alt: "Import Render B", title: "Import Render B", category: "Environments" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139226/scispace/media/glassesroompostpc-%281%29.png", alt: "Alternative Angle Render", title: "Alternative Angle Render", category: "Environments" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139222/scispace/media/glasses-book-room.png", alt: "Book Room Composition", title: "Book Room Composition", category: "Renders" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139224/scispace/media/glasses-book-room1.png", alt: "Book Room Study", title: "Book Room Study", category: "Renders" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139237/scispace/media/pandora.png", alt: "Pandora 3D Model", title: "Pandora 3D Model", category: "Models" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139239/scispace/media/screenshot_2025.04.14_15.02.05.335.png", alt: "Technical Screenshot", title: "Technical Screenshot", category: "Models" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139219/scispace/media/backhumanoid.png", alt: "Back Humanoid Character", title: "Back Humanoid Character", category: "Characters" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139238/scispace/media/sci_fist.jpg", alt: "Sci-Fi Character Design", title: "Sci-Fi Character Design", category: "Characters" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139240/scispace/media/shader_pause.jpg", alt: "Shader Development Work", title: "Shader Development Work", category: "Environments" },
    { src: "/assets/gifs/glassesroombook.gif", alt: "Book Room Animation", title: "Book Room Animation", category: "Renders" },
    { src: "/assets/gifs/render.gif", alt: "Render Sequence A", title: "Render Sequence A", category: "Renders" },
    { src: "/assets/gifs/render223.gif", alt: "Render Sequence B", title: "Render Sequence B", category: "Models" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139260/scispace/media/sprite-0004.gif", alt: "Sprite Animation Sequence", title: "Sprite Animation Sequence", category: "Characters" }
  ];

  // 2. Register these items with the global context (Seeding)
  useEffect(() => {
    registerPageMedia('/3d-art', defaultGalleryItems);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Consume Dynamic Gallery Items from Context
  const galleryItems = getGalleryMedia('/3d-art');

  const calculateColumns = (width) => {
    if (width >= 1400) return 6;
    if (width >= 1200) return 5;
    if (width >= 992) return 4;
    if (width >= 768) return 3;
    return Math.max(3, Math.min(6, Math.floor(width / 200)));
  };

  useEffect(() => {
    const handleResize = () => setColumns(calculateColumns(window.innerWidth));
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleImageLoad = (index, img) => {
    setImageDimensions(prev => ({
      ...prev,
      [index]: { width: img.naturalWidth, height: img.naturalHeight }
    }));
  };

  const openModal = (index) => {
    setSelectedItemIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItemIndex(null);
    document.body.style.overflow = 'auto';
  };

  const navigateModal = (direction) => {
    const newIdx = selectedItemIndex + direction;
    if (newIdx >= 0 && newIdx < galleryItems.length) setSelectedItemIndex(newIdx);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isModalOpen) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') navigateModal(-1);
      if (e.key === 'ArrowRight') navigateModal(1);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, selectedItemIndex, galleryItems.length]);

  if (isLoading) return <div className="loading-state">Initialising Aether Stream...</div>;

  return (
    <section className="portfolio-page">
      <h2>3D Art Portfolio</h2>
      <p>A collection of my three-dimensional works, ranging from architectural renders to detailed character models.</p>

      {/* View Style Selector with Dropdown */}
      <div className="view-style-selector">
        <button className="view-style-btn" onClick={() => setShowLayoutModal(!showLayoutModal)}>
          {currentLayout.charAt(0).toUpperCase() + currentLayout.slice(1)} View
          <span className="dropdown-arrow">▼</span>
        </button>

        {showLayoutModal && (
          <>
            <div className="modal-backdrop" onClick={() => setShowLayoutModal(false)} />
            <div className="layout-modal">
              <h4>Choose Layout</h4>
              <div className="modal-options">
                {[
                  { id: 'grid', label: 'Grid', icon: '⊞' },
                  { id: 'masonry', label: 'Masonry', icon: '⊟' },
                  { id: 'list', label: 'List', icon: '☰' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    className={`modal-option ${currentLayout === opt.id ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentLayout(opt.id);
                      setShowLayoutModal(false);
                    }}
                  >
                    <span className="option-icon">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="gallery-container">
        {currentLayout === 'masonry' ? (
          <div className="gallery-masonry" style={{ '--masonry-columns': columns }}>
            {galleryItems.map((item, i) => (
              <div key={item.id || i} className="gallery-item" data-title={item.title} data-category={item.category} onClick={() => openModal(i)}>
                <img src={item.src} alt={item.alt} loading="lazy" onLoad={(e) => handleImageLoad(i, e.target)} />
              </div>
            ))}
          </div>
        ) : currentLayout === 'list' ? (
          <div className="gallery-list">
            {galleryItems.map((item, i) => (
              <div key={item.id || i} className="gallery-item" onClick={() => openModal(i)}>
                <img src={item.src} alt={item.alt} />
                <div className="item-info">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-description">{item.alt}. Advanced rendering study.</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="gallery-grid">
            {galleryItems.map((item, i) => (
              <div key={item.id || i} className="gallery-item" data-title={item.title} data-category={item.category} onClick={() => openModal(i)}>
                <img src={item.src} alt={item.alt} loading="lazy" />
              </div>
            ))}
          </div>
        )}
      </div>

      <GalleryModal isOpen={isModalOpen} onClose={closeModal} items={galleryItems} currentIndex={selectedItemIndex} onNavigate={navigateModal} />
    </section>
  );
}

export default ThreeDArtPage;

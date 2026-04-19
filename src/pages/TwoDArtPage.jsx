import React, { useState, useEffect } from 'react';
import { useContent } from '../context/ContentContext.jsx';
import { GalleryModal } from '../components/GalleryModal.jsx';
import '../styles/pages/_portfolioPage.scss';

/**
 * TwoDArtPage Component - Dynamic Grid Gallery with View Controls
 */
function TwoDArtPage() {
  const { registerPageMedia, getGalleryMedia, isLoading } = useContent();
  const [columns, setColumns] = useState(4);
  const [currentLayout, setCurrentLayout] = useState('masonry');
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({});

  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Initial Defaults for Bootstrapping
  const defaultGalleryItems = [
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139222/scispace/media/glasses-book-room.png", alt: "Glasses Book Room Study", title: "Glasses Book Room Study", category: "Digital Paintings" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139224/scispace/media/glasses-book-room1.png", alt: "Glasses Book Room Composition", title: "Glasses Book Room Composition", category: "Digital Paintings" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139237/scispace/media/pandora.png", alt: "Pandora Character Design", title: "Pandora Character Design", category: "Concept Art" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139228/scispace/media/glassesroompostpc.png", alt: "Room Perspective Study", title: "Room Perspective Study", category: "Digital Paintings" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139229/scispace/media/glassesroompostpc1.png", alt: "Interior Composition", title: "Interior Composition", category: "Digital Paintings" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139231/scispace/media/glassesroompostpcfromdoor.png", alt: "Door Perspective", title: "Door Perspective", category: "Digital Paintings" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139235/scispace/media/glassesroompostpcimport.png", alt: "Import Study A", title: "Import Study A", category: "Illustrations" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139233/scispace/media/glassesroompostpcimport-%281%29.png", alt: "Import Study B", title: "Import Study B", category: "Illustrations" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139226/scispace/media/glassesroompostpc-%281%29.png", alt: "Alternative Perspective", title: "Alternative Perspective", category: "Illustrations" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139239/scispace/media/screenshot_2025.04.14_15.02.05.335.png", alt: "Screenshot Study", title: "Screenshot Study", category: "2D Art" },
    { src: "/assets/gifs/glassesroombook.gif", alt: "Book Room Animation", title: "Book Room Animation", category: "2D Art" },
    { src: "/assets/gifs/render.gif", alt: "Render Animation A", title: "Render Animation A", category: "2D Art" },
    { src: "/assets/gifs/render223.gif", alt: "Render Animation B", title: "Render Animation B", category: "2D Art" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139240/scispace/media/sunken.jpg", alt: "Sunken Study", title: "Sunken Study", category: "Digital Paintings" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139241/scispace/media/sword.png", alt: "Sword Design", title: "Sword Design", category: "Concept Art" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139242/scispace/media/untitled-08-07-2024-12-37-07.png", alt: "Untitled Digital Study", title: "Digital Study 08-07-2024", category: "Digital Paintings" },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139242/scispace/media/arc_logo_without_first_shot%28small%29.gif", alt: "Arc Logo Animation", title: "Arc Logo Animation", category: "2D Art" }
  ];

  // 2. Seeding
  useEffect(() => {
    registerPageMedia('/2d-art', defaultGalleryItems);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Dynamic Data
  const galleryItems = getGalleryMedia('/2d-art');

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
      <h2>2D Art Portfolio</h2>
      <p>A showcase of my two-dimensional works, including digital paintings and illustrations.</p>

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
              <div key={item.id || i} className="gallery-item" onClick={() => openModal(i)} data-title={item.title} data-category={item.category}>
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
                  <p className="item-description">{item.alt}. Digital art study.</p>
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

export default TwoDArtPage;

import React, { useState, useEffect } from 'react';
import { useContent } from '../context/ContentContext.jsx';
import { GalleryModal } from '../components/GalleryModal.jsx';
import '../styles/pages/_portfolioPage.scss';

/**
 * PhotographyPage Component - Professional Photography Portfolio Gallery
 */
function PhotographyPage() {
  const { registerPageMedia, getGalleryMedia, isLoading } = useContent();
  const [columns, setColumns] = useState(4);
  const [currentLayout, setCurrentLayout] = useState('masonry');
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({});

  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Initial Defaults
  const defaultGalleryItems = [
    { src: "/assets/photography/Sushi-1.jpg", alt: "Sushi Elegance", title: "Sushi Elegance", category: "Food Photography", description: "Traditional Japanese sushi study." },
    { src: "/assets/photography/Sushi-2.jpg", alt: "Sashimi Symphony", title: "Sashimi Symphony", category: "Food Photography", description: "Minimalist composition." },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139280/scispace/media/sushi-3.jpg", alt: "Roll Masterpiece", title: "Roll Masterpiece", category: "Food Photography", description: "Creative sushi arrangements." },
    { src: "/assets/photography/Sushi-4.jpg", alt: "Sushi Platter", title: "Sushi Platter", category: "Food Photography", description: "Culinary artistry." },
    { src: "/assets/photography/01090055.jpg", alt: "Urban Geometry", title: "Urban Geometry", category: "Architecture", description: "Modern structural capture." },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139267/scispace/media/01090060.jpg", alt: "Metropolitan Detail", title: "Metropolitan Detail", category: "Urban", description: "Cityscape texture." },
    { src: "/assets/photography/01090079.jpg", alt: "Structural Harmony", title: "Structural Harmony", category: "Architecture", description: "Bold architectural lines." },
    { src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139261/scispace/media/01030007.jpg", alt: "Photography Study", title: "Study 01030007", category: "Urban", description: "Detailed perspective." },
    { src: "https://res.cloudinary.com/ddrvulhwz/video/upload/v1774139323/scispace/music/even-tho.mp4", alt: "Even Though Video", title: "Even Though", category: "Video", description: "Movement and emotion.", isVideo: true }
  ];

  // 2. Seeding
  useEffect(() => {
    registerPageMedia('/photography', defaultGalleryItems);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Dynamic Data
  const galleryItems = getGalleryMedia('/photography');

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
      <h2>Photography Portfolio</h2>
      <p>Professional photography series across food, architecture, and urban environments.</p>

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
        {currentLayout === 'masonry' || currentLayout === 'grid' ? (
          <div className="gallery-masonry" style={{ '--masonry-columns': columns }}>
            {galleryItems.map((item, i) => (
              <div key={item.id || i} className="gallery-item" onClick={() => openModal(i)} data-title={item.title} data-category={item.category}>
                <img src={item.src} alt={item.alt} loading="lazy" onLoad={(e) => handleImageLoad(i, e.target)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="gallery-list">
            {galleryItems.map((item, i) => (
              <div key={item.id || i} className="gallery-item" onClick={() => openModal(i)}>
                <img src={item.src} alt={item.alt} />
                <div className="item-info">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-description"><strong>{item.category}</strong> - {item.alt}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <GalleryModal isOpen={isModalOpen} onClose={closeModal} items={galleryItems} currentIndex={selectedItemIndex} onNavigate={navigateModal} />
    </section>
  );
}

export default PhotographyPage;

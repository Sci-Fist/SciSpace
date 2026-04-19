import React, { useState, useEffect } from 'react';
import { useContent } from '../context/ContentContext.jsx';
import { GalleryModal } from '../components/GalleryModal.jsx';
import '../styles/pages/_portfolioPage.scss';

/**
 * SketchesPage Component - Traditional and Digital Sketching Portfolio
 */
function SketchesPage() {
  const { registerPageMedia, getGalleryMedia, isLoading } = useContent();
  const [columns, setColumns] = useState(4);
  const [currentLayout, setCurrentLayout] = useState('masonry');
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({});

  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Initial Defaults for Bootstrapping
  const defaultGalleryItems = [
    {
      src: "https://res.cloudinary.com/ddrvulhwz/image/upload/v1774139287/scispace/media/spider-1.jpg",
      alt: "Spider Sketch",
      title: "Arachnid Study",
      category: "Life Drawing",
      medium: "Pencil on Paper",
      description: "Anatomical study of form and texture."
    }
  ];

  // 2. Seeding
  useEffect(() => {
    registerPageMedia('/sketches', defaultGalleryItems);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Dynamic Data
  const galleryItems = getGalleryMedia('/sketches');

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
      <h2>Sketching Portfolio</h2>
      <p>Traditional and digital studies exploring form, process, and foundations.</p>

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
              <div key={item.id || i} className="gallery-item" onClick={() => openModal(i)} data-title={item.title}>
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
                  <p className="item-description">
                    <strong>{item.category}</strong> • <em>{imageDimensions[i]?.width ? `${imageDimensions[i].width}x${imageDimensions[i].height}` : 'Calculating...'}</em><br />
                    {item.alt}
                  </p>
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

export default SketchesPage;

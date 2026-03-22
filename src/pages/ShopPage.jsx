import React, { useState, useEffect } from 'react';
import { usePage } from '../context/PageContext.jsx';
import { useTextContent } from '../context/TextContentContext.jsx';
import '../styles/pages/_portfolioPage.scss'; // Reusing portfolio page styles for view modes
import '../styles/pages/_genericPage.scss'; // Generic page style
import '../styles/pages/_shopPage.scss'; // Shop page specific styles

function ShopPage() {
  // 🎯 CORE STATE MANAGEMENT FOR VIEW MODES
  const [columns, setColumns] = useState(4); // Dynamic column count (3-6 based on viewport)
  const [currentLayout, setCurrentLayout] = useState('grid'); // Current layout mode
  const [showLayoutModal, setShowLayoutModal] = useState(false); // Layout selector modal

  const { getPageControls } = usePage();
  const { getTextContent } = useTextContent();
  const controls = getPageControls('/shop');

  // Calculate dynamic columns based on viewport width
  const calculateColumns = (width) => {
    if (width >= 1400) return 6;      // Large desktop
    if (width >= 1200) return 5;      // Desktop
    if (width >= 992) return 4;       // Small desktop/tablet
    if (width >= 768) return 3;       // Tablet portrait
    return Math.max(3, Math.min(6, Math.floor(width / 200))); // Minimum 3 columns
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

  const getBackgroundPattern = () => {
    const opacity = controls.backgroundPatternOpacity || 1;
    switch (controls.backgroundPattern) {
      case 'dots':
        return `radial-gradient(circle, rgba(var(--color-primary-rgb), ${0.1 * opacity}) 1px, transparent 1px)`;
      case 'grid':
        return `linear-gradient(rgba(var(--color-primary-rgb), ${0.1 * opacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--color-primary-rgb), ${0.1 * opacity}) 1px, transparent 1px)`;
      case 'diagonal':
        return `repeating-linear-gradient(45deg, rgba(var(--color-primary-rgb), ${0.1 * opacity}) 0px, rgba(var(--color-primary-rgb), ${0.1 * opacity}) 1px, transparent 1px, transparent 10px)`;
      default:
        return 'none';
    }
  };

  const getPlaceholderImage = (itemNumber) => {
    const placeholder = controls[`item${itemNumber}Placeholder`] || 'default';
    const baseUrl = 'https://via.placeholder.com/250x250/00e6e6/1a1a2e?text=';

    switch (placeholder) {
      case 'cyberpunk':
        return itemNumber === 1 ? `${baseUrl}Cyberpunk+Art` :
               itemNumber === 2 ? `${baseUrl}Cyberpunk+Assets` :
               `${baseUrl}Synthwave+Cyber`;
      case 'neon':
        return `${baseUrl}Neon+Landscape`;
      case 'abstract':
        return `${baseUrl}Abstract+Digital`;
      case 'scifi':
        return `${baseUrl}Sci-Fi+Props`;
      case 'environment':
        return `${baseUrl}Environment+Pack`;
      case 'synthwave':
        return `${baseUrl}Synthwave+Collection`;
      case 'electronic':
        return `${baseUrl}Electronic+Beats`;
      case 'ambient':
        return `${baseUrl}Ambient+Sounds`;
      default:
        return itemNumber === 1 ? `${baseUrl}Print+${itemNumber}` :
               itemNumber === 2 ? `${baseUrl}3D+Model+Pack` :
               `${baseUrl}Music+Album`;
    }
  };

  // Shop items data
  const shopItems = [
    {
      id: 1,
      image: getPlaceholderImage(1),
      title: getTextContent('shop.item1Title') || '"Neon Horizon" Art Print',
      price: getTextContent('shop.item1Price') || '$25.00',
      buttonText: getTextContent('shop.buttonText') || 'Add to Cart',
      category: 'Art Print',
      description: 'High-quality art print showcasing cyberpunk and synthwave aesthetics'
    },
    {
      id: 2,
      image: getPlaceholderImage(2),
      title: getTextContent('shop.item2Title') || 'Cyberpunk Asset Pack Vol. 1',
      price: getTextContent('shop.item2Price') || '$49.99',
      buttonText: getTextContent('shop.buttonText') || 'Add to Cart',
      category: '3D Models',
      description: 'Complete asset pack with cyberpunk props, environments, and character models'
    },
    {
      id: 3,
      image: getPlaceholderImage(3),
      title: getTextContent('shop.item3Title') || '"Synthwave Odyssey" Album',
      price: getTextContent('shop.item3Price') || '$9.99',
      buttonText: getTextContent('shop.buttonText') || 'Buy Digital',
      category: 'Music',
      description: 'Full synthwave album featuring retro-futuristic electronic compositions'
    }
  ];

  return (
    <section
      className="generic-page force-center"
      style={{
        opacity: controls.contentOpacity || 1,
        maxWidth: controls.contentWidth ? `${controls.contentWidth}%` : '900px',
        backgroundImage: getBackgroundPattern(),
        backgroundSize: controls.backgroundPattern === 'dots' ? '20px 20px' :
                       controls.backgroundPattern === 'grid' ? '40px 40px' : 'auto',
        animation: controls.showAnimations !== false ? 'fadeInUp 0.8s ease-out' : 'none'
      }}
    >
      <h2
        style={{
          fontSize: controls.titleSize ? `${controls.titleSize}rem` : '2rem',
          animation: controls.showAnimations !== false ? 'fadeInDown 0.6s ease-out' : 'none'
        }}
      >
        Shop
      </h2>
      <div className="shop-content">
        <div
          style={{
            lineHeight: controls.lineHeight || 1.6,
            animation: controls.showAnimations !== false ? 'fadeInUp 0.8s ease-out 0.2s both' : 'none'
          }}
        >
          <p>
            Welcome to the shop! Here you can find exclusive prints of my 2D art,
            3D models for your own projects, or digital downloads of my music.
          </p>
        </div>

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

      {/* Dynamic Shop Gallery - Grid, Masonry, or List Layout */}
      {currentLayout === 'masonry' ? (
        /* Masonry Layout - True masonry with CSS columns */
        <div
          className={`gallery-masonry masonry-cols-${columns}`}
          style={{ '--masonry-columns': columns }}
        >
          {/* Render shop items in masonry layout */}
          {shopItems.map((item) => (
            <div key={item.id} className="gallery-item masonry-item shop-item" data-title={item.title}>
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                style={{
                  transform: `scale(${controls.itemImageScale || 1})`,
                  borderRadius: `${controls.itemBorderRadius || 8}px`
                }}
              />
              <div className="shop-item-info">
                <h3>{item.title}</h3>
                <p className="price">{item.price}</p>
                <button className="btn primary-btn">{item.buttonText}</button>
              </div>
            </div>
          ))}
        </div>
      ) : currentLayout === 'list' ? (
        /* List Layout - Single column with detailed item cards */
        <div className="gallery-list">
          {/* Render shop items in ordered list format */}
          {shopItems.map((item) => (
            <div key={item.id} className="gallery-item shop-item" data-title={item.title}>
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                style={{
                  transform: `scale(${controls.itemImageScale || 1})`,
                  borderRadius: `${controls.itemBorderRadius || 8}px`
                }}
              />
              <div className="item-info">
                <h3 className="item-title">{item.title}</h3>
                <p className="item-description">
                  <strong>{item.category}</strong> • {item.description}
                </p>
                <div className="shop-item-footer">
                  <span className="price">{item.price}</span>
                  <button className="btn primary-btn">{item.buttonText}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Grid Layout - Intelligent column calculation */
        <div className={`gallery-grid grid-cols-${columns}`}>
          {/* Render shop items in grid layout */}
          {shopItems.map((item) => (
            <div key={item.id} className="gallery-item shop-item" data-title={item.title}>
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                style={{
                  transform: `scale(${controls.itemImageScale || 1})`,
                  borderRadius: `${controls.itemBorderRadius || 8}px`
                }}
              />
              <div className="shop-item-info">
                <h3>{item.title}</h3>
                <p className="price">{item.price}</p>
                <button className="btn primary-btn">{item.buttonText}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {controls.showShopNote !== false && (
        <p className="shop-note">
          {getTextContent('shop.noteText') || '*This section is currently a placeholder. Actual products and e-commerce functionality would be integrated here.*'}
        </p>
      )}
      </div>
    </section>
  );
}

export default ShopPage;

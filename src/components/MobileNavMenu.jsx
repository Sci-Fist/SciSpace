import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLogger } from '../hooks/useLogger.js';
import '../styles/components/_mobileNavMenu.scss';

function MobileNavMenu({ isOpen, onClose, onNavClick }) {
  const logger = useLogger('MobileNavMenu', {
    logMount: true,
    logUnmount: true,
    logRenders: false,
    logPerformance: false
  });

  const menuRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        logger.logInteraction('escape_key_close', null, e, { menuOpen: isOpen });
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, logger]);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && isOpen) {
        logger.logInteraction('click_outside_close', menuRef.current, e, { menuOpen: isOpen });
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, logger]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAnimating(true);

      // Focus management - focus first menu item when opened
      const firstLink = menuRef.current?.querySelector('a');
      if (firstLink) {
        setTimeout(() => firstLink.focus(), 100);
      }
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavItemClick = (pageName, e) => {
    logger.logInteraction('mobile_nav_click', e.target, e, {
      pageName,
      menuOpen: isOpen
    });

    logger.logFeatureUsage('mobile_navigation', 'page_visit', {
      pageName,
      source: 'mobile_menu'
    });

    onNavClick(pageName, e);
    onClose();
  };

  const handleCloseClick = (e) => {
    logger.logInteraction('mobile_menu_close', e.target, e, { menuOpen: isOpen });
    onClose();
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`mobile-nav-backdrop ${isOpen ? 'open' : ''}`}
        onClick={handleCloseClick}
        aria-hidden="true"
      />

      {/* Mobile Navigation Drawer */}
      <nav
        ref={menuRef}
        className={`mobile-nav-drawer ${isOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Mobile navigation menu"
      >
        <div className="mobile-nav-header">
          <button
            className="mobile-nav-close-btn"
            onClick={handleCloseClick}
            aria-label="Close navigation menu"
            type="button"
          >
            <span className="close-icon">×</span>
          </button>
        </div>

        <ul className="mobile-nav-list">
          <li>
            <Link
              to="/3d-art"
              onClick={(e) => handleNavItemClick('3d-art', e)}
              onFocus={(e) => logger.logInteraction('focus', e.target, e, { page: '3d-art' })}
            >
              3D Art
            </Link>
          </li>
          <li>
            <Link
              to="/2d-art"
              onClick={(e) => handleNavItemClick('2d-art', e)}
              onFocus={(e) => logger.logInteraction('focus', e.target, e, { page: '2d-art' })}
            >
              2D Art
            </Link>
          </li>
          <li>
            <Link
              to="/photography"
              onClick={(e) => handleNavItemClick('photography', e)}
              onFocus={(e) => logger.logInteraction('focus', e.target, e, { page: 'photography' })}
            >
              Photography
            </Link>
          </li>
          <li>
            <Link
              to="/sketches"
              onClick={(e) => handleNavItemClick('sketches', e)}
              onFocus={(e) => logger.logInteraction('focus', e.target, e, { page: 'sketches' })}
            >
              Sketches
            </Link>
          </li>
          <li>
            <Link
              to="/music"
              onClick={(e) => handleNavItemClick('music', e)}
              onFocus={(e) => logger.logInteraction('focus', e.target, e, { page: 'music' })}
            >
              Music
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              onClick={(e) => handleNavItemClick('about', e)}
              onFocus={(e) => logger.logInteraction('focus', e.target, e, { page: 'about' })}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to="/resume"
              onClick={(e) => handleNavItemClick('resume', e)}
              onFocus={(e) => logger.logInteraction('focus', e.target, e, { page: 'resume' })}
            >
              Resume
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              onClick={(e) => handleNavItemClick('contact', e)}
              onFocus={(e) => logger.logInteraction('focus', e.target, e, { page: 'contact' })}
            >
              Contact
            </Link>
          </li>
          <li>
            <Link
              to="/blog"
              onClick={(e) => handleNavItemClick('blog', e)}
              onFocus={(e) => logger.logInteraction('focus', e.target, e, { page: 'blog' })}
            >
              Blog
            </Link>
          </li>
          <li>
            <Link
              to="/process"
              onClick={(e) => handleNavItemClick('process', e)}
              onFocus={(e) => logger.logInteraction('focus', e.target, e, { page: 'process' })}
            >
              Process
            </Link>
          </li>
          <li>
            <Link
              to="/testimonials"
              onClick={(e) => handleNavItemClick('testimonials', e)}
              onFocus={(e) => logger.logInteraction('focus', e.target, e, { page: 'testimonials' })}
            >
              Testimonials
            </Link>
          </li>
          <li>
            <Link
              to="/shop"
              onClick={(e) => handleNavItemClick('shop', e)}
              onFocus={(e) => logger.logInteraction('focus', e.target, e, { page: 'shop' })}
            >
              Shop
            </Link>
          </li>
          <li>
            <Link
              to="/links"
              onClick={(e) => handleNavItemClick('links', e)}
              onFocus={(e) => logger.logInteraction('focus', e.target, e, { page: 'links' })}
            >
              Links
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default MobileNavMenu;
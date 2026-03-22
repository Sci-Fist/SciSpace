import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx'; // Import useTheme hook
import { useLogger } from '../hooks/useLogger.js';
import HamburgerMenu from './HamburgerMenu.jsx';
import MobileNavMenu from './MobileNavMenu.jsx';
import '../styles/components/_header.scss';

function Header() {
  const { theme, toggleTheme } = useTheme(); // Use the theme context
  const logger = useLogger('Header', {
    logMount: true,
    logUnmount: true,
    logRenders: false,
    logPerformance: false
  });

  const navRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [lastScrollTime, setLastScrollTime] = useState(0);
  const [animationFrame, setAnimationFrame] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Only log component render in development and not on every render
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Component render', {
      theme,
      navigationItems: 13,
      hasScrollPhysics: true,
      renderCount: logger.renderCount
    });
  }

  // Complete incremental navigation system with proper scrollbar behavior
  useEffect(() => {
    const navElement = navRef.current;
    if (!navElement) return;

    let animationId = null;
    let isAnimating = false;
    let currentNavIndex = 0;
    let momentum = 0;
    let lastWheelTime = 0;

    // Get navigation items for scrolling
    const getNavItems = () => Array.from(navElement.querySelectorAll('li'));

    // Simple, direct scrolling to show target item
    const scrollToItem = (targetIndex) => {
      if (isAnimating) return;

      const items = getNavItems();
      if (targetIndex < 0 || targetIndex >= items.length) return;

      const targetItem = items[targetIndex];
      const container = navElement;
      const itemLeft = targetItem.offsetLeft;
      const itemWidth = targetItem.offsetWidth;
      const containerWidth = container.clientWidth;

      // Calculate scroll position to center the item (or show it if too wide)
      const targetScroll = itemLeft - (containerWidth / 2) + (itemWidth / 2);

      // Ensure scroll position is within bounds
      const maxScroll = container.scrollWidth - containerWidth;
      const clampedScroll = Math.max(0, Math.min(maxScroll, targetScroll));

      isAnimating = true;
      setIsScrolling(true);
      const startScroll = container.scrollLeft;
      const distance = clampedScroll - startScroll;
      let startTime = Date.now();
      const duration = 200; // Fast, snappy animation

      const animate = (currentTime) => {
        if (!isAnimating) return;

        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth easing
        const easeOut = 1 - Math.pow(1 - progress, 3);
        container.scrollLeft = startScroll + (distance * easeOut);

        if (progress < 1) {
          animationId = requestAnimationFrame(animate);
        } else {
          isAnimating = false;
          setIsScrolling(false);
          currentNavIndex = targetIndex;

          // Update active item class
          items.forEach((item, index) => {
            item.classList.toggle('active', index === targetIndex);
          });

          logger.debug('Scroll to item complete', {
            itemIndex: targetIndex,
            scrollPosition: container.scrollLeft,
            duration: elapsed
          });
        }
      };

      animationId = requestAnimationFrame(animate);
    };

    // Handle mouse wheel with smooth horizontal scrolling
    const handleWheel = (e) => {
      // Check if event target is within the navigation area
      const headerElement = navElement.closest('.main-header');
      const isInHeader = headerElement?.contains(e.target);

      if (!isInHeader) {
        return; // Don't interfere with page scrolling
      }

      // Prevent default page scrolling only when over navigation
      e.preventDefault();
      e.stopPropagation();

      const currentTime = Date.now();

      // Throttle wheel events to prevent spam (50ms minimum for smoother scrolling)
      if (currentTime - lastWheelTime < 50) {
        return;
      }
      lastWheelTime = currentTime;

      // Calculate scroll amount based on deltaY
      // Positive deltaY (scroll down) = scroll left
      // Negative deltaY (scroll up) = scroll right
      const scrollAmount = e.deltaY * 2; // Multiply for more responsive scrolling

      // Smooth scroll the navigation container
      navElement.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });

      // Update current nav index based on scroll position
      const updateCurrentIndex = () => {
        const items = getNavItems();
        const scrollLeft = navElement.scrollLeft;
        const containerCenter = scrollLeft + navElement.clientWidth / 2;

        // Find closest item to center
        let closestIndex = 0;
        let minDistance = Math.abs(containerCenter - (items[0].offsetLeft + items[0].offsetWidth / 2));

        for (let i = 1; i < items.length; i++) {
          const itemCenter = items[i].offsetLeft + items[i].offsetWidth / 2;
          const distance = Math.abs(containerCenter - itemCenter);
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = i;
          }
        }

        currentNavIndex = closestIndex;
        // Update active classes
        items.forEach((item, index) => {
          item.classList.toggle('active', index === closestIndex);
        });
      };

      // Update index after smooth scroll completes
      setTimeout(updateCurrentIndex, 150);

      logger.logInteraction('wheel_scroll_smooth', navElement, e, {
        deltaY: e.deltaY,
        scrollAmount,
        direction: e.deltaY > 0 ? 'left' : 'right',
        currentScroll: navElement.scrollLeft
      });
    };

    // Touch/swipe support
    let touchStartX = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartTime = Date.now();
      momentum = 0; // Reset momentum on touch
    };

    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchStartX - touchEndX;
      const deltaTime = Date.now() - touchStartTime;

      // Detect swipe gesture
      if (deltaTime < 500 && Math.abs(deltaX) > 30) {
        const direction = deltaX > 0 ? 1 : -1; // Swipe left = next, swipe right = previous
        const items = getNavItems();
        const targetIndex = Math.max(0, Math.min(items.length - 1, currentNavIndex + direction));

        if (targetIndex !== currentNavIndex && !isAnimating) {
          scrollToItem(targetIndex);
        }
      }
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
      if (!e.target.closest('.main-nav')) return;

      const items = getNavItems();
      let targetIndex = currentNavIndex;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          targetIndex = Math.max(0, currentNavIndex - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          targetIndex = Math.min(items.length - 1, currentNavIndex + 1);
          break;
        case 'Home':
          e.preventDefault();
          targetIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          targetIndex = items.length - 1;
          break;
        default:
          return;
      }

      if (targetIndex !== currentNavIndex && !isAnimating) {
        scrollToItem(targetIndex);
      }
    };

    // Update current index on resize
    const handleResize = () => {
      const items = getNavItems();
      const container = navElement;
      const scrollLeft = container.scrollLeft;
      const containerCenter = scrollLeft + container.clientWidth / 2;

      // Find closest item to center
      let closestIndex = 0;
      let minDistance = Math.abs(containerCenter - (items[0].offsetLeft + items[0].offsetWidth / 2));

      for (let i = 1; i < items.length; i++) {
        const itemCenter = items[i].offsetLeft + items[i].offsetWidth / 2;
        const distance = Math.abs(containerCenter - itemCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }

      currentNavIndex = closestIndex;
      // Update active classes
      items.forEach((item, index) => {
        item.classList.toggle('active', index === closestIndex);
      });
    };

    window.addEventListener('resize', handleResize);

    // Add event listeners
    document.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    document.addEventListener('keydown', handleKeyDown);
    navElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    navElement.addEventListener('touchend', handleTouchEnd, { passive: true });

    logger.info('Complete incremental navigation system initialized', {
      navItems: getNavItems().length,
      scrollWidth: navElement.scrollWidth,
      clientWidth: navElement.clientWidth
    });

    return () => {
      document.removeEventListener('wheel', handleWheel, { capture: true });
      document.removeEventListener('keydown', handleKeyDown);
      navElement.removeEventListener('touchstart', handleTouchStart);
      navElement.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);

      if (animationId) cancelAnimationFrame(animationId);

      logger.debug('Navigation system cleaned up');
    };
  }, []);

  // Navigation link click handler
  const handleNavClick = (pageName, e) => {
    logger.logInteraction('navigation_click', e.target, e, {
      pageName,
      fromPage: window.location.pathname,
      toPage: `/${pageName}`,
      navigationType: 'header_link'
    });

    logger.logFeatureUsage('navigation', 'page_visit', {
      pageName,
      source: 'header_menu'
    });
  };

  // Theme toggle handler
  const handleThemeToggle = (e) => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';

    logger.logThemeChange(theme, newTheme, {
      trigger: 'header_button',
      buttonText: e.target.textContent
    });

    logger.logFeatureUsage('theme_toggle', 'switch', {
      fromTheme: theme,
      toTheme: newTheme,
      source: 'header_button'
    });

    toggleTheme();
  };

  // Logo click handler
  const handleLogoClick = (e) => {
    logger.logInteraction('logo_click', e.target, e, {
      destination: '/',
      fromPage: window.location.pathname
    });

    logger.logFeatureUsage('navigation', 'home_click', {
      source: 'logo'
    });
  };

  // Mobile menu handlers
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="main-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>
              <Link
                to="/"
                onClick={handleLogoClick}
                onMouseEnter={(e) => logger.logInteraction('hover', e.target, e, { element: 'logo' })}
              >
                Sci_Fist
              </Link>
            </h1>
          </div>

          <div className="nav-section">
            <nav className="main-nav">
              <ul
                ref={navRef}
                className={`${isScrolling ? 'gravitational-scrolling show-center-indicator' : ''}`}
              >
                <li>
                  <Link
                    to="/3d-art"
                    onClick={(e) => handleNavClick('3d-art', e)}
                    onMouseEnter={(e) => logger.logInteraction('hover', e.target, e, { page: '3d-art' })}
                  >
                    3D Art
                  </Link>
                </li>
                <li>
                  <Link
                    to="/2d-art"
                    onClick={(e) => handleNavClick('2d-art', e)}
                    onMouseEnter={(e) => logger.logInteraction('hover', e.target, e, { page: '2d-art' })}
                  >
                    2D Art
                  </Link>
                </li>
                <li>
                  <Link
                    to="/photography"
                    onClick={(e) => handleNavClick('photography', e)}
                    onMouseEnter={(e) => logger.logInteraction('hover', e.target, e, { page: 'photography' })}
                  >
                    Photography
                  </Link>
                </li>
                <li>
                  <Link
                    to="/sketches"
                    onClick={(e) => handleNavClick('sketches', e)}
                    onMouseEnter={(e) => logger.logInteraction('hover', e.target, e, { page: 'sketches' })}
                  >
                    Sketches
                  </Link>
                </li>
                <li>
                  <Link
                    to="/music"
                    onClick={(e) => handleNavClick('music', e)}
                    onMouseEnter={(e) => logger.logInteraction('hover', e.target, e, { page: 'music' })}
                  >
                    Music
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    onClick={(e) => handleNavClick('about', e)}
                    onMouseEnter={(e) => logger.logInteraction('hover', e.target, e, { page: 'about' })}
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/resume"
                    onClick={(e) => handleNavClick('resume', e)}
                    onMouseEnter={(e) => logger.logInteraction('hover', e.target, e, { page: 'resume' })}
                  >
                    Resume
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    onClick={(e) => handleNavClick('contact', e)}
                    onMouseEnter={(e) => logger.logInteraction('hover', e.target, e, { page: 'contact' })}
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    onClick={(e) => handleNavClick('blog', e)}
                    onMouseEnter={(e) => logger.logInteraction('hover', e.target, e, { page: 'blog' })}
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/process"
                    onClick={(e) => handleNavClick('process', e)}
                    onMouseEnter={(e) => logger.logInteraction('hover', e.target, e, { page: 'process' })}
                  >
                    Process
                  </Link>
                </li>
                <li>
                  <Link
                    to="/testimonials"
                    onClick={(e) => handleNavClick('testimonials', e)}
                    onMouseEnter={(e) => logger.logInteraction('hover', e.target, e, { page: 'testimonials' })}
                  >
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop"
                    onClick={(e) => handleNavClick('shop', e)}
                    onMouseEnter={(e) => logger.logInteraction('hover', e.target, e, { page: 'shop' })}
                  >
                    Shop
                  </Link>
                </li>
                <li>
                  <Link
                    to="/links"
                    onClick={(e) => handleNavClick('links', e)}
                    onMouseEnter={(e) => logger.logInteraction('hover', e.target, e, { page: 'links' })}
                  >
                    Links
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Mobile Navigation Button */}
          <HamburgerMenu
            isOpen={isMobileMenuOpen}
            onToggle={handleMobileMenuToggle}
          />
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNavMenu
        isOpen={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        onNavClick={handleNavClick}
      />
    </>
  );
}

export default Header;

import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx'; // Import useTheme hook
import { useLogger } from '../hooks/useLogger.js';
import HamburgerMenu from './HamburgerMenu.jsx';
import MobileNavMenu from './MobileNavMenu.jsx';
import '../styles/components/_header.scss';

function Header() {
  const { theme } = useTheme(); // Use the theme context
  const logger = useLogger('Header', {
    logMount: true,
    logUnmount: true,
    logRenders: false,
    logPerformance: false
  });

  const navRef = useRef(null);
  const velocityRef = useRef(0);
  const displacementRef = useRef(0);
  const requestRef = useRef();
  
  const [displacement, setDisplacement] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Physics constants for the gravitational feel
  const SPRING_K = 0.12;    // Strength of the pull back to center
  const FRICTION = 0.88;     // How much momentum is lost over time (inertia)
  const VELOCITY_MULT = 1.2; // Multiplier for wheel delta to feel responsive

  // Only log component render in development and not on every render
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Component render', {
      theme,
      navigationItems: 13,
      hasGravitationalPhysics: true,
      displacement: Math.round(displacementRef.current)
    });
  }

  // Physics animation loop using rAF for glassy smooth 60fps
  const animatePhysics = () => {
    // F = -k * x (Hooke's Law for spring force)
    const springForce = -SPRING_K * displacementRef.current;

    // Apply force to velocity (Acceleration)
    velocityRef.current += springForce;

    // Apply friction to velocity (Damping)
    velocityRef.current *= FRICTION;

    // Apply velocity to displacement
    displacementRef.current += velocityRef.current;

    // Snap to zero if movement is negligible to save CPU
    if (Math.abs(displacementRef.current) < 0.05 && Math.abs(velocityRef.current) < 0.05) {
      displacementRef.current = 0;
      velocityRef.current = 0;
      setDisplacement(0);
      requestRef.current = null;
      return;
    }

    setDisplacement(displacementRef.current);
    requestRef.current = requestAnimationFrame(animatePhysics);
  };

  useEffect(() => {
    const handleWheel = (e) => {
      // Direct access to the DOM element for the header check
      const headerElement = navRef.current?.closest('.main-header');
      if (!headerElement?.contains(e.target)) return;

      // Prevent default page scrolling only when interacting with the header bar
      e.preventDefault();

      // Add wheel delta to velocity for that "shove" feel
      // deltaY is usually positive for scroll down, we want that to shift left/right
      velocityRef.current += e.deltaY * VELOCITY_MULT;

      // Start animation loop if not already running
      if (!requestRef.current) {
        requestRef.current = requestAnimationFrame(animatePhysics);
      }
    };

    // Attach to window/document with non-passive to allow e.preventDefault()
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
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
                style={{ 
                  transform: `translateX(${displacement * -1}px)`,
                  transition: displacement === 0 ? 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none'
                }}
              >
                <li><Link to="/3d-art" onClick={(e) => handleNavClick('3d-art', e)}>3D Art</Link></li>
                <li><Link to="/2d-art" onClick={(e) => handleNavClick('2d-art', e)}>2D Art</Link></li>
                <li><Link to="/photography" onClick={(e) => handleNavClick('photography', e)}>Photography</Link></li>
                <li><Link to="/sketches" onClick={(e) => handleNavClick('sketches', e)}>Sketches</Link></li>
                <li><Link to="/music" onClick={(e) => handleNavClick('music', e)}>Music</Link></li>
                <li><Link to="/about" onClick={(e) => handleNavClick('about', e)}>About</Link></li>
                <li><Link to="/resume" onClick={(e) => handleNavClick('resume', e)}>Resume</Link></li>
                <li><Link to="/contact" onClick={(e) => handleNavClick('contact', e)}>Contact</Link></li>
                <li><Link to="/blog" onClick={(e) => handleNavClick('blog', e)}>Blog</Link></li>
                <li><Link to="/process" onClick={(e) => handleNavClick('process', e)}>Process</Link></li>
                <li><Link to="/testimonials" onClick={(e) => handleNavClick('testimonials', e)}>Testimonials</Link></li>
                <li><Link to="/shop" onClick={(e) => handleNavClick('shop', e)}>Shop</Link></li>
                <li><Link to="/links" onClick={(e) => handleNavClick('links', e)}>Links</Link></li>
              </ul>
            </nav>
          </div>

          <HamburgerMenu
            isOpen={isMobileMenuOpen}
            onToggle={handleMobileMenuToggle}
          />
        </div>
      </header>

      <MobileNavMenu
        isOpen={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        onNavClick={handleNavClick}
      />
    </>
  );
}

export default Header;

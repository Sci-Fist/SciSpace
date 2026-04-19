import React, { useState } from 'react';
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Only log component render in development
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Component render', {
      theme,
      layout: 'full-width-static'
    });
  }

  const handleNavClick = (pageName, e) => {
    logger.logInteraction('navigation_click', e.target, e, { pageName });
  };

  const handleLogoClick = (e) => {
    logger.logInteraction('logo_click', e.target, e, { destination: '/' });
  };

  return (
    <>
      <header className="main-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>
              <Link to="/" onClick={handleLogoClick}>Sci_Fist</Link>
            </h1>
          </div>

          <div className="nav-section">
            <nav className="main-nav">
              <ul>
                {[
                  { path: '/3d-art', label: '3D Art' },
                  { path: '/2d-art', label: '2D Art' },
                  { path: '/photography', label: 'Photography' },
                  { path: '/sketches', label: 'Sketches' },
                  { path: '/music', label: 'Music' },
                  { path: '/about', label: 'About' },
                  { path: '/resume', label: 'Resume' },
                  { path: '/contact', label: 'Contact' },
                  { path: '/blog', label: 'Blog' },
                  { path: '/process', label: 'Process' },
                  { path: '/testimonials', label: 'Testimonials' },
                  { path: '/shop', label: 'Shop' },
                  { path: '/links', label: 'Links' }
                ].map((item) => (
                  <li key={item.path}>
                    <Link to={item.path} onClick={(e) => handleNavClick(item.label, e)}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <HamburgerMenu
            isOpen={isMobileMenuOpen}
            onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </div>
      </header>

      <MobileNavMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onNavClick={handleNavClick}
      />
    </>
  );
}

export default Header;

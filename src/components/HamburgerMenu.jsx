import React from 'react';
import { useLogger } from '../hooks/useLogger.js';
import '../styles/components/_hamburgerMenu.scss';

function HamburgerMenu({ isOpen, onToggle }) {
  const logger = useLogger('HamburgerMenu', {
    logMount: true,
    logUnmount: true,
    logRenders: false,
    logPerformance: false
  });

  const handleClick = (e) => {
    logger.logInteraction('hamburger_toggle', e.target, e, {
      menuWasOpen: isOpen,
      menuWillOpen: !isOpen
    });

    logger.logFeatureUsage('mobile_navigation', 'hamburger_toggle', {
      action: isOpen ? 'close' : 'open',
      source: 'hamburger_button'
    });

    onToggle();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <button
      className={`hamburger-menu ${isOpen ? 'open' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={isOpen}
      aria-controls="mobile-navigation"
      type="button"
    >
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
    </button>
  );
}

export default HamburgerMenu;
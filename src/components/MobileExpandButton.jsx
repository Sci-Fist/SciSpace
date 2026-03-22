import React from 'react';
import { useDevTools } from '../context/DevToolsContext.jsx';
import '../styles/components/_mobileExpandButton.scss';

function MobileExpandButton() {
  const { isDevMode, toggleDevMode, isSidebarOpen, toggleSidebar, isMobileView } = useDevTools();

  // Only render if dev mode is active, sidebar is closed, and in mobile mode
  if (!isDevMode || isSidebarOpen || !isMobileView) {
    return null;
  }

  const handleExpandClick = () => {
    // Enable dev mode if not already active
    if (!isDevMode) {
      toggleDevMode();
    }

    // Toggle the sidebar (open if closed, close if open)
    toggleSidebar();
  };

  // Since this button only renders when sidebar is closed, it's always in "collapsed" state
  return (
    <button
      className="mobile-expand-btn collapsed"
      onClick={handleExpandClick}
      title="Open Dev Sidebar"
      aria-label="Open Dev Sidebar"
    >
      <span className="expand-icon">⬆️</span>
      <span className="expand-text">Dev Tools</span>
    </button>
  );
}

export default MobileExpandButton;

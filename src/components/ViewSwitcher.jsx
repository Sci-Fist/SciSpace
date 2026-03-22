import React, { useEffect } from 'react';
import { useDevTools } from '../context/DevToolsContext.jsx';
import '../styles/components/_viewSwitcher.scss';

function ViewSwitcher() {
  const { isSidebarOpen, setIsSidebarOpen, setMobileView, isMobileView } = useDevTools();

  const toggleView = () => {
    // Toggle the mobile view state
    const newMobileState = !isMobileView;
    setMobileView(newMobileState);

    if (newMobileState) {
      // Force mobile viewport
      document.documentElement.style.setProperty('--forced-viewport', 'mobile');
      document.body.classList.add('force-mobile-view');
      document.body.classList.remove('force-desktop-view');

      // Ensure sidebar is closed by default in mobile view
      setIsSidebarOpen(false);
    } else {
      // Force desktop viewport
      document.documentElement.style.setProperty('--forced-viewport', 'desktop');
      document.body.classList.add('force-desktop-view');
      document.body.classList.remove('force-mobile-view');
    }
  };

  const currentView = isMobileView ? 'Mobile' : 'Desktop';
  const currentIcon = isMobileView ? '📱' : '🖥️';

  return (
    <div className="view-switcher">
      <button
        className="view-btn toggle-btn"
        onClick={toggleView}
        title={`Current: ${currentView} View - Click to toggle`}
      >
        {currentIcon} {currentView} View
      </button>
    </div>
  );
}

export default ViewSwitcher;

import React from 'react';
import { useDevTools } from '../context/DevToolsContext.jsx';
import '../styles/components/_devSidebarToggle.scss';

function DevSidebarToggle() {
  const { isDevMode, isSidebarOpen, toggleSidebar, isMobileView } = useDevTools();

  // Only render if dev mode is active and in desktop mode
  if (!isDevMode || isMobileView) {
    return null;
  }

  const handleExpandClick = () => {
    // Toggle the sidebar (open if closed, close if open)
    toggleSidebar();
  };

  // Always show ▶ icon (user requested this for both states)
  return (
    <button
      className="desktop-expand-btn"
      onClick={handleExpandClick}
      title={isSidebarOpen ? 'Close Dev Sidebar' : 'Open Dev Sidebar'}
      aria-label={isSidebarOpen ? 'Close Dev Sidebar' : 'Open Dev Sidebar'}
    >
      <span className="expand-icon">▶</span>
    </button>
  );
}

export default DevSidebarToggle;

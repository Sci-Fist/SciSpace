import React from 'react';

function SidebarHeader({ currentPage, theme, toggleTheme, toggleSidebar, isSidebarOpen }) {
  return (
    <>
      <button
        className="sidebar-toggle-btn"
        onClick={toggleSidebar}
        title={isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
      >
        {isSidebarOpen ? '◀' : '▶'}
      </button>
      <div className="sidebar-content">
        <div className="panel-content">
          <h3>Dev Tools</h3>
          <p>Current Page: <strong>{currentPage || 'Home'}</strong></p>
          <p>Current Theme: <strong>{theme}</strong></p>
          <button onClick={toggleTheme} className="btn secondary-btn dev-sidebar-btn">
            Toggle Theme ({theme === 'dark' ? 'Light' : 'Dark'})
          </button>
        </div>
      </div>
    </>
  );
}

export default SidebarHeader;

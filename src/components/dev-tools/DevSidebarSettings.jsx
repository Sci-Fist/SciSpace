import React from 'react';

function DevSidebarSettings({ sidebarPadding, handlePaddingChange }) {
  return (
    <div className="dev-sidebar-settings">
      <h3>Dev Sidebar Settings</h3>
      <div className="setting-item">
        <label htmlFor="padding-slider">Padding:</label>
        <input
          type="range"
          id="padding-slider"
          min="0"
          max="50" // Max padding of 50px
          step="1"
          value={sidebarPadding}
          onChange={handlePaddingChange}
        />
        <span>{sidebarPadding}px</span>
      </div>
    </div>
  );
}

export default DevSidebarSettings;
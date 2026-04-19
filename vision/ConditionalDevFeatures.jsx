import React from 'react';
import { useDevTools } from '../src/context/DevToolsContext.jsx';
import { useTheme } from '../src/context/ThemeContext.jsx';
import DevButton from '../src/components/DevButton.jsx';
import DevSidebar from '../src/components/DevSidebar.jsx';
import ViewSwitcher from '../src/components/ViewSwitcher.jsx';
import MobileExpandButton from '../src/components/MobileExpandButton.jsx';
import DevSidebarToggle from '../src/components/DevSidebarToggle.jsx';

function ConditionalDevFeatures() {
  const { isDevMode } = useDevTools();
  const { theme, toggleTheme } = useTheme();

  const handleThemeToggle = (e) => {
    toggleTheme();
  };

  return (
    <>
      {/* Always show DevButton so users can activate dev mode */}
      <DevButton />

      {/* Consolidated floating controls for layout stability */}
      <div className="floating-dev-controls">
        <ViewSwitcher />

        <button
          onClick={handleThemeToggle}
          className="theme-toggle-btn"
        >
          {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      {/* Only show other dev features when dev mode is active */}
      {isDevMode && (
        <>
          <DevSidebar />
          <MobileExpandButton />
          <DevSidebarToggle />
        </>
      )}
    </>
  );
}

export default ConditionalDevFeatures;

import React from 'react';
import { useDevTools } from '../src/context/DevToolsContext.jsx';
import { useTheme } from '../src/context/ThemeContext.jsx';
import useScrollToBottom from '../src/hooks/useScrollToBottom';
import DevButton from '../src/components/DevButton.jsx';
import DevSidebar from '../src/components/DevSidebar.jsx';
import ViewSwitcher from '../src/components/ViewSwitcher.jsx';
import MobileExpandButton from '../src/components/MobileExpandButton.jsx';
import DevSidebarToggle from '../src/components/DevSidebarToggle.jsx';

function ConditionalDevFeatures() {
  const { isDevMode } = useDevTools();
  const { theme, toggleTheme } = useTheme();
  const visible = useScrollToBottom();

  return (
    <>
      {/* Always show DevButton so users can activate dev mode */}
      <DevButton />

      {/* Consolidated floating controls - slide up with footer on scroll to bottom */}
      <div
        className="floating-dev-controls"
        style={{
          transform: visible ? 'translateY(0)' : 'translateY(200%)',
          transition: 'transform 0.35s ease',
        }}
      >
        <ViewSwitcher />

        <button
          onClick={toggleTheme}
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

import React from 'react';
import { useDevTools } from '../context/DevToolsContext.jsx';
import '../styles/components/_devButton.scss';

function DevButton() {
  const { isDevMode, toggleDevMode, isMobileView } = useDevTools();

  // Only show in development mode - hide in production
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <button
      className={`dev-mode-toggle-btn ${isDevMode ? 'active' : ''}`}
      onClick={toggleDevMode}
      title={isDevMode ? 'Disable Dev Mode' : 'Enable Dev Mode'}
    >
      {isDevMode ? '⚙️ Dev Mode ON' : '🛠️ Dev Mode OFF'}
    </button>
  );
}

export default DevButton;

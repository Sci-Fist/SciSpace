import React from 'react';
import { useDevTools } from '../context/DevToolsContext.jsx';
import useScrollToBottom from '../hooks/useScrollToBottom';
import '../styles/components/_devButton.scss';

function DevButton() {
  const { isDevMode, toggleDevMode, isMobileView } = useDevTools();
  const visible = useScrollToBottom();

  if (!import.meta.env.DEV) return null;

  return (
    <button
      className={`dev-mode-toggle-btn ${isDevMode ? 'active' : ''}`}
      onClick={toggleDevMode}
      title={isDevMode ? 'Disable Dev Mode' : 'Enable Dev Mode'}
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(150%)',
        transition: 'transform 0.35s ease',
      }}
    >
      {isDevMode ? '⚙️ Dev Mode ON' : '🛠️ Dev Mode OFF'}
    </button>
  );
}

export default DevButton;

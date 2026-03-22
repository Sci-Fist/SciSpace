import React, { useState, useRef, useEffect } from 'react';
import { useDevTools } from '../../context/DevToolsContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { usePage } from '../../context/PageContext.jsx';
import '../../styles/components/_devSidebar.scss';

import SidebarHeader from './SidebarHeader.jsx';
import PresetManager from './PresetManager.jsx';
import ResizablePanel from './ResizablePanel.jsx';
import DevSidebarSettings from './DevSidebarSettings.jsx';
import NotificationBanner from './NotificationBanner.jsx';
import NotificationManager from './NotificationManager.jsx'; // Import NotificationManager

function DevSidebar() {
  const { isDevMode, isSidebarOpen, toggleSidebar } = useDevTools();
  const { theme, toggleTheme } = useTheme();
  const { currentPage, getPageControls, updatePageControl } = usePage();

  // Sidebar state and refs
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('devSidebarWidth');
    return saved ? parseFloat(saved) : 400; // Default 400px width
  });
  const [sidebarHeight, setSidebarHeight] = useState(() => {
    const saved = localStorage.getItem('devSidebarHeight');
    return saved ? parseFloat(saved) : 50; // Default 50vh height on mobile
  });
  // New state for padding
  const [sidebarPadding, setSidebarPadding] = useState(() => {
    const saved = localStorage.getItem('devSidebarPadding');
    return saved ? parseFloat(saved) : 10; // Default 10px padding
  });
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  // Manage notification state and function using NotificationManager hook
  const { notification, showNotification } = NotificationManager(); // <-- This line is new

  // Handler for padding slider
  const handlePaddingChange = (e) => {
    const newPadding = parseFloat(e.target.value);
    setSidebarPadding(newPadding);
    localStorage.setItem('devSidebarPadding', newPadding);
  };

  // Mouse event handlers for resizing sidebar width
  const handleResizeMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleResizeMouseMove = (e) => {
    if (!isResizing) return;

    const rect = sidebarRef.current.getBoundingClientRect();
    const deltaX = e.clientX - rect.left;
    const newWidth = Math.max(200, Math.min(800, sidebarWidth - deltaX)); // Inverted: dragging right makes narrower, dragging left makes wider
    setSidebarWidth(newWidth);
  };

  const handleResizeMouseUp = () => {
    setIsResizing(false);
  };

  // Touch event handlers for resizing sidebar width (mobile support)
  const handleResizeTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsResizing(true);
      e.preventDefault();
    }
  };

  const handleResizeTouchMove = (e) => {
    if (!isResizing || e.touches.length !== 1) return;

    const rect = sidebarRef.current.getBoundingClientRect();
    const deltaX = e.touches[0].clientX - rect.left;
    const newWidth = Math.max(200, Math.min(800, sidebarWidth - deltaX)); // Inverted: dragging right makes narrower, dragging left makes wider
    setSidebarWidth(newWidth);
    e.preventDefault();
  };

  const handleResizeTouchEnd = () => {
    setIsResizing(false);
  };

  // Add global mouse and touch event listeners when resizing
  useEffect(() => {
    if (isResizing) {
      // Mouse events
      document.addEventListener('mousemove', handleResizeMouseMove);
      document.addEventListener('mouseup', handleResizeMouseUp);
      // Touch events
      document.addEventListener('touchmove', handleResizeTouchMove, { passive: false });
      document.addEventListener('touchend', handleResizeTouchEnd);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    } else {
      // Remove mouse events
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
      // Remove touch events
      document.removeEventListener('touchmove', handleResizeTouchMove);
      document.removeEventListener('touchend', handleResizeTouchEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      // Cleanup mouse events
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
      // Cleanup touch events
      document.removeEventListener('touchmove', handleResizeTouchMove);
      document.removeEventListener('touchend', handleResizeTouchEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  if (!isDevMode) {
    return null; // Only render sidebar if dev mode is active
  }

  return (
    <aside
      ref={sidebarRef}
      className={`dev-sidebar ${isSidebarOpen ? 'open' : 'closed'} ${isResizing ? 'resizing' : ''}`}
      style={{ width: `${sidebarWidth}px`, padding: `${sidebarPadding}px` }} // Added padding style
      onMouseDown={(e) => {
        // Check if clicking on the left border area (within 10px of left edge)
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;

        if (clickX <= 10 && clickX >= 0) {
          handleResizeMouseDown(e);
        }
      }}
      onTouchStart={(e) => {
        // Check if touching on the left border area (within 40px of left edge for better touch target on mobile)
        const rect = e.currentTarget.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;

        if (touchX <= 40 && touchX >= 0) {
          handleResizeTouchStart(e);
        }
      }}
    >
      <SidebarHeader
        currentPage={currentPage}
        theme={theme}
        toggleTheme={toggleTheme}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <PresetManager
        currentPage={currentPage}
        getPageControls={getPageControls}
        updatePageControl={updatePageControl}
        showNotification={showNotification}
      />

      <ResizablePanel
        currentPage={currentPage}
        sidebarWidth={sidebarWidth}
        setSidebarWidth={setSidebarWidth}
        sidebarHeight={sidebarHeight}
        setSidebarHeight={setSidebarHeight}
      />

      <DevSidebarSettings
        sidebarPadding={sidebarPadding}
        handlePaddingChange={handlePaddingChange}
      />
      <NotificationBanner notification={notification} />
    </aside>
  );
}

export default DevSidebar;
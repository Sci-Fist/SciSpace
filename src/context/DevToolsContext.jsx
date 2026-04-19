 import React, { createContext, useContext, useState, useEffect } from 'react';

const DevToolsContext = createContext();

export const DevToolsProvider = ({ children }) => {
  const [isDevMode, setIsDevMode] = useState(() => {
    const savedDevMode = localStorage.getItem('devMode');
    const initialValue = savedDevMode === 'true';
    return initialValue;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedSidebarState = localStorage.getItem('devSidebarOpen');
    const initialValue = savedSidebarState === 'true';
    return initialValue;
  });

  const [isMobileView, setIsMobileView] = useState(() => {
    // Check if we're on mobile initially
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const initialValue = isTouchDevice && userAgentMobile;
    return initialValue;
  });

  const [isLeftScrollbarExpanded, setIsLeftScrollbarExpanded] = useState(() => {
    const savedScrollbarState = localStorage.getItem('leftScrollbarExpanded');
    const initialValue = savedScrollbarState === 'true';
    return initialValue;
  });

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const savedWidth = localStorage.getItem('devSidebarWidth');
    const initialValue = savedWidth ? parseFloat(savedWidth) : 400;
    return initialValue;
  });

  useEffect(() => {
    // Apply data-dev-mode attribute to html element
    document.documentElement.setAttribute('data-dev-mode', isDevMode);
    localStorage.setItem('devMode', isDevMode);

    // Force centering override when dev mode changes
    if (isDevMode) {
      document.body.classList.add('dev-mode-active');
    } else {
      document.body.classList.remove('dev-mode-active');
    }
  }, [isDevMode]);

  // Note: --sidebar-width is now managed by MainLayout to ensure proper synchronization
  // with the data-sidebar-expanded attribute logic

  useEffect(() => {
    localStorage.setItem('devSidebarOpen', isSidebarOpen);
  }, [isSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('leftScrollbarExpanded', isLeftScrollbarExpanded);
  }, [isLeftScrollbarExpanded]);

  const toggleDevMode = () => {
    const newValue = !isDevMode;
    setIsDevMode(newValue);
    // When dev mode is disabled, close the sidebar
    if (!newValue) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    const newValue = !isSidebarOpen;
    setIsSidebarOpen(newValue);
  };

  const setMobileView = (isMobile) => {
    setIsMobileView(isMobile);
  };

  const toggleLeftScrollbar = () => {
    const newValue = !isLeftScrollbarExpanded;
    setIsLeftScrollbarExpanded(newValue);
  };

  // Override setSidebarWidth to add logging
  const setSidebarWidthLogged = (width) => {
    setSidebarWidth(width);
  };

  return (
    <DevToolsContext.Provider value={{
      isDevMode,
      toggleDevMode,
      isSidebarOpen,
      setIsSidebarOpen,
      toggleSidebar,
      isMobileView,
      setMobileView,
      isLeftScrollbarExpanded,
      toggleLeftScrollbar,
      sidebarWidth,
      setSidebarWidth: setSidebarWidthLogged
    }}>
      {children}
    </DevToolsContext.Provider>
  );
};

export const useDevTools = () => useContext(DevToolsContext);

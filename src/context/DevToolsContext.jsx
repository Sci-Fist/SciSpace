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

  // Set CSS custom properties for sidebar width to enable content pushing
  // Only push content on desktop, not on mobile where overlay is preferred
  useEffect(() => {
    const shouldPushContent = isSidebarOpen && isDevMode && !isMobileView;
    const cssSidebarWidth = shouldPushContent ? `${sidebarWidth}px` : '0px';
    document.documentElement.style.setProperty('--sidebar-width', cssSidebarWidth);

    // Note: data-sidebar-expanded attribute is managed by MainLayout.jsx
    // to avoid conflicts between different components setting this attribute

    // Debug: Log computed styles after a short delay to allow CSS to update
    setTimeout(() => {
      const mainElement = document.querySelector('main');
      const bodyElement = document.body;
      const htmlElement = document.documentElement;
      const rootStyles = getComputedStyle(document.documentElement);

      console.log('🔧 DevTools Debug - Sidebar state:', {
        isSidebarOpen,
        isDevMode,
        isMobileView,
        sidebarWidth,
        cssSidebarWidth
      });

      console.log('🔍 Debug: CSS Variable --sidebar-width:', rootStyles.getPropertyValue('--sidebar-width'));

      if (htmlElement) {
        const htmlStyles = getComputedStyle(htmlElement);
        console.log('🔍 Debug: HTML element styles:', {
          width: htmlStyles.width,
          margin: htmlStyles.margin,
          padding: htmlStyles.padding
        });
      }

      if (bodyElement) {
        const bodyStyles = getComputedStyle(bodyElement);
        console.log('🔍 Debug: Body element styles:', {
          width: bodyStyles.width,
          margin: bodyStyles.margin,
          padding: bodyStyles.padding,
          position: bodyStyles.position
        });
      }

      if (mainElement) {
        const mainStyles = getComputedStyle(mainElement);
        console.log('🔍 Debug: Main element computed styles:', {
          width: mainStyles.width,
          margin: mainStyles.margin,
          marginLeft: mainStyles.marginLeft,
          marginRight: mainStyles.marginRight,
          padding: mainStyles.padding,
          position: mainStyles.position,
          display: mainStyles.display
        });

        // Check if main has any child elements that might be causing issues
        const firstChild = mainElement.firstElementChild;
        if (firstChild) {
          const childStyles = getComputedStyle(firstChild);
          console.log('🔍 Debug: Main first child styles:', {
            tagName: firstChild.tagName,
            className: firstChild.className,
            width: childStyles.width,
            margin: childStyles.margin,
            position: childStyles.position
          });
        }
      }
    }, 100);
  }, [isSidebarOpen, isDevMode, sidebarWidth, isMobileView]);

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

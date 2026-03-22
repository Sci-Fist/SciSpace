import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageContext = createContext();

export const PageProvider = ({ children }) => {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(location.pathname);

  // Removed console.log to prevent spam

  useEffect(() => {
    setCurrentPage(location.pathname);
  }, [location.pathname]);

  // Page-specific state for dev controls
  const [pageControls, setPageControls] = useState({});

  // Slideshow collapse state
  const [isSlideshowCollapsed, setIsSlideshowCollapsed] = useState(false);

  const updatePageControl = (page, controlKey, value) => {
    setPageControls(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        [controlKey]: value
      }
    }));
  };

  const getPageControls = (page) => {
    const controls = pageControls[page] || {};
    return controls;
  };

  // Force reset textAlign to center for all pages to fix centering issues
  const resetTextAlignToCenter = () => {
    const pages = ['/', '/about', '/resume', '/contact', '/blog', '/shop', '/links', '/process', '/testimonials', '/music', '/portfolio', '/three-d-art', '/two-d-art'];
    const updatedControls = { ...pageControls };

    pages.forEach(page => {
      if (!updatedControls[page]) {
        updatedControls[page] = {};
      }
      updatedControls[page].textAlign = 'center';
    });

    setPageControls(updatedControls);
  };

  // Auto-reset textAlign on context initialization to ensure centering
  useEffect(() => {
    resetTextAlignToCenter();
  }, []);

  return (
    <PageContext.Provider value={{
      currentPage,
      pageControls,
      updatePageControl,
      getPageControls,
      resetTextAlignToCenter,
      isSlideshowCollapsed,
      setIsSlideshowCollapsed
    }}>
      {children}
    </PageContext.Provider>
  );
};

export const usePage = () => useContext(PageContext);

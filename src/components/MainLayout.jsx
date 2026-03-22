import React, { useEffect } from 'react';
import { useSlideshow } from '../context/SlideshowContext.jsx';
import { usePage } from '../context/PageContext.jsx';
import { useDevTools } from '../context/DevToolsContext.jsx';
import { useLogger } from '../hooks/useLogger.js';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import LoggerDashboard from './LoggerDashboard.jsx';
import ConditionalDevFeatures from '../../vision/ConditionalDevFeatures.jsx';

function MainLayout({ children }) {
  const { getSelectedImage } = useSlideshow();
  const { getPageControls } = usePage();
  const { isSidebarOpen } = useDevTools();
  const logger = useLogger('MainLayout', {
    logMount: true,
    logUnmount: true,
    logRenders: false,
    logPerformance: false
  });

  // Get global controls for background styling
  const globalControls = getPageControls('global') || {};

  // Get selected background image for the entire website
  const selectedBackgroundImage = getSelectedImage('/', 'Background Images');
  const backgroundImageSrc = selectedBackgroundImage ? selectedBackgroundImage.url : null;

  // Update CSS custom properties for dynamic theming
  useEffect(() => {
    const root = document.documentElement;

    // Update background-related CSS variables
    if (backgroundImageSrc) {
      root.style.setProperty('--app-background-image', `url(${backgroundImageSrc})`);
    } else {
      root.style.setProperty('--app-background-image', 'none');
    }

    // Update global control variables
    root.style.setProperty('--app-background-size', globalControls.backgroundSize || 'cover');
    root.style.setProperty('--app-background-position', globalControls.backgroundPosition || 'center');
    root.style.setProperty('--app-background-repeat', globalControls.backgroundRepeat || 'no-repeat');
    root.style.setProperty('--app-background-attachment', globalControls.backgroundAttachment || 'fixed');
    root.style.setProperty('--app-background-opacity', globalControls.backgroundImageOpacity || 1);
    root.style.setProperty('--app-background-filter',
      globalControls.backgroundImageBlur ? `blur(${globalControls.backgroundImageBlur}px)` : 'none');

  }, [backgroundImageSrc, globalControls]);

  // Update sidebar state for CSS Grid layout
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-sidebar-expanded', isSidebarOpen ? 'true' : 'false');
  }, [isSidebarOpen]);

  // Layout state logging - simplified
  useEffect(() => {
    const now = Date.now();
    if (!MainLayout.lastLayoutLog || now - MainLayout.lastLayoutLog > 30000) { // Log every 30 seconds
      logger.debug('Layout state updated', {
        isSidebarOpen,
        hasBackgroundImage: !!backgroundImageSrc,
        currentPage: window.location.pathname
      });
      MainLayout.lastLayoutLog = now;
    }
  }, [isSidebarOpen, backgroundImageSrc, logger]);

  return (
    <div className="app-container">
      <Header />
      <main>
        {children}
      </main>
      <Footer />
      <ConditionalDevFeatures />
      <LoggerDashboard />
    </div>
  );
}

export default MainLayout;

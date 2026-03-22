import React, { useState, useRef, useEffect } from 'react';
import { useDevTools } from '../context/DevToolsContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx'; // To display current theme
import { usePage } from '../context/PageContext.jsx'; // To get current page
import HomePageControls from './dev-tools/HomePageControls.jsx';
import MusicPageControls from './dev-tools/MusicPageControls.jsx';
import ThreeDArtPageControls from './dev-tools/ThreeDArtPageControls.jsx';
import TwoDArtPageControls from './dev-tools/TwoDArtPageControls.jsx';
import ContactPageControls from './dev-tools/ContactPageControls.jsx';
import ResumePageControls from './dev-tools/ResumePageControls.jsx';
import GenericPageControls from './dev-tools/GenericPageControls.jsx';
import SlideshowControls from './dev-tools/SlideshowControls.jsx';
import ContentUploadSection from './dev-tools/ContentUploadSection.jsx';
import MobileExpandButton from './MobileExpandButton.jsx';
import '../styles/components/_devSidebar.scss';

function DevSidebar() {
  const { isDevMode, isSidebarOpen, toggleSidebar, isMobileView, sidebarWidth, setSidebarWidth } = useDevTools();
  const { theme, toggleTheme } = useTheme(); // Access theme context
  const { currentPage, getPageControls, updatePageControl } = usePage(); // Access current page and controls

  const [sidebarHeight, setSidebarHeight] = useState(() => {
    const saved = localStorage.getItem('devSidebarHeight');
    return saved ? parseFloat(saved) : 50; // Default 50vh height on mobile
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeBorder, setResizeBorder] = useState('right'); // 'left' or 'right'
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollStartY, setScrollStartY] = useState(0);
  const [scrollStartTop, setScrollStartTop] = useState(0);
  const [lastScrollTime, setLastScrollTime] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [momentumAnimationId, setMomentumAnimationId] = useState(null);
  const dragStartTimeRef = useRef(0);
  const dragStartYRef = useRef(0);
  const scrollVelocityRef = useRef(0);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartY, setResizeStartY] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const [resizeStartHeight, setResizeStartHeight] = useState(0);
  const sidebarRef = useRef(null);
  const topPanelRef = useRef(null);

  // Preset management state
  const [presets, setPresets] = useState(() => {
    const saved = localStorage.getItem('devPresets');
    return saved ? JSON.parse(saved) : {
      'Default': {}
    };
  });
  const [currentPreset, setCurrentPreset] = useState('Default');
  const [newPresetName, setNewPresetName] = useState('');

  // Notification state
  const [notification, setNotification] = useState(null);

  // Notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // Auto-hide after 3 seconds
  };

  // Save sidebar width and height to localStorage
  useEffect(() => {
    localStorage.setItem('devSidebarWidth', sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    localStorage.setItem('devSidebarHeight', sidebarHeight.toString());
  }, [sidebarHeight]);

  // Save presets to localStorage
  useEffect(() => {
    localStorage.setItem('devPresets', JSON.stringify(presets));
  }, [presets]);

  // Preset management functions
  const saveCurrentAsPreset = () => {
    const currentControls = getPageControls(currentPage);
    const newPreset = { ...currentControls };

    if (!newPresetName.trim()) {
      // If no name provided, save to current preset
      setPresets(prev => ({
        ...prev,
        [currentPreset]: newPreset
      }));
      showNotification(`Settings saved to "${currentPreset}" preset`);
    } else {
      // Save as new preset
      setPresets(prev => ({
        ...prev,
        [newPresetName]: newPreset
      }));
      setCurrentPreset(newPresetName);
      setNewPresetName('');
      showNotification(`New preset "${newPresetName}" created and saved`);
    }
  };

  const loadPreset = (presetName) => {
    const preset = presets[presetName];
    if (preset) {
      Object.entries(preset).forEach(([key, value]) => {
        updatePageControl(currentPage, key, value);
      });
      setCurrentPreset(presetName);
      showNotification(`Preset "${presetName}" loaded`);
    }
  };

  const deletePreset = (presetName) => {
    if (presetName === 'Default') return; // Don't delete default

    setPresets(prev => {
      const newPresets = { ...prev };
      delete newPresets[presetName];
      return newPresets;
    });

    if (currentPreset === presetName) {
      setCurrentPreset('Default');
      loadPreset('Default');
    }

    showNotification(`Preset "${presetName}" deleted`);
  };



  // Momentum scrolling functions
  const startMomentumScroll = (initialVelocity) => {
    if (momentumAnimationId) {
      cancelAnimationFrame(momentumAnimationId);
    }

    let velocity = initialVelocity; // Start with calculated velocity
    let lastTime = performance.now();
    const minVelocity = 0.1; // Higher threshold for smoother stop

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      if (Math.abs(velocity) < minVelocity || !topPanelRef.current) {
        setMomentumAnimationId(null);
        return;
      }

      // Apply velocity to scroll position (scale velocity for better feel)
      const scaledVelocity = velocity * (deltaTime / 16); // Frame rate compensation
      const newScrollTop = topPanelRef.current.scrollTop + scaledVelocity;
      const maxScroll = topPanelRef.current.scrollHeight - topPanelRef.current.clientHeight;

      // Clamp scroll position and stop at edges
      if (newScrollTop <= 0) {
        topPanelRef.current.scrollTop = 0;
        velocity = 0; // Stop momentum
        setMomentumAnimationId(null); // End animation
        return; // Exit animation loop
      } else if (newScrollTop >= maxScroll) {
        topPanelRef.current.scrollTop = maxScroll;
        velocity = 0; // Stop momentum
        setMomentumAnimationId(null); // End animation
        return; // Exit animation loop
      } else {
        topPanelRef.current.scrollTop = newScrollTop;
      }

      // Apply realistic friction (exponential decay)
      const friction = Math.pow(0.92, deltaTime / 16); // Frame-rate independent
      velocity *= friction;

      // Continue animation
      setMomentumAnimationId(requestAnimationFrame(animate));
    };

    setMomentumAnimationId(requestAnimationFrame(animate));
  };

  // Mouse event handlers for click-and-drag scrolling
  const handlePanelMouseDown = (e, panelRef) => {
    if (!panelRef.current) return;

    // Don't start scrolling if clicking on form elements or interactive elements
    const target = e.target;
    const interactiveTags = ['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA', 'OPTION'];
    const interactiveClasses = ['preset-input', 'preset-select', 'save-preset-btn', 'btn'];

    if (interactiveTags.includes(target.tagName) ||
        interactiveClasses.some(cls => target.classList.contains(cls))) {
      return; // Let the form element handle its own events
    }

    // Stop any existing momentum animation
    if (momentumAnimationId) {
      cancelAnimationFrame(momentumAnimationId);
      setMomentumAnimationId(null);
    }

    setIsScrolling(true);
    setScrollStartY(e.clientY);
    setScrollStartTop(panelRef.current.scrollTop);
    dragStartTimeRef.current = Date.now();
    dragStartYRef.current = e.clientY;
    setLastScrollTime(Date.now());
    setLastScrollY(e.clientY);
    e.preventDefault();
  };

  const handlePanelMouseMove = (e) => {
    if (!isScrolling) return;

    const currentTime = Date.now();
    const deltaTime = currentTime - lastScrollTime;
    const currentY = e.clientY;
    const deltaY = currentY - lastScrollY; // Change in position this frame
    const totalDeltaY = currentY - scrollStartY; // Total displacement from start
    const newScrollTop = scrollStartTop - totalDeltaY; // Drag down = scroll up (natural scrolling)

    // Calculate instantaneous velocity (pixels per millisecond)
    // Use the change in position over the last frame for accurate velocity
    if (deltaTime > 0) {
      const newVelocity = deltaY / deltaTime;
      scrollVelocityRef.current = newVelocity;
    }

    // Apply scroll to the panel
    if (topPanelRef.current) {
      topPanelRef.current.scrollTop = Math.max(0, Math.min(
        topPanelRef.current.scrollHeight - topPanelRef.current.clientHeight,
        newScrollTop
      ));
    }

    setLastScrollTime(currentTime);
    setLastScrollY(currentY);
  };

  const handlePanelMouseUp = () => {
    if (isScrolling) {
      // Use the last instantaneous velocity for momentum
      startMomentumScroll(scrollVelocityRef.current);
    }
    setIsScrolling(false);
  };

  // Mouse event handlers for resizing sidebar width
  const handleResizeMouseDown = (e) => {
    setIsResizing(true);
    setResizeStartX(e.clientX);
    setResizeStartWidth(sidebarWidth);
    e.preventDefault();
  };

  const handleResizeMouseMove = (e) => {
    if (!isResizing) return;

    const deltaX = e.clientX - resizeStartX;
    // Try inverted logic for both borders
    const widthDelta = -deltaX;
    const newWidth = Math.max(200, Math.min(800, resizeStartWidth + widthDelta));
    setSidebarWidth(newWidth);
  };

  const handleResizeMouseUp = () => {
    setIsResizing(false);
  };

  // Touch event handlers for resizing sidebar width (mobile support)
  const handleResizeTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsResizing(true);
      setResizeStartX(e.touches[0].clientX);
      setResizeStartWidth(sidebarWidth);
      e.preventDefault();
    }
  };

  const handleResizeTouchMove = (e) => {
    if (!isResizing || e.touches.length !== 1) return;

    const deltaX = e.touches[0].clientX - resizeStartX;
    // Try inverted logic for both borders
    const widthDelta = -deltaX;
    const newWidth = Math.max(200, Math.min(800, resizeStartWidth + widthDelta));
    setSidebarWidth(newWidth);
    e.preventDefault();
  };

  const handleResizeTouchEnd = () => {
    setIsResizing(false);
  };

  // Touch event handlers for panel scrolling (mobile support)
  const handlePanelTouchStart = (e, panelRef) => {
    if (!panelRef.current || e.touches.length !== 1) return;

    // Don't start scrolling if touching on form elements or interactive elements
    const target = e.target;
    const interactiveTags = ['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA', 'OPTION'];
    const interactiveClasses = ['preset-input', 'preset-select', 'save-preset-btn', 'btn'];

    if (interactiveTags.includes(target.tagName) ||
        interactiveClasses.some(cls => target.classList.contains(cls))) {
      return; // Let the form element handle its own events
    }

    // Stop any existing momentum animation
    if (momentumAnimationId) {
      cancelAnimationFrame(momentumAnimationId);
      setMomentumAnimationId(null);
    }

    setIsScrolling(true);
    setScrollStartY(e.touches[0].clientY);
    setScrollStartTop(panelRef.current.scrollTop);
    dragStartTimeRef.current = Date.now();
    dragStartYRef.current = e.touches[0].clientY;
    setLastScrollTime(Date.now());
    setLastScrollY(e.touches[0].clientY);
    e.preventDefault();
  };

  const handlePanelTouchMove = (e) => {
    if (!isScrolling || e.touches.length !== 1) return;

    const currentTime = Date.now();
    const deltaTime = currentTime - lastScrollTime;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - lastScrollY; // Change in position this frame
    const totalDeltaY = currentY - scrollStartY; // Total displacement from start
    const newScrollTop = scrollStartTop - totalDeltaY; // Drag down = scroll up (natural scrolling)

    // Calculate instantaneous velocity (pixels per millisecond)
    // Use the change in position over the last frame for accurate velocity
    if (deltaTime > 0) {
      const newVelocity = deltaY / deltaTime;
      scrollVelocityRef.current = newVelocity;
    }

    // Apply scroll to the panel
    if (topPanelRef.current) {
      topPanelRef.current.scrollTop = Math.max(0, Math.min(
        topPanelRef.current.scrollHeight - topPanelRef.current.clientHeight,
        newScrollTop
      ));
    }

    setLastScrollTime(currentTime);
    setLastScrollY(currentY);
    e.preventDefault();
  };

  const handlePanelTouchEnd = () => {
    if (isScrolling) {
      // Use the last instantaneous velocity for momentum
      startMomentumScroll(scrollVelocityRef.current);
    }
    setIsScrolling(false);
  };

  // Add global mouse and touch event listeners when scrolling or resizing
  useEffect(() => {
    if (isScrolling) {
      // Mouse events
      document.addEventListener('mousemove', handlePanelMouseMove);
      document.addEventListener('mouseup', handlePanelMouseUp);
      // Touch events
      document.addEventListener('touchmove', handlePanelTouchMove, { passive: false });
      document.addEventListener('touchend', handlePanelTouchEnd);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else if (isResizing) {
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
      document.removeEventListener('mousemove', handlePanelMouseMove);
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handlePanelMouseUp);
      document.removeEventListener('mouseup', handleResizeMouseUp);
      // Remove touch events
      document.removeEventListener('touchmove', handlePanelTouchMove);
      document.removeEventListener('touchmove', handleResizeTouchMove);
      document.removeEventListener('touchend', handlePanelTouchEnd);
      document.removeEventListener('touchend', handleResizeTouchEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      // Cleanup mouse events
      document.removeEventListener('mousemove', handlePanelMouseMove);
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handlePanelMouseUp);
      document.removeEventListener('mouseup', handleResizeMouseUp);
      // Cleanup touch events
      document.removeEventListener('touchmove', handlePanelTouchMove);
      document.removeEventListener('touchmove', handleResizeTouchMove);
      document.removeEventListener('touchend', handlePanelTouchEnd);
      document.removeEventListener('touchend', handleResizeTouchEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isScrolling, isResizing]);

  // Debug sidebar state - removed console.log to prevent spam

  if (!isDevMode) {
    return null; // Only render sidebar if dev mode is active
  }

  const renderPageControls = () => {
    const pageControls = [];

    // Add page-specific controls
    switch (currentPage) {
      case '/':
        pageControls.push(<HomePageControls key="home" />);
        break;
      case '/music':
        pageControls.push(<MusicPageControls key="music" />);
        break;
      case '/3d-art':
        pageControls.push(<ThreeDArtPageControls key="3d-art" />);
        break;
      case '/2d-art':
        pageControls.push(<TwoDArtPageControls key="2d-art" />);
        break;
      case '/contact':
        pageControls.push(<ContactPageControls key="contact" />);
        break;
      case '/about':
        pageControls.push(<GenericPageControls key="about" pagePath="/about" pageName="About" />);
        break;
      case '/resume':
        pageControls.push(<ResumePageControls key="resume" />);
        break;
      case '/blog':
        pageControls.push(<GenericPageControls key="blog" pagePath="/blog" pageName="Blog" />);
        break;
      case '/process':
        pageControls.push(<GenericPageControls key="process" pagePath="/process" pageName="Process" />);
        break;
      case '/testimonials':
        pageControls.push(<GenericPageControls key="testimonials" pagePath="/testimonials" pageName="Testimonials" />);
        break;
      case '/shop':
        pageControls.push(<GenericPageControls key="shop" pagePath="/shop" pageName="Shop" />);
        break;
      case '/links':
        pageControls.push(<GenericPageControls key="links" pagePath="/links" pageName="Links" />);
        break;
      default:
        pageControls.push(<div key="no-controls" className="page-controls"><p>No controls available for this page</p></div>);
    }

    // Always add slideshow controls
    pageControls.push(<SlideshowControls key="slideshow" />);

    return pageControls;
  };

  return (
    <>

      <aside
        ref={sidebarRef}
        className={`dev-sidebar ${isSidebarOpen ? 'open' : 'closed'} ${isResizing ? 'resizing' : ''}`}
        style={{ width: `${sidebarWidth}px` }}
        onMouseDown={(e) => {
          // Check if clicking on the left border area for resize
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;

          // Left border resize (within 25px of left edge)
          if (clickX >= 0 && clickX <= 25) {
            setResizeBorder('left');
            handleResizeMouseDown(e);
          }
        }}
        onTouchStart={(e) => {
          // Check if touching on the left border area for resize
          const rect = e.currentTarget.getBoundingClientRect();
          const touchX = e.touches[0].clientX - rect.left;

          // Left border resize (within 40px of left edge for better touch target on mobile)
          if (touchX >= 0 && touchX <= 40) {
            setResizeBorder('left');
            handleResizeTouchStart(e);
          }
        }}
      >
      <div className="sidebar-content">
        {/* Single Panel - All Dev Tools */}
        <div
          className="sidebar-main-content"
          onMouseDown={(e) => handlePanelMouseDown(e, topPanelRef)}
          ref={topPanelRef}
        >
          <div className="panel-content">
            {/* Header with title and collapse button for mobile */}
            <div className="sidebar-header">
              <h3>Dev Tools</h3>
              {isMobileView && (
                <button
                  className="mobile-collapse-btn"
                  onClick={toggleSidebar}
                  title="Close Dev Sidebar"
                  aria-label="Close Dev Sidebar"
                >
                  <span className="expand-icon">▶</span>
                </button>
              )}
            </div>
            <p>Current Page: <strong>{currentPage || 'Home'}</strong></p>
            <p>Current Theme: <strong>{theme}</strong></p>
            <button onClick={toggleTheme} className="btn secondary-btn dev-sidebar-btn">
              Toggle Theme ({theme === 'dark' ? 'Light' : 'Dark'})
            </button>

            {/* Page-specific controls */}
            {renderPageControls()}

            {/* Preset Management */}
            <div className="preset-management">
              <h5>Style Presets</h5>

              {/* Current Preset Display */}
              <div className="current-preset">
                Current: <strong>{currentPreset}</strong>
              </div>

              {/* Preset Selection */}
              <div className="preset-selection">
                <select
                  value={currentPreset}
                  onChange={(e) => loadPreset(e.target.value)}
                  className="preset-select"
                >
                  {Object.keys(presets).map(presetName => (
                    <option key={presetName} value={presetName}>{presetName}</option>
                  ))}
                </select>
              </div>

              {/* Save New Preset */}
              <div className="save-preset">
                <input
                  type="text"
                  placeholder="Preset name"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="preset-input"
                />
                <button
                  onClick={saveCurrentAsPreset}
                  className="btn primary-btn save-preset-btn"
                >
                  Save
                </button>
              </div>

              {/* Preset Actions */}
              <div className="preset-actions">
                <button
                  onClick={() => loadPreset(currentPreset)}
                  className="btn secondary-btn"
                >
                  Load
                </button>
                <button
                  onClick={() => deletePreset(currentPreset)}
                  disabled={currentPreset === 'Default'}
                  className="btn secondary-btn"
                >
                  Delete
                </button>
              </div>

              {/* Preset List */}
              <div className="preset-list">
                <h6>Available Presets:</h6>
                <div className="preset-items">
                  {Object.keys(presets).map(presetName => (
                    <div
                      key={presetName}
                      onClick={() => loadPreset(presetName)}
                      className={`preset-item ${currentPreset === presetName ? 'active' : ''}`}
                    >
                      <span className={currentPreset === presetName ? 'active-text' : ''}>
                        {presetName}
                      </span>
                      {currentPreset === presetName && (
                        <span className="active-indicator">●</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Management Section */}
            <ContentUploadSection />

            {/* System Info at bottom */}
            <div className="dev-info">
              <h4>System Info:</h4>
              <p>React Version: {React.version}</p>
              <p>Vite Environment: {import.meta.env.MODE}</p>
            </div>
          </div>
        </div>
      </div>

        {/* Notification */}
        {notification && (
          <div className={`sidebar-notification ${notification.type}`}>
            <span>{notification.message}</span>
          </div>
        )}
      </aside>
    </>
  );
}

export default DevSidebar;

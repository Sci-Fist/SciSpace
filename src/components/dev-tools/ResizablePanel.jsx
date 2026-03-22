import React, { useState, useRef, useEffect } from 'react';
import HomePageControls from '../dev-controls/HomePageControls.jsx';
import MusicPageControls from '../dev-controls/MusicPageControls.jsx';
import ThreeDArtPageControls from '../dev-controls/ThreeDArtPageControls.jsx';
import TwoDArtPageControls from '../dev-controls/TwoDArtPageControls.jsx';
import ContactPageControls from '../dev-controls/ContactPageControls.jsx';
import GenericPageControls from '../dev-controls/GenericPageControls.jsx';
import SlideshowControls from '../dev-controls/SlideshowControls.jsx';
import ContentUploadSection from './ContentUploadSection.jsx';
import SystemInfo from './SystemInfo.jsx';

function ResizablePanel({ currentPage, sidebarWidth, setSidebarWidth, sidebarHeight, setSidebarHeight }) {
  const [isResizing, setIsResizing] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollStartY, setScrollStartY] = useState(0);
  const [scrollStartTop, setScrollStartTop] = useState(0);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartY, setResizeStartY] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const [resizeStartHeight, setResizeStartHeight] = useState(0);
  const topPanelRef = useRef(null);

  // Save sidebar width and height to localStorage
  useEffect(() => {
    localStorage.setItem('devSidebarWidth', sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    localStorage.setItem('devSidebarHeight', sidebarHeight.toString());
  }, [sidebarHeight]);

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

    setIsScrolling(true);
    setScrollStartY(e.clientY);
    setScrollStartTop(panelRef.current.scrollTop);
    e.preventDefault();
  };

  const handlePanelMouseMove = (e) => {
    if (!isScrolling) return;

    const deltaY = scrollStartY - e.clientY;
    const newScrollTop = scrollStartTop + deltaY;

    // Apply scroll to the panel
    if (topPanelRef.current && topPanelRef.current.contains(e.target)) {
      topPanelRef.current.scrollTop = Math.max(0, Math.min(
        topPanelRef.current.scrollHeight - topPanelRef.current.clientHeight,
        newScrollTop
      ));
    }
  };

  const handlePanelMouseUp = () => {
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
    const newWidth = Math.max(200, Math.min(800, resizeStartWidth - deltaX)); // Inverted: dragging right makes narrower, dragging left makes wider
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
    const newWidth = Math.max(200, Math.min(800, resizeStartWidth - deltaX)); // Inverted: dragging right makes narrower, dragging left makes wider
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

    setIsScrolling(true);
    setScrollStartY(e.touches[0].clientY);
    setScrollStartTop(panelRef.current.scrollTop);
    e.preventDefault();
  };

  const handlePanelTouchMove = (e) => {
    if (!isScrolling || e.touches.length !== 1) return;

    const deltaY = scrollStartY - e.touches[0].clientY;
    const newScrollTop = scrollStartTop + deltaY;

    // Apply scroll to the panel
    if (topPanelRef.current && topPanelRef.current.contains(e.target)) {
      topPanelRef.current.scrollTop = Math.max(0, Math.min(
        topPanelRef.current.scrollHeight - topPanelRef.current.clientHeight,
        newScrollTop
      ));
    }
    e.preventDefault();
  };

  const handlePanelTouchEnd = () => {
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

  return (
    <div
      ref={topPanelRef}
      className="sidebar-panel full-panel"
      onMouseDown={(e) => handlePanelMouseDown(e, topPanelRef)}
      onTouchStart={(e) => handlePanelTouchStart(e, topPanelRef)}
    >
      <div className="panel-content">
        {/* Page-specific controls */}
        <PageControlsRenderer currentPage={currentPage} />

        {/* Content Management Section */}
        <ContentUploadSection />

        {/* System Info at bottom */}
        <SystemInfo />
      </div>
    </div>
  );
}

export default ResizablePanel;

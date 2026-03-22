import React, { useState, useRef, useEffect } from 'react';

function useSidebarResize() {
  // Sidebar state and refs
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('devSidebarWidth');
    return saved ? parseFloat(saved) : 400; // Default 400px width
  });
  const [sidebarHeight, setSidebarHeight] = useState(() => {
    const saved = localStorage.getItem('devSidebarHeight');
    return saved ? parseFloat(saved) : 50; // Default 50vh height on mobile
  });
  // Sidebar padding state
  const [sidebarPadding, setSidebarPadding] = useState(() => {
    const saved = localStorage.getItem('devSidebarPadding');
    return saved ? parseFloat(saved) : 10; // Default 10px padding
  });
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

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

  // Function to initiate resize based on click/touch position on the sidebar edge
  const handleSidebarMouseDown = (e) => {
    if (!sidebarRef.current) return;
    const rect = sidebarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    if (clickX <= 10 && clickX >= 0) { // Check if clicking on the left border area (within 10px)
      handleResizeMouseDown(e);
    }
  };

  const handleSidebarTouchStart = (e) => {
    if (!sidebarRef.current || e.touches.length !== 1) return;
    const rect = sidebarRef.current.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;

    if (touchX <= 40 && touchX >= 0) { // Check if touching on the left border area (within 40px for better touch target)
      handleResizeTouchStart(e);
    }
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

  return {
    sidebarRef,
    sidebarWidth,
    sidebarHeight,
    sidebarPadding, // Return padding state
    handlePaddingChange, // Return padding handler
    isResizing,
    handleSidebarMouseDown, // Return the new handler for mouse down
    handleSidebarTouchStart, // Return the new handler for touch start
    // Note: handleResizeMouseMove, handleResizeMouseUp, etc. are used internally by the hook
  };
}

export default useSidebarResize;
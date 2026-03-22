import { useEffect, useRef } from 'react';
import { useLogger as useLoggerContext } from '../context/LoggerContext.jsx';

/**
 * Custom hook for component logging
 * Provides automatic lifecycle logging and easy access to logging methods
 */

export const useLogger = (componentName, options = {}) => {
  const logger = useLoggerContext();
  const mountTimeRef = useRef(null);
  const renderCountRef = useRef(0);

  const {
    logMount = true,
    logUnmount = true,
    logRenders = false,
    logPerformance = false,
    customData = {}
  } = options;

  // Component mount logging
  useEffect(() => {
    if (logMount) {
      mountTimeRef.current = performance.now();
      logger.logComponentLifecycle(componentName, 'mounted', {
        ...customData,
        mountTime: mountTimeRef.current
      });
    }

    // Component unmount logging
    return () => {
      if (logUnmount) {
        const unmountTime = performance.now();
        const lifecycleDuration = mountTimeRef.current
          ? unmountTime - mountTimeRef.current
          : null;

        logger.logComponentLifecycle(componentName, 'unmounted', {
          ...customData,
          unmountTime,
          lifecycleDuration
        });
      }
    };
  }, [componentName, logMount, logUnmount, customData, logger]);

  // Render logging
  useEffect(() => {
    renderCountRef.current += 1;

    if (logRenders && renderCountRef.current > 1) { // Don't log initial render
      logger.logComponentLifecycle(componentName, 'rendered', {
        ...customData,
        renderCount: renderCountRef.current,
        renderTime: performance.now()
      });
    }
  });

  // Performance logging for component
  useEffect(() => {
    if (logPerformance) {
      const startTime = performance.now();

      return () => {
        const endTime = performance.now();
        const duration = endTime - startTime;

        logger.logPerformance(`${componentName}_render_time`, duration, {
          ...customData,
          componentName,
          startTime,
          endTime
        });
      };
    }
  }, [componentName, logPerformance, customData, logger]);

  // Enhanced interaction logging with mouse/touch coordinates
  const logInteraction = (type, target, event = null, additionalData = {}) => {
    const coordinates = event ? {
      clientX: event.clientX,
      clientY: event.clientY,
      screenX: event.screenX,
      screenY: event.screenY,
      pageX: event.pageX,
      pageY: event.pageY
    } : null;

    logger.logInteraction(type, target, {
      ...additionalData,
      ...customData,
      coordinates,
      componentName
    });
  };

  // State change logging
  const logStateChange = (stateName, oldValue, newValue, additionalData = {}) => {
    logger.debug(`State changed: ${componentName}.${stateName}`, {
      ...additionalData,
      ...customData,
      componentName,
      stateName,
      oldValue,
      newValue,
      changeType: 'state_update'
    }, 'component');
  };

  // Props change logging
  const logPropsChange = (propName, oldValue, newValue, additionalData = {}) => {
    logger.debug(`Props changed: ${componentName}.${propName}`, {
      ...additionalData,
      ...customData,
      componentName,
      propName,
      oldValue,
      newValue,
      changeType: 'props_update'
    }, 'component');
  };

  // Error logging specific to this component
  const logError = (error, context = {}, category = 'component') => {
    logger.error(`Component error in ${componentName}: ${error.message}`, {
      ...context,
      ...customData,
      componentName,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    }, category);
  };

  // Feature usage logging
  const logFeatureUsage = (feature, action, data = {}) => {
    logger.logFeatureUsage(`${componentName}.${feature}`, action, {
      ...data,
      ...customData,
      componentName
    });
  };

  // Performance measurement for specific operations
  const measurePerformance = (operationName, operation, additionalData = {}) => {
    const startTime = performance.now();

    try {
      const result = operation();

      // If operation returns a promise, measure completion
      if (result && typeof result.then === 'function') {
        return result
          .then((resolvedResult) => {
            const endTime = performance.now();
            logger.logPerformance(`${componentName}_${operationName}`, endTime - startTime, {
              ...additionalData,
              ...customData,
              componentName,
              operationName,
              async: true,
              success: true
            });
            return resolvedResult;
          })
          .catch((error) => {
            const endTime = performance.now();
            logger.logPerformance(`${componentName}_${operationName}`, endTime - startTime, {
              ...additionalData,
              ...customData,
              componentName,
              operationName,
              async: true,
              success: false,
              error: error.message
            });
            throw error;
          });
      } else {
        // Synchronous operation
        const endTime = performance.now();
        logger.logPerformance(`${componentName}_${operationName}`, endTime - startTime, {
          ...additionalData,
          ...customData,
          componentName,
          operationName,
          async: false
        });
        return result;
      }
    } catch (error) {
      const endTime = performance.now();
      logger.logPerformance(`${componentName}_${operationName}`, endTime - startTime, {
        ...additionalData,
        ...customData,
        componentName,
        operationName,
        async: false,
        success: false,
        error: error.message
      });
      throw error;
    }
  };

  // Mouse event logging
  const logMouseEvent = (eventType, event, target = null) => {
    logInteraction(`mouse_${eventType}`, target || event.target, event, {
      button: event.button,
      buttons: event.buttons,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey
    });
  };

  // Keyboard event logging
  const logKeyboardEvent = (eventType, event, target = null) => {
    logInteraction(`keyboard_${eventType}`, target || event.target, event, {
      key: event.key,
      code: event.code,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      repeat: event.repeat
    });
  };

  // Touch event logging
  const logTouchEvent = (eventType, event, target = null) => {
    const touches = Array.from(event.touches || []).map(touch => ({
      identifier: touch.identifier,
      clientX: touch.clientX,
      clientY: touch.clientY,
      screenX: touch.screenX,
      screenY: touch.screenY
    }));

    logInteraction(`touch_${eventType}`, target || event.target, event, {
      touches: touches.length,
      touchDetails: touches,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey
    });
  };

  // Scroll event logging
  const logScrollEvent = (event, target = null, additionalData = {}) => {
    const element = target || event.target;
    logInteraction('scroll', element, event, {
      ...additionalData,
      scrollTop: element.scrollTop,
      scrollLeft: element.scrollLeft,
      scrollHeight: element.scrollHeight,
      scrollWidth: element.scrollWidth,
      clientHeight: element.clientHeight,
      clientWidth: element.clientWidth
    });
  };

  // Focus event logging
  const logFocusEvent = (eventType, event, target = null) => {
    logInteraction(`focus_${eventType}`, target || event.target, event, {
      relatedTarget: event.relatedTarget
    });
  };

  return {
    // Core logger methods
    ...logger,

    // Component-specific methods
    logInteraction,
    logStateChange,
    logPropsChange,
    logError,
    logFeatureUsage,
    measurePerformance,

    // Event-specific methods
    logMouseEvent,
    logKeyboardEvent,
    logTouchEvent,
    logScrollEvent,
    logFocusEvent,

    // Component metadata
    componentName,
    renderCount: renderCountRef.current,
    mountTime: mountTimeRef.current
  };
};

export default useLogger;

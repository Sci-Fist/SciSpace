import React, { createContext, useContext, useEffect, useState } from 'react';
import logger from '../utils/logger.js';

/**
 * Logger Context for React components
 * Provides logging functionality and real-time log updates throughout the app
 */

const LoggerContext = createContext();

export const useLogger = () => {
  const context = useContext(LoggerContext);
  if (!context) {
    throw new Error('useLogger must be used within a LoggerProvider');
  }
  return context;
};

export const LoggerProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);
  const [isLoggingEnabled, setIsLoggingEnabled] = useState(true);
  const [logFilters, setLogFilters] = useState({
    level: null,
    category: null,
    searchTerm: ''
  });

  // Listen for real-time log updates
  useEffect(() => {
    const handleLogEntry = (event) => {
      const newLog = event.detail;
      setLogs(prevLogs => {
        const updatedLogs = [...prevLogs, newLog];
        // Keep only the most recent 100 logs in state for performance
        return updatedLogs.slice(-100);
      });
    };

    window.addEventListener('logEntry', handleLogEntry);

    // Initialize with existing logs
    setLogs(logger.getLogs().slice(-100));

    return () => {
      window.removeEventListener('logEntry', handleLogEntry);
    };
  }, []);

  // Component lifecycle logging hook
  const logComponentLifecycle = (componentName, event, data = {}) => {
    if (!isLoggingEnabled) return;
    logger.componentLifecycle(componentName, event, data);
  };

  // User interaction logging
  const logInteraction = (type, target, data = {}) => {
    if (!isLoggingEnabled) return;
    logger.interaction(type, target, data);
  };

  // Performance logging
  const logPerformance = (metric, value, data = {}) => {
    if (!isLoggingEnabled) return;
    logger.performance(metric, value, data);
  };

  // Error logging
  const logError = (message, data = {}, category = 'error') => {
    if (!isLoggingEnabled) return;
    logger.error(message, data, category);
  };

  // Navigation logging
  const logNavigation = (from, to, data = {}) => {
    if (!isLoggingEnabled) return;
    logger.info(`Navigation: ${from} -> ${to}`, {
      ...data,
      from,
      to,
      navigationType: 'route_change'
    }, 'navigation');
  };

  // Feature usage logging
  const logFeatureUsage = (featureName, action, data = {}) => {
    if (!isLoggingEnabled) return;
    logger.info(`Feature used: ${featureName} - ${action}`, {
      ...data,
      featureName,
      action
    }, 'feature_usage');
  };

  // Theme change logging
  const logThemeChange = (fromTheme, toTheme, data = {}) => {
    if (!isLoggingEnabled) return;
    logger.info(`Theme changed: ${fromTheme} -> ${toTheme}`, {
      ...data,
      fromTheme,
      toTheme
    }, 'theme');
  };

  // Gallery interaction logging
  const logGalleryInteraction = (galleryType, action, data = {}) => {
    if (!isLoggingEnabled) return;
    logger.info(`Gallery ${action}: ${galleryType}`, {
      ...data,
      galleryType,
      action
    }, 'gallery');
  };

  // Form interaction logging
  const logFormInteraction = (formName, fieldName, action, data = {}) => {
    if (!isLoggingEnabled) return;
    logger.info(`Form interaction: ${formName}.${fieldName} - ${action}`, {
      ...data,
      formName,
      fieldName,
      action
    }, 'form');
  };

  // Dev tools usage logging
  const logDevToolsUsage = (toolName, action, data = {}) => {
    if (!isLoggingEnabled) return;
    logger.info(`Dev tool used: ${toolName} - ${action}`, {
      ...data,
      toolName,
      action
    }, 'dev_tools');
  };

  // Get filtered logs
  const getFilteredLogs = () => {
    let filteredLogs = logs;

    if (logFilters.level) {
      filteredLogs = filteredLogs.filter(log => log.level === logFilters.level);
    }

    if (logFilters.category) {
      filteredLogs = filteredLogs.filter(log => log.category === logFilters.category);
    }

    if (logFilters.searchTerm) {
      const searchTerm = logFilters.searchTerm.toLowerCase();
      filteredLogs = filteredLogs.filter(log =>
        log.message.toLowerCase().includes(searchTerm) ||
        log.category.toLowerCase().includes(searchTerm) ||
        JSON.stringify(log.data).toLowerCase().includes(searchTerm)
      );
    }

    return filteredLogs;
  };

  // Export logs
  const exportLogs = (format = 'json') => {
    return logger.exportLogs(format, logFilters);
  };

  // Clear logs
  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  // Set log level
  const setLogLevel = (level) => {
    logger.setLevel(level);
  };

  // Get session info
  const getSessionInfo = () => {
    return logger.getSessionInfo();
  };

  // Toggle logging
  const toggleLogging = () => {
    setIsLoggingEnabled(prev => !prev);
    logger.info(`Logging ${!isLoggingEnabled ? 'enabled' : 'disabled'}`, {}, 'system');
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setLogFilters(prev => ({ ...prev, ...newFilters }));
  };

  const value = {
    // State
    logs: getFilteredLogs(),
    allLogs: logs,
    isLoggingEnabled,
    logFilters,

    // Core logging methods
    debug: (message, data, category) => isLoggingEnabled && logger.debug(message, data, category),
    info: (message, data, category) => isLoggingEnabled && logger.info(message, data, category),
    warn: (message, data, category) => isLoggingEnabled && logger.warn(message, data, category),
    error: logError,

    // Specialized logging methods
    logComponentLifecycle,
    logInteraction,
    logPerformance,
    logNavigation,
    logFeatureUsage,
    logThemeChange,
    logGalleryInteraction,
    logFormInteraction,
    logDevToolsUsage,

    // Management methods
    getFilteredLogs,
    exportLogs,
    clearLogs,
    setLogLevel,
    getSessionInfo,
    toggleLogging,
    updateFilters,

    // Direct access to logger instance for advanced usage
    logger
  };

  return (
    <LoggerContext.Provider value={value}>
      {children}
    </LoggerContext.Provider>
  );
};

export default LoggerContext;

/**
 * Comprehensive Logging System for Portfolio Website
 * Provides structured logging with multiple transports, performance monitoring,
 * and user interaction tracking.
 */

class Logger {
  constructor() {
    this.levels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3
    };

    // Production optimization settings - MUST be defined before use
    this.isProduction = process.env.NODE_ENV === 'production';
    
    // Set default log level - allow INFO and above in development
    this.currentLevel = this.isProduction ? this.levels.WARN : this.levels.INFO;
    this.logs = [];
    this.maxLogs = 1000; // Maximum logs to keep in memory
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.samplingRates = {
      DEBUG: this.isProduction ? 0.01 : 1.0, // 1% in production, 100% in development
      INFO: this.isProduction ? 0.1 : 1.0,   // 10% in production, 100% in development
      WARN: this.isProduction ? 0.5 : 1.0,   // 50% in production, 100% in development
      ERROR: 1.0 // Always log errors
    };

    // Performance monitoring for logging overhead
    this.logCount = 0;
    this.lastPerformanceCheck = performance.now();
    this.performanceThreshold = 100; // Check performance every 100 logs

    // Initialize transports
    this.transports = {
      console: this.consoleTransport.bind(this),
      memory: this.memoryTransport.bind(this),
      localStorage: this.localStorageTransport.bind(this)
    };

    // Performance monitoring
    this.performanceData = {
      fps: [],
      memory: [],
      networkRequests: []
    };

    this.initPerformanceMonitoring();
    this.initGlobalErrorHandling();
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get or create user ID
   */
  getUserId() {
    let userId = localStorage.getItem('portfolio_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('portfolio_user_id', userId);
    }
    return userId;
  }

  /**
   * Create structured log entry
   */
  createLogEntry(level, message, data = {}, category = 'general') {
    return {
      timestamp: new Date().toISOString(),
      level,
      levelNum: this.levels[level],
      message,
      category,
      sessionId: this.sessionId,
      userId: this.userId,
      data: {
        ...data,
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        deviceInfo: this.getDeviceInfo()
      }
    };
  }

  /**
   * Get device information
   */
  getDeviceInfo() {
    return {
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      touchSupport: 'ontouchstart' in window,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth
    };
  }

  /**
   * Console transport
   */
  consoleTransport(logEntry) {
    const { level, message, data, timestamp, category } = logEntry;

    if (level === 'ERROR') {
      console.error(`[${timestamp}] ${category.toUpperCase()} ${level}:`, message, data);
    } else if (level === 'WARN') {
      console.warn(`[${timestamp}] ${category.toUpperCase()} ${level}:`, message, data);
    } else if (level === 'INFO') {
      console.info(`[${timestamp}] ${category.toUpperCase()} ${level}:`, message, data);
    } else {
      console.log(`[${timestamp}] ${category.toUpperCase()} ${level}:`, message, data);
    }
  }

  /**
   * Memory transport - stores logs in memory
   */
  memoryTransport(logEntry) {
    this.logs.push(logEntry);

    // Maintain max logs limit
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Emit custom event for real-time updates
    window.dispatchEvent(new CustomEvent('logEntry', { detail: logEntry }));
  }

  /**
   * Local storage transport
   */
  localStorageTransport(logEntry) {
    try {
      const storedLogs = JSON.parse(localStorage.getItem('portfolio_logs') || '[]');

      // Create a safe version of the log entry for localStorage
      const safeLogEntry = {
        ...logEntry,
        data: this.safeStringifyForStorage(logEntry.data)
      };

      storedLogs.push(safeLogEntry);

      // Keep only last 500 logs in localStorage
      if (storedLogs.length > 500) {
        storedLogs.splice(0, storedLogs.length - 500);
      }

      localStorage.setItem('portfolio_logs', JSON.stringify(storedLogs));
    } catch (error) {
      console.warn('Failed to store log in localStorage:', error);
    }
  }

  /**
   * Safe stringify for localStorage (handles circular references)
   */
  safeStringifyForStorage(obj) {
    if (obj === null || obj === undefined) return obj;

    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);

        // Handle DOM elements
        if (value instanceof Element) {
          return `[DOM Element: ${value.tagName}${value.id ? `#${value.id}` : ''}${value.className ? `.${value.className}` : ''}]`;
        }

        // Handle Event objects
        if (value instanceof Event) {
          return `[Event: ${value.type}]`;
        }

        // Handle functions
        if (typeof value === 'function') {
          return `[Function: ${value.name || 'anonymous'}]`;
        }
      }
      return value;
    });
  }

  /**
   * Check logging performance overhead
   */
  checkLoggingPerformance() {
    const now = performance.now();
    const timeSinceLastCheck = now - this.lastPerformanceCheck;

    if (timeSinceLastCheck > 0) {
      const logsPerSecond = (this.performanceThreshold / timeSinceLastCheck) * 1000;

      // Only log performance warnings if logging is causing significant overhead
      if (logsPerSecond > 100 && !this.isProduction) {
        this.warn('High logging frequency detected', {
          logsPerSecond,
          timeSinceLastCheck
        }, 'performance');
      }
    }

    this.lastPerformanceCheck = now;
  }

  /**
   * Log message with specified level
   */
  log(level, message, data = {}, category = 'general') {
    if (this.levels[level] < this.currentLevel) {
      return;
    }

    // Apply sampling in production to reduce performance impact
    if (this.isProduction && this.samplingRates[level] < 1.0) {
      if (Math.random() > this.samplingRates[level]) {
        return; // Skip this log entry based on sampling rate
      }
    }

    // Performance monitoring for logging overhead - only in development
    if (!this.isProduction) {
      this.logCount++;
      if (this.logCount % this.performanceThreshold === 0) {
        this.checkLoggingPerformance();
      }
    }

    const logEntry = this.createLogEntry(level, message, data, category);

    // Send to all transports
    Object.values(this.transports).forEach(transport => {
      try {
        transport(logEntry);
      } catch (error) {
        console.error('Logging transport error:', error);
      }
    });
  }

  /**
   * Debug level logging
   */
  debug(message, data = {}, category = 'general') {
    this.log('DEBUG', message, data, category);
  }

  /**
   * Info level logging
   */
  info(message, data = {}, category = 'general') {
    this.log('INFO', message, data, category);
  }

  /**
   * Warning level logging
   */
  warn(message, data = {}, category = 'general') {
    this.log('WARN', message, data, category);
  }

  /**
   * Error level logging
   */
  error(message, data = {}, category = 'general') {
    this.log('ERROR', message, data, category);
  }

  /**
   * Performance logging
   */
  performance(metric, value, data = {}) {
    // Only log performance metrics in development, or in production for critical issues
    const shouldLogPerformance = !this.isProduction ||
                                metric.includes('error') ||
                                metric.includes('failed') ||
                                (typeof value === 'number' && value > 5000); // Only log very slow operations

    if (shouldLogPerformance) {
      this.log('INFO', `Performance: ${metric}`, {
        ...data,
        metric,
        value,
        timestamp: performance.now()
      }, 'performance');
    }
  }

  /**
   * User interaction logging
   */
  interaction(type, target, data = {}) {
    this.log('INFO', `User interaction: ${type}`, {
      ...data,
      interactionType: type,
      target: target,
      coordinates: data.coordinates || null
    }, 'interaction');
  }

  /**
   * Component lifecycle logging
   */
  componentLifecycle(componentName, event, data = {}) {
    // Throttle component logging to reduce spam - only log every 10th render
    if ((event === 'render' || event === 'rendered') && !this.isProduction) {
      if (!this._renderCount) this._renderCount = {};
      this._renderCount[componentName] = (this._renderCount[componentName] || 0) + 1;

      if (this._renderCount[componentName] % 10 !== 0) {
        return; // Skip logging for 9 out of 10 renders
      }
    }

    // Only log mount/unmount events in development, and throttle them too
    if ((event === 'mounted' || event === 'unmounted') && !this.isProduction) {
      if (!this._lifecycleCount) this._lifecycleCount = {};
      const key = `${componentName}_${event}`;
      this._lifecycleCount[key] = (this._lifecycleCount[key] || 0) + 1;

      // Only log every 5th mount/unmount event to reduce spam
      if (this._lifecycleCount[key] % 5 !== 0) {
        return;
      }
    }

    this.log('DEBUG', `Component ${event}: ${componentName}`, {
      ...data,
      componentName,
      lifecycleEvent: event,
      renderCount: this._renderCount?.[componentName] || 1
    }, 'component');
  }

  /**
   * Initialize performance monitoring
   */
  initPerformanceMonitoring() {
    // Store IDs for cleanup
    this._fpsAnimationId = null;
    this._memoryIntervalId = null;
    this._originalFetch = window.fetch;

    // FPS monitoring - only in development
    if (!this.isProduction) {
      let lastTime = performance.now();
      let frameCount = 0;
      let fpsLogCount = 0;

      const measureFPS = () => {
        const currentTime = performance.now();
        frameCount++;

        if (currentTime - lastTime >= 1000) {
          const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
          this.performanceData.fps.push({ timestamp: currentTime, fps });

          if (fps < 20 || fpsLogCount % 30 === 0) {
            this.performance('fps', fps);
            fpsLogCount++;
          }

          frameCount = 0;
          lastTime = currentTime;
        }

        this._fpsAnimationId = requestAnimationFrame(measureFPS);
      };
      this._fpsAnimationId = requestAnimationFrame(measureFPS);
    }

    // Memory monitoring - store interval ID for cleanup
    if (performance.memory && !this.isProduction) {
      this._memoryIntervalId = setInterval(() => {
        const memInfo = performance.memory;
        this.performanceData.memory.push({
          timestamp: performance.now(),
          used: memInfo.usedJSHeapSize,
          total: memInfo.totalJSHeapSize,
          limit: memInfo.jsHeapSizeLimit
        });
      }, 30000);
    }

    // Network request monitoring
    const originalFetch = this._originalFetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0] instanceof Request ? args[0].url : args[0];

      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;

        this.performanceData.networkRequests.push({
          timestamp: performance.now(),
          url,
          method: args[0] instanceof Request ? args[0].method : 'GET',
          status: response.status,
          duration
        });

        if (!this.isProduction || duration > 5000 || response.status >= 400) {
          this.performance('network_request', duration, {
            url,
            method: args[0] instanceof Request ? args[0].method : 'GET',
            status: response.status
          });
        }

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        this.error('Network request failed', {
          url,
          method: args[0] instanceof Request ? args[0].method : 'GET',
          duration,
          error: error.message
        }, 'network');
        throw error;
      }
    };
  }

  /**
   * Cleanup resources to prevent memory leaks
   */
  cleanup() {
    if (this._fpsAnimationId) {
      cancelAnimationFrame(this._fpsAnimationId);
      this._fpsAnimationId = null;
    }
    if (this._memoryIntervalId) {
      clearInterval(this._memoryIntervalId);
      this._memoryIntervalId = null;
    }
    if (this._originalFetch) {
      window.fetch = this._originalFetch;
      this._originalFetch = null;
    }
  }

  /**
   * Initialize global error handling
   */
  initGlobalErrorHandling() {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', {
        reason: event.reason,
        promise: event.promise
      }, 'error');
    });

    // Global error handler
    window.addEventListener('error', (event) => {
      this.error('Global JavaScript error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      }, 'error');
    });
  }

  /**
   * Get all logs
   */
  getLogs(filter = {}) {
    let filteredLogs = [...this.logs];

    if (filter.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filter.level);
    }

    if (filter.category) {
      filteredLogs = filteredLogs.filter(log => log.category === filter.category);
    }

    if (filter.startTime) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(filter.startTime));
    }

    if (filter.endTime) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(filter.endTime));
    }

    return filteredLogs;
  }

  /**
   * Export logs in various formats
   */
  exportLogs(format = 'json', filter = {}) {
    const logs = this.getLogs(filter);

    switch (format) {
      case 'json':
        return JSON.stringify(logs, null, 2);

      case 'csv':
        if (logs.length === 0) return '';

        const headers = Object.keys(logs[0]).join(',');
        const rows = logs.map(log =>
          Object.values(log).map(value =>
            typeof value === 'object' ? JSON.stringify(value) : value
          ).join(',')
        );

        return [headers, ...rows].join('\n');

      case 'txt':
        return logs.map(log =>
          `[${log.timestamp}] ${log.category.toUpperCase()} ${log.level}: ${log.message}`
        ).join('\n');

      default:
        return JSON.stringify(logs, null, 2);
    }
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('portfolio_logs');
  }

  /**
   * Set log level
   */
  setLevel(level) {
    if (this.levels.hasOwnProperty(level)) {
      this.currentLevel = this.levels[level];
      this.info(`Log level changed to ${level}`, {}, 'system');
    }
  }

  /**
   * Get current session info
   */
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      startTime: new Date().toISOString(),
      logsCount: this.logs.length,
      performanceData: this.performanceData
    };
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;

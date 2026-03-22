/**
 * Performance Monitor Utility
 * Provides detailed performance tracking and analysis for the portfolio website
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: [],
      memory: [],
      network: [],
      components: new Map(),
      pages: new Map(),
      assets: new Map()
    };

    this.observers = new Set();
    this.isMonitoring = false;
    this.sampleInterval = 1000; // 1 second
    this.maxSamples = 100; // Keep last 100 samples

    // Web Vitals metrics
    this.webVitals = {
      cls: null, // Cumulative Layout Shift
      fid: null, // First Input Delay
      fcp: null, // First Contentful Paint
      lcp: null, // Largest Contentful Paint
      ttfb: null // Time to First Byte
    };
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this._fpsAnimationId = null;
    this._memoryTimeoutId = null;
    this._originalFetch = window.fetch;
    this._webVitalObservers = [];

    this.startFPSTracking();
    this.startMemoryTracking();
    this.startNetworkTracking();
    this.observeWebVitals();

    console.log('Performance monitoring started');
  }

  /**
   * Stop performance monitoring and cleanup resources
   */
  stopMonitoring() {
    this.isMonitoring = false;

    // Cleanup FPS tracking
    if (this._fpsAnimationId) {
      cancelAnimationFrame(this._fpsAnimationId);
      this._fpsAnimationId = null;
    }

    // Cleanup memory tracking
    if (this._memoryTimeoutId) {
      clearTimeout(this._memoryTimeoutId);
      this._memoryTimeoutId = null;
    }

    // Restore original fetch
    if (this._originalFetch) {
      window.fetch = this._originalFetch;
      this._originalFetch = null;
    }

    // Disconnect Web Vitals observers
    if (this._webVitalObservers) {
      this._webVitalObservers.forEach(observer => {
        try { observer.disconnect(); } catch (e) {}
      });
      this._webVitalObservers = [];
    }

    this.metrics.fps = [];
    this.metrics.memory = [];
    this.metrics.network = [];
    console.log('Performance monitoring stopped and cleaned up');
  }

  /**
   * Start FPS tracking
   */
  startFPSTracking() {
    let lastTime = performance.now();
    let frameCount = 0;

    const measureFPS = () => {
      if (!this.isMonitoring) return;

      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

        this.metrics.fps.push({
          timestamp: currentTime,
          fps,
          frameCount
        });

        // Maintain max samples
        if (this.metrics.fps.length > this.maxSamples) {
          this.metrics.fps.shift();
        }

        // Notify observers
        this.notifyObservers('fps', { fps, timestamp: currentTime });

        frameCount = 0;
        lastTime = currentTime;
      }

      this._fpsAnimationId = requestAnimationFrame(measureFPS);
    };

    this._fpsAnimationId = requestAnimationFrame(measureFPS);
  }

  /**
   * Start memory tracking
   */
  startMemoryTracking() {
    if (!performance.memory) {
      console.warn('Memory monitoring not available in this browser');
      return;
    }

    const trackMemory = () => {
      if (!this.isMonitoring) return;

      const memInfo = performance.memory;
      const memoryData = {
        timestamp: performance.now(),
        used: memInfo.usedJSHeapSize,
        total: memInfo.totalJSHeapSize,
        limit: memInfo.jsHeapSizeLimit,
        usedMB: Math.round(memInfo.usedJSHeapSize / 1024 / 1024),
        totalMB: Math.round(memInfo.totalJSHeapSize / 1024 / 1024),
        limitMB: Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024)
      };

      this.metrics.memory.push(memoryData);

      // Maintain max samples
      if (this.metrics.memory.length > this.maxSamples) {
        this.metrics.memory.shift();
      }

      // Notify observers
      this.notifyObservers('memory', memoryData);

      this._memoryTimeoutId = setTimeout(trackMemory, this.sampleInterval);
    };

    trackMemory();
  }

  /**
   * Start network request tracking
   */
  startNetworkTracking() {
    // Override fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      if (!this.isMonitoring) return originalFetch(...args);

      const startTime = performance.now();
      const url = args[0] instanceof Request ? args[0].url : args[0];
      const method = args[0] instanceof Request ? args[0].method : 'GET';

      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;

        const networkData = {
          timestamp: performance.now(),
          url,
          method,
          status: response.status,
          duration,
          size: response.headers.get('content-length') || 'unknown',
          type: this.getResourceType(url),
          success: response.ok
        };

        this.metrics.network.push(networkData);

        // Maintain max samples
        if (this.metrics.network.length > this.maxSamples) {
          this.metrics.network.shift();
        }

        // Notify observers
        this.notifyObservers('network', networkData);

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;

        const networkData = {
          timestamp: performance.now(),
          url,
          method,
          status: 0,
          duration,
          error: error.message,
          success: false
        };

        this.metrics.network.push(networkData);
        this.notifyObservers('network', networkData);

        throw error;
      }
    };

    // Track resource loading
    this.trackResourceLoading();
  }

  /**
   * Track resource loading performance
   */
  trackResourceLoading() {
    // Track images
    const images = document.getElementsByTagName('img');
    Array.from(images).forEach(img => {
      if (img.complete) return; // Already loaded

      img.addEventListener('load', () => {
        const loadTime = performance.now() - (img.dataset.loadStart || 0);
        this.recordAssetLoad('image', img.src, loadTime);
      });

      img.addEventListener('error', () => {
        this.recordAssetLoad('image', img.src, 0, true);
      });

      img.dataset.loadStart = performance.now();
    });

    // Track scripts and stylesheets
    ['script', 'link'].forEach(tagName => {
      const elements = document.getElementsByTagName(tagName);
      Array.from(elements).forEach(element => {
        if (element.dataset.loadStart) return; // Already tracked

        const isLoaded = tagName === 'script' ? element.onload : element.onload;
        if (isLoaded) return; // Already loaded

        element.addEventListener('load', () => {
          const loadTime = performance.now() - (element.dataset.loadStart || 0);
          this.recordAssetLoad(tagName, element.src || element.href, loadTime);
        });

        element.addEventListener('error', () => {
          this.recordAssetLoad(tagName, element.src || element.href, 0, true);
        });

        element.dataset.loadStart = performance.now();
      });
    });
  }

  /**
   * Record asset loading performance
   */
  recordAssetLoad(type, url, loadTime, hasError = false) {
    const assetData = {
      timestamp: performance.now(),
      type,
      url,
      loadTime,
      hasError,
      size: 'unknown' // Could be enhanced with resource timing API
    };

    if (!this.metrics.assets.has(type)) {
      this.metrics.assets.set(type, []);
    }

    this.metrics.assets.get(type).push(assetData);
    this.notifyObservers('asset', assetData);
  }

  /**
   * Observe Web Vitals
   */
  observeWebVitals() {
    // Use web-vitals library if available, otherwise basic observation
    this.observeCLS();
    this.observeFID();
    this.observeFCP();
    this.observeLCP();
    this.observeTTFB();
  }

  /**
   * Observe Cumulative Layout Shift
   */
  observeCLS() {
    let clsValue = 0;
    let clsEntries = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push(entry);
        }
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });

    // Report CLS after page becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.webVitals.cls = clsValue;
        this.notifyObservers('webVital', { name: 'CLS', value: clsValue, entries: clsEntries });
      }
    });
  }

  /**
   * Observe First Input Delay
   */
  observeFID() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.webVitals.fid = entry.processingStart - entry.startTime;
        this.notifyObservers('webVital', { name: 'FID', value: this.webVitals.fid, entry });
        observer.disconnect();
      }
    });

    observer.observe({ entryTypes: ['first-input'] });
  }

  /**
   * Observe First Contentful Paint
   */
  observeFCP() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.webVitals.fcp = entry.startTime;
        this.notifyObservers('webVital', { name: 'FCP', value: this.webVitals.fcp, entry });
        observer.disconnect();
      }
    });

    observer.observe({ entryTypes: ['paint'] });
  }

  /**
   * Observe Largest Contentful Paint
   */
  observeLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.webVitals.lcp = lastEntry.startTime;
      this.notifyObservers('webVital', { name: 'LCP', value: this.webVitals.lcp, entry: lastEntry });
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  /**
   * Observe Time to First Byte
   */
  observeTTFB() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.webVitals.ttfb = entry.responseStart - entry.requestStart;
        this.notifyObservers('webVital', { name: 'TTFB', value: this.webVitals.ttfb, entry });
        observer.disconnect();
      }
    });

    observer.observe({ entryTypes: ['navigation'] });
  }

  /**
   * Track component performance
   */
  trackComponent(componentName, operation, startTime, endTime, additionalData = {}) {
    const duration = endTime - startTime;

    if (!this.metrics.components.has(componentName)) {
      this.metrics.components.set(componentName, []);
    }

    const componentData = {
      timestamp: performance.now(),
      operation,
      duration,
      startTime,
      endTime,
      ...additionalData
    };

    this.metrics.components.get(componentName).push(componentData);
    this.notifyObservers('component', { componentName, ...componentData });
  }

  /**
   * Track page performance
   */
  trackPageLoad(pageName, loadTime, additionalData = {}) {
    const pageData = {
      timestamp: performance.now(),
      pageName,
      loadTime,
      ...additionalData
    };

    if (!this.metrics.pages.has(pageName)) {
      this.metrics.pages.set(pageName, []);
    }

    this.metrics.pages.get(pageName).push(pageData);
    this.notifyObservers('page', pageData);
  }

  /**
   * Get resource type from URL
   */
  getResourceType(url) {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('.gif') || url.includes('.svg')) return 'image';
    if (url.includes('.woff') || url.includes('.woff2') || url.includes('.ttf')) return 'font';
    return 'other';
  }

  /**
   * Add performance observer
   */
  addObserver(callback) {
    this.observers.add(callback);
  }

  /**
   * Remove performance observer
   */
  removeObserver(callback) {
    this.observers.delete(callback);
  }

  /**
   * Notify observers of performance events
   */
  notifyObservers(type, data) {
    this.observers.forEach(callback => {
      try {
        callback(type, data);
      } catch (error) {
        console.error('Performance observer error:', error);
      }
    });
  }

  /**
   * Get current performance metrics
   */
  getMetrics() {
    return {
      fps: this.getAverageFPS(),
      memory: this.getCurrentMemory(),
      network: this.getNetworkStats(),
      webVitals: this.webVitals,
      components: Object.fromEntries(this.metrics.components),
      pages: Object.fromEntries(this.metrics.pages),
      assets: Object.fromEntries(this.metrics.assets)
    };
  }

  /**
   * Get average FPS
   */
  getAverageFPS() {
    if (this.metrics.fps.length === 0) return 0;

    const sum = this.metrics.fps.reduce((acc, sample) => acc + sample.fps, 0);
    return Math.round(sum / this.metrics.fps.length);
  }

  /**
   * Get current memory usage
   */
  getCurrentMemory() {
    if (!performance.memory || this.metrics.memory.length === 0) {
      return null;
    }

    const latest = this.metrics.memory[this.metrics.memory.length - 1];
    return {
      used: latest.used,
      total: latest.total,
      limit: latest.limit,
      usedMB: latest.usedMB,
      totalMB: latest.totalMB,
      limitMB: latest.limitMB
    };
  }

  /**
   * Get network statistics
   */
  getNetworkStats() {
    const stats = {
      totalRequests: this.metrics.network.length,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      totalDataTransferred: 0
    };

    if (this.metrics.network.length === 0) return stats;

    let totalTime = 0;
    this.metrics.network.forEach(request => {
      if (request.success) {
        stats.successfulRequests++;
      } else {
        stats.failedRequests++;
      }
      totalTime += request.duration;
    });

    stats.averageResponseTime = Math.round(totalTime / this.metrics.network.length);

    return stats;
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = {
      fps: [],
      memory: [],
      network: [],
      components: new Map(),
      pages: new Map(),
      assets: new Map()
    };

    this.webVitals = {
      cls: null,
      fid: null,
      fcp: null,
      lcp: null,
      ttfb: null
    };
  }

  /**
   * Export performance data
   */
  exportData(format = 'json') {
    const data = this.getMetrics();

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        // Convert to CSV format
        return this.convertToCSV(data);
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  /**
   * Convert metrics to CSV
   */
  convertToCSV(data) {
    const rows = [];

    // FPS data
    rows.push('FPS Data');
    rows.push('Timestamp,FPS');
    data.fps.forEach(sample => {
      rows.push(`${sample.timestamp},${sample.fps}`);
    });

    // Memory data
    if (data.memory) {
      rows.push('\nMemory Data');
      rows.push('Timestamp,Used (MB),Total (MB),Limit (MB)');
      data.memory.forEach(sample => {
        rows.push(`${sample.timestamp},${sample.usedMB},${sample.totalMB},${sample.limitMB}`);
      });
    }

    return rows.join('\n');
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;

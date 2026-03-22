/**
 * Session Manager Utility
 * Handles user session tracking, persistence, and analytics for the portfolio website
 */

class SessionManager {
  constructor() {
    this.currentSession = null;
    this.sessionStartTime = null;
    this.pageViews = [];
    this.userJourney = [];
    this.deviceInfo = this.getDeviceInfo();
    this.geographicInfo = null;

    // Session configuration
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.maxSessionDuration = 8 * 60 * 60 * 1000; // 8 hours
    this.heartbeatInterval = 60 * 1000; // 1 minute

    this.initSession();
    this.startHeartbeat();
    this.trackGeographicInfo();
  }

  /**
   * Initialize or resume session
   */
  initSession() {
    const storedSession = this.getStoredSession();

    if (storedSession && this.isValidSession(storedSession)) {
      // Resume existing session
      this.currentSession = storedSession;
      this.sessionStartTime = new Date(storedSession.startTime);
      this.pageViews = storedSession.pageViews || [];
      this.userJourney = storedSession.userJourney || [];

      console.log('Resumed session:', this.currentSession.id);
    } else {
      // Create new session
      this.createNewSession();
    }

    // Update last activity
    this.updateLastActivity();
  }

  /**
   * Create a new session
   */
  createNewSession() {
    this.currentSession = {
      id: this.generateSessionId(),
      startTime: new Date().toISOString(),
      userId: this.getUserId(),
      deviceInfo: this.deviceInfo,
      userAgent: navigator.userAgent,
      referrer: document.referrer || null,
      initialUrl: window.location.href,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      javascriptEnabled: true,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1,
      touchSupport: 'ontouchstart' in window,
      platform: navigator.platform,
      doNotTrack: navigator.doNotTrack,
      pageViews: [],
      userJourney: [],
      events: [],
      performanceMetrics: {},
      featureUsage: {},
      errors: []
    };

    this.sessionStartTime = new Date();
    this.pageViews = [];
    this.userJourney = [];

    this.storeSession();
    console.log('Created new session:', this.currentSession.id);
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    const fingerprint = this.generateFingerprint();
    return `session_${timestamp}_${random}_${fingerprint}`;
  }

  /**
   * Generate browser fingerprint for session identification
   */
  generateFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Fingerprint', 2, 2);

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage,
      !!window.indexedDB,
      canvas.toDataURL()
    ].join('|');

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36);
  }

  /**
   * Get or create persistent user ID
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
   * Get device information
   */
  getDeviceInfo() {
    const ua = navigator.userAgent;
    const device = {
      isMobile: /Mobile|Android|iP(hone|od|ad)/.test(ua),
      isTablet: /Tablet|iPad/.test(ua),
      isDesktop: !/Mobile|Android|iP(hone|od|ad)|Tablet|iPad/.test(ua),
      browser: this.getBrowserInfo(),
      os: this.getOSInfo(),
      deviceType: this.getDeviceType()
    };

    return device;
  }

  /**
   * Get browser information
   */
  getBrowserInfo() {
    const ua = navigator.userAgent;

    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Opera')) return 'Opera';
    if (ua.includes('Trident') || ua.includes('MSIE')) return 'Internet Explorer';

    return 'Unknown';
  }

  /**
   * Get OS information
   */
  getOSInfo() {
    const ua = navigator.userAgent;

    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS X')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';

    return 'Unknown';
  }

  /**
   * Get device type
   */
  getDeviceType() {
    const ua = navigator.userAgent;

    if (/iPad/.test(ua)) return 'iPad';
    if (/iPhone/.test(ua)) return 'iPhone';
    if (/Android/.test(ua)) {
      if (/Mobile/.test(ua)) return 'Android Phone';
      return 'Android Tablet';
    }
    if (/Tablet/.test(ua)) return 'Tablet';

    return 'Desktop';
  }

  /**
   * Track geographic information (if available)
   */
  async trackGeographicInfo() {
    try {
      // Note: In production, you would use a proper geolocation service
      // This is a placeholder for geographic tracking
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.geographicInfo = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            };
          },
          (error) => {
            console.log('Geolocation not available:', error.message);
          },
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 300000 // 5 minutes
          }
        );
      }
    } catch (error) {
      console.log('Geographic tracking failed:', error.message);
    }
  }

  /**
   * Track page view
   */
  trackPageView(pageName, url, referrer = null, additionalData = {}) {
    const pageView = {
      timestamp: new Date().toISOString(),
      pageName,
      url,
      referrer: referrer || document.referrer,
      timeSpent: 0, // Will be calculated on next page view
      scrollDepth: 0,
      ...additionalData
    };

    // Calculate time spent on previous page
    if (this.pageViews.length > 0) {
      const previousPage = this.pageViews[this.pageViews.length - 1];
      previousPage.timeSpent = new Date(pageView.timestamp) - new Date(previousPage.timestamp);
    }

    this.pageViews.push(pageView);
    this.userJourney.push({
      type: 'page_view',
      ...pageView
    });

    this.updateSessionData();
    this.updateLastActivity();
  }

  /**
   * Track user interaction
   */
  trackInteraction(type, target, data = {}) {
    const interaction = {
      timestamp: new Date().toISOString(),
      type,
      target,
      ...data
    };

    this.userJourney.push({
      type: 'interaction',
      ...interaction
    });

    this.updateSessionData();
    this.updateLastActivity();
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(featureName, action, data = {}) {
    const featureUse = {
      timestamp: new Date().toISOString(),
      featureName,
      action,
      ...data
    };

    if (!this.currentSession.featureUsage[featureName]) {
      this.currentSession.featureUsage[featureName] = [];
    }

    this.currentSession.featureUsage[featureName].push(featureUse);

    this.userJourney.push({
      type: 'feature_usage',
      ...featureUse
    });

    this.updateSessionData();
    this.updateLastActivity();
  }

  /**
   * Track error
   */
  trackError(error, context = {}) {
    const errorData = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      ...context
    };

    this.currentSession.errors.push(errorData);
    this.updateSessionData();
  }

  /**
   * Track performance metrics
   */
  trackPerformanceMetrics(metrics) {
    this.currentSession.performanceMetrics = {
      ...this.currentSession.performanceMetrics,
      ...metrics,
      lastUpdated: new Date().toISOString()
    };

    this.updateSessionData();
  }

  /**
   * Update scroll depth for current page
   */
  updateScrollDepth(depth) {
    if (this.pageViews.length > 0) {
      this.pageViews[this.pageViews.length - 1].scrollDepth = Math.max(
        this.pageViews[this.pageViews.length - 1].scrollDepth,
        depth
      );
      this.updateSessionData();
    }
  }

  /**
   * Start heartbeat to keep session alive
   */
  startHeartbeat() {
    setInterval(() => {
      if (this.isSessionActive()) {
        this.updateLastActivity();
      }
    }, this.heartbeatInterval);
  }

  /**
   * Update last activity timestamp
   */
  updateLastActivity() {
    if (this.currentSession) {
      this.currentSession.lastActivity = new Date().toISOString();
      this.storeSession();
    }
  }

  /**
   * Check if session is still active
   */
  isSessionActive() {
    if (!this.currentSession) return false;

    const now = new Date();
    const lastActivity = new Date(this.currentSession.lastActivity);
    const sessionDuration = now - this.sessionStartTime;

    return (now - lastActivity) < this.sessionTimeout &&
           sessionDuration < this.maxSessionDuration;
  }

  /**
   * Check if stored session is valid
   */
  isValidSession(session) {
    if (!session) return false;

    const now = new Date();
    const lastActivity = new Date(session.lastActivity);
    const sessionStart = new Date(session.startTime);
    const sessionDuration = now - sessionStart;

    return (now - lastActivity) < this.sessionTimeout &&
           sessionDuration < this.maxSessionDuration;
  }

  /**
   * Update session data
   */
  updateSessionData() {
    if (this.currentSession) {
      this.currentSession.pageViews = this.pageViews;
      this.currentSession.userJourney = this.userJourney;
      this.currentSession.duration = new Date() - this.sessionStartTime;
      this.currentSession.pageViewCount = this.pageViews.length;
      this.currentSession.interactionCount = this.userJourney.filter(item => item.type === 'interaction').length;
      this.storeSession();
    }
  }

  /**
   * Store session in localStorage
   */
  storeSession() {
    try {
      localStorage.setItem('portfolio_session', JSON.stringify(this.currentSession));
    } catch (error) {
      console.warn('Failed to store session:', error);
    }
  }

  /**
   * Get stored session from localStorage
   */
  getStoredSession() {
    try {
      const stored = localStorage.getItem('portfolio_session');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to retrieve session:', error);
      return null;
    }
  }

  /**
   * End current session
   */
  endSession(reason = 'manual') {
    if (this.currentSession) {
      this.currentSession.endTime = new Date().toISOString();
      this.currentSession.endReason = reason;
      this.currentSession.totalDuration = new Date() - this.sessionStartTime;

      // Calculate final time spent on last page
      if (this.pageViews.length > 0) {
        const lastPage = this.pageViews[this.pageViews.length - 1];
        lastPage.timeSpent = new Date() - new Date(lastPage.timestamp);
      }

      this.storeSession();
      console.log('Session ended:', this.currentSession.id, reason);
    }
  }

  /**
   * Get current session data
   */
  getCurrentSession() {
    return {
      ...this.currentSession,
      duration: this.sessionStartTime ? new Date() - this.sessionStartTime : 0,
      isActive: this.isSessionActive(),
      geographicInfo: this.geographicInfo
    };
  }

  /**
   * Get session summary
   */
  getSessionSummary() {
    if (!this.currentSession) return null;

    const summary = {
      sessionId: this.currentSession.id,
      userId: this.currentSession.userId,
      startTime: this.currentSession.startTime,
      duration: this.sessionStartTime ? new Date() - this.sessionStartTime : 0,
      pageViews: this.pageViews.length,
      interactions: this.userJourney.filter(item => item.type === 'interaction').length,
      featuresUsed: Object.keys(this.currentSession.featureUsage).length,
      errors: this.currentSession.errors.length,
      deviceInfo: this.deviceInfo,
      performanceMetrics: this.currentSession.performanceMetrics
    };

    return summary;
  }

  /**
   * Export session data
   */
  exportSessionData(format = 'json') {
    const data = this.getCurrentSession();

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.convertSessionToCSV(data);
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  /**
   * Convert session data to CSV
   */
  convertSessionToCSV(data) {
    const rows = [];

    // Basic session info
    rows.push('Session Summary');
    rows.push(`Session ID,${data.id}`);
    rows.push(`User ID,${data.userId}`);
    rows.push(`Start Time,${data.startTime}`);
    rows.push(`Duration (ms),${data.duration}`);
    rows.push(`Page Views,${data.pageViews.length}`);
    rows.push(`Interactions,${data.userJourney.filter(item => item.type === 'interaction').length}`);

    // Page views
    if (data.pageViews.length > 0) {
      rows.push('\nPage Views');
      rows.push('Timestamp,Page Name,URL,Time Spent (ms),Scroll Depth');
      data.pageViews.forEach(page => {
        rows.push(`${page.timestamp},${page.pageName},${page.url},${page.timeSpent || 0},${page.scrollDepth || 0}`);
      });
    }

    return rows.join('\n');
  }

  /**
   * Clear session data
   */
  clearSession() {
    this.endSession('cleared');
    this.currentSession = null;
    this.sessionStartTime = null;
    this.pageViews = [];
    this.userJourney = [];
    localStorage.removeItem('portfolio_session');
  }

  /**
   * Get user journey
   */
  getUserJourney() {
    return [...this.userJourney];
  }

  /**
   * Get page view statistics
   */
  getPageViewStats() {
    const stats = {
      totalPages: this.pageViews.length,
      uniquePages: new Set(this.pageViews.map(pv => pv.pageName)).size,
      averageTimePerPage: 0,
      totalTimeSpent: 0,
      bounceRate: this.pageViews.length === 1 ? 100 : 0
    };

    if (this.pageViews.length > 0) {
      const pagesWithTime = this.pageViews.filter(pv => pv.timeSpent > 0);
      stats.totalTimeSpent = pagesWithTime.reduce((sum, pv) => sum + pv.timeSpent, 0);
      stats.averageTimePerPage = stats.totalTimeSpent / pagesWithTime.length;
    }

    return stats;
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

export default sessionManager;

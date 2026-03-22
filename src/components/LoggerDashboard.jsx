import React, { useState, useEffect } from 'react';
import { useLogger } from '../context/LoggerContext.jsx';
import { useDevTools } from '../context/DevToolsContext.jsx';

/**
 * Logger Dashboard Component
 * Development tool for viewing and managing logs in real-time
 */

const LoggerDashboard = () => {
  const logger = useLogger();
  const { isDevMode } = useDevTools();
  const [isVisible, setIsVisible] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filterLevel, setFilterLevel] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [maxDisplayLogs, setMaxDisplayLogs] = useState(50);

  // Update filters when they change
  useEffect(() => {
    logger.updateFilters({
      level: filterLevel || null,
      category: filterCategory || null,
      searchTerm: searchTerm || ''
    });
  }, [filterLevel, filterCategory, searchTerm]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && isVisible) {
      const logContainer = document.getElementById('logger-dashboard-logs');
      if (logContainer) {
        logContainer.scrollTop = logContainer.scrollHeight;
      }
    }
  }, [logger.logs, autoScroll, isVisible]);

  // Only show in development and when dev mode is enabled
  if (process.env.NODE_ENV !== 'development' || !isDevMode) {
    return null;
  }

  const handleExportLogs = (format) => {
    const data = logger.exportLogs(format);
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-logs-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    logger.info('Logs exported', { format, logCount: logger.logs.length }, 'system');
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      logger.clearLogs();
      logger.info('Logs cleared by user', {}, 'system');
    }
  };

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'ERROR': return '#dc3545';
      case 'WARN': return '#ffc107';
      case 'INFO': return '#007bff';
      case 'DEBUG': return '#6c757d';
      default: return '#495057';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getUniqueCategories = () => {
    const categories = new Set(logger.allLogs.map(log => log.category));
    return Array.from(categories).sort();
  };

  const getUniqueLevels = () => {
    const levels = new Set(logger.allLogs.map(log => log.level));
    return Array.from(levels).sort();
  };

  // Safe stringify function to handle circular references and DOM elements
  const safeStringify = (obj, indent = 2) => {
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
    }, indent);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => {
          const newVisibility = !isVisible;
          setIsVisible(newVisibility);
          logger.info(`Logger dashboard ${newVisibility ? 'opened' : 'closed'}`, {
            action: newVisibility ? 'show' : 'hide',
            timestamp: new Date().toISOString()
          }, 'ui');
        }}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '20px',
          zIndex: 9999,
          padding: '8px 12px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        {isVisible ? '📊 Hide Logs' : '📊 Show Logs'}
      </button>

      {/* Dashboard Panel */}
      {isVisible && (
        <div style={{
          position: 'fixed',
          bottom: '60px',
          right: '20px',
          width: '600px',
          height: '400px',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          borderRadius: '8px',
          zIndex: 9998,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {/* Header */}
          <div style={{
            padding: '12px',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '14px' }}>Logger Dashboard</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleExportLogs('json')}
                style={{ padding: '4px 8px', fontSize: '11px' }}
              >
                Export JSON
              </button>
              <button
                onClick={() => handleExportLogs('csv')}
                style={{ padding: '4px 8px', fontSize: '11px' }}
              >
                Export CSV
              </button>
              <button
                onClick={handleClearLogs}
                style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#dc3545' }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Controls */}
          <div style={{
            padding: '8px 12px',
            borderBottom: '1px solid #333',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <label>
              Level:
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                style={{ marginLeft: '4px', fontSize: '11px' }}
              >
                <option value="">All</option>
                {getUniqueLevels().map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </label>

            <label>
              Category:
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ marginLeft: '4px', fontSize: '11px' }}
              >
                <option value="">All</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>

            <label>
              Search:
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logs..."
                style={{ marginLeft: '4px', fontSize: '11px', width: '100px' }}
              />
            </label>

            <label>
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
              />
              Auto-scroll
            </label>

            <span style={{ color: '#6c757d' }}>
              {logger.logs.length} logs ({logger.allLogs.length} total)
            </span>
          </div>

          {/* Session Info */}
          <div style={{
            padding: '4px 12px',
            backgroundColor: '#333',
            fontSize: '11px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>Session: {logger.logger.getSessionInfo().sessionId.slice(-8)}</span>
            <span>FPS: {logger.logger.performanceData.fps.length > 0 ?
              Math.round(logger.logger.performanceData.fps[logger.logger.performanceData.fps.length - 1]?.fps || 0) : 'N/A'}</span>
            <span>Memory: {logger.logger.performanceData.memory.length > 0 ?
              `${Math.round((logger.logger.performanceData.memory[logger.logger.performanceData.memory.length - 1]?.usedMB || 0))}MB` : 'N/A'}</span>
          </div>

          {/* Logs Container */}
          <div
            id="logger-dashboard-logs"
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '8px',
              fontSize: '11px',
              lineHeight: '1.4'
            }}
          >
            {logger.logs.slice(-maxDisplayLogs).map((log, index) => (
              <div
                key={`${log.timestamp}-${index}`}
                style={{
                  marginBottom: '4px',
                  padding: '4px',
                  backgroundColor: index % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'transparent',
                  borderRadius: '2px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#6c757d', minWidth: '60px' }}>
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span
                    style={{
                      color: getLogLevelColor(log.level),
                      fontWeight: 'bold',
                      minWidth: '50px'
                    }}
                  >
                    {log.level}
                  </span>
                  <span style={{ color: '#17a2b8', minWidth: '80px' }}>
                    {log.category.toUpperCase()}
                  </span>
                  <span style={{ flex: 1, wordBreak: 'break-word' }}>
                    {log.message}
                  </span>
                </div>
                {log.data && Object.keys(log.data).length > 0 && (
                  <details style={{ marginTop: '4px' }}>
                    <summary style={{ cursor: 'pointer', color: '#6c757d', fontSize: '10px' }}>
                      Data ({Object.keys(log.data).length} keys)
                    </summary>
                    <pre style={{
                      margin: '4px 0 0 0',
                      fontSize: '10px',
                      color: '#adb5bd',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      padding: '4px',
                      borderRadius: '2px',
                      overflow: 'auto',
                      maxHeight: '100px'
                    }}>
                      {safeStringify(log.data, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
            {logger.logs.length === 0 && (
              <div style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>
                No logs to display
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LoggerDashboard;

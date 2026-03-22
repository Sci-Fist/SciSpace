import React from 'react';
import { usePage } from '../../context/PageContext.jsx';

function SlideshowControls() {
  const { getPageControls, updatePageControl } = usePage();
  const controls = getPageControls(window.location.pathname) || {};

  const transitionTypes = [
    { value: 'fade', label: 'Fade' },
    { value: 'slide', label: 'Slide' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'instant', label: 'Instant' }
  ];

  return (
    <div className="page-controls">
      <h4>Slideshow Controls</h4>

      <div className="control-group">
        <label>
          Slideshow Speed (seconds):
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={controls.slideshowSpeed || 3}
            onChange={(e) => updatePageControl(window.location.pathname, 'slideshowSpeed', parseFloat(e.target.value))}
          />
          <span>{controls.slideshowSpeed || 3}s</span>
        </label>
      </div>

      <div className="control-group">
        <label>
          Transition Type:
          <select
            value={controls.slideshowTransition || 'fade'}
            onChange={(e) => updatePageControl(window.location.pathname, 'slideshowTransition', e.target.value)}
            style={{
              width: '100%',
              padding: 'variables.$spacing-xs',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid rgba(var(--color-primary-rgb), 0.3)',
              borderRadius: 'variables.$border-radius-sm',
              color: 'var(--color-text)',
              fontSize: 'variables.$font-size-small'
            }}
          >
            {transitionTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="control-group">
        <label>
          Transition Duration (seconds):
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={controls.slideshowTransitionDuration || 0.5}
            onChange={(e) => updatePageControl(window.location.pathname, 'slideshowTransitionDuration', parseFloat(e.target.value))}
          />
          <span>{controls.slideshowTransitionDuration || 0.5}s</span>
        </label>
      </div>

      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={controls.slideshowAutoPlay !== false}
            onChange={(e) => updatePageControl(window.location.pathname, 'slideshowAutoPlay', e.target.checked)}
          />
          Auto-play Slideshow
        </label>
      </div>

      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={controls.slideshowLoop !== false}
            onChange={(e) => updatePageControl(window.location.pathname, 'slideshowLoop', e.target.checked)}
          />
          Loop Slideshow
        </label>
      </div>

      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={controls.slideshowShuffle || false}
            onChange={(e) => updatePageControl(window.location.pathname, 'slideshowShuffle', e.target.checked)}
          />
          Shuffle Mode
        </label>
      </div>

      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={controls.slideshowShowThumbnails !== false}
            onChange={(e) => updatePageControl(window.location.pathname, 'slideshowShowThumbnails', e.target.checked)}
          />
          Show Thumbnails
        </label>
      </div>

      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={controls.slideshowShowControls !== false}
            onChange={(e) => updatePageControl(window.location.pathname, 'slideshowShowControls', e.target.checked)}
          />
          Show Control Buttons
        </label>
      </div>
    </div>
  );
}

export default SlideshowControls;

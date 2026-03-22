import React from 'react';
import { usePage } from '../../context/PageContext.jsx';

function TwoDArtPageControls() {
  const { getPageControls, updatePageControl } = usePage();
  const controls = getPageControls('/2d-art');

  return (
    <div className="page-controls">
      <h4>2D Art Portfolio Controls</h4>

      {/* Layout Settings */}
      <div className="control-section">
        <h5>Layout Settings</h5>

        <div className="control-group">
          <label>Default Layout:</label>
          <select
            value={controls.layout || 'grid'}
            onChange={(e) => updatePageControl('/2d-art', 'layout', e.target.value)}
          >
            <option value="grid">Grid</option>
            <option value="masonry">Masonry</option>
            <option value="list">List</option>
          </select>
        </div>

        <div className="control-group">
          <label>Grid Columns: {controls.gridColumns || 4}</label>
          <input
            type="range"
            min="1"
            max="6"
            step="1"
            value={controls.gridColumns || 4}
            onChange={(e) => updatePageControl('/2d-art', 'gridColumns', parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Item Spacing: {controls.itemSpacing || 20}px</label>
          <input
            type="range"
            min="10"
            max="50"
            step="5"
            value={controls.itemSpacing || 20}
            onChange={(e) => updatePageControl('/2d-art', 'itemSpacing', parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Image Settings */}
      <div className="control-section">
        <h5>Image Settings</h5>

        <div className="control-group">
          <label>Aspect Ratio:</label>
          <select
            value={controls.aspectRatio || 'square'}
            onChange={(e) => updatePageControl('/2d-art', 'aspectRatio', e.target.value)}
          >
            <option value="square">Square (1:1)</option>
            <option value="portrait">Portrait (3:4)</option>
            <option value="landscape">Landscape (4:3)</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div className="control-group">
          <label>Border Radius: {controls.borderRadius || 10}px</label>
          <input
            type="range"
            min="0"
            max="25"
            step="5"
            value={controls.borderRadius || 10}
            onChange={(e) => updatePageControl('/2d-art', 'borderRadius', parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Image Scale: {controls.imageScale || 1}</label>
          <input
            type="range"
            min="0.8"
            max="1.2"
            step="0.1"
            value={controls.imageScale || 1}
            onChange={(e) => updatePageControl('/2d-art', 'imageScale', parseFloat(e.target.value))}
          />
        </div>
      </div>

      {/* Animation Settings */}
      <div className="control-section">
        <h5>Animation Settings</h5>

        <div className="control-group">
          <label>Hover Zoom: {controls.hoverZoom || 1.1}</label>
          <input
            type="range"
            min="1"
            max="1.3"
            step="0.05"
            value={controls.hoverZoom || 1.1}
            onChange={(e) => updatePageControl('/2d-art', 'hoverZoom', parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Hover Scale: {controls.hoverScale || 1.02}</label>
          <input
            type="range"
            min="1"
            max="1.1"
            step="0.01"
            value={controls.hoverScale || 1.02}
            onChange={(e) => updatePageControl('/2d-art', 'hoverScale', parseFloat(e.target.value))}
          />
        </div>
      </div>

      {/* Display Options */}
      <div className="control-section">
        <h5>Display Options</h5>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.showTitles !== false}
              onChange={(e) => updatePageControl('/2d-art', 'showTitles', e.target.checked)}
            />
            Show Artwork Titles
          </label>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.enableLightbox !== false}
              onChange={(e) => updatePageControl('/2d-art', 'enableLightbox', e.target.checked)}
            />
            Enable Lightbox View
          </label>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.enableHover !== false}
              onChange={(e) => updatePageControl('/2d-art', 'enableHover', e.target.checked)}
            />
            Enable Hover Effects
          </label>
        </div>
      </div>

      {/* Background Settings */}
      <div className="control-section">
        <h5>Background Settings</h5>

        <div className="control-group">
          <label>Background Opacity: {controls.backgroundOpacity || 0}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.backgroundOpacity || 0}
            onChange={(e) => updatePageControl('/2d-art', 'backgroundOpacity', parseFloat(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}

export default TwoDArtPageControls;

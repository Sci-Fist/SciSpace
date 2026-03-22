import React from 'react';
import { usePage } from '../../context/PageContext.jsx';

function GenericPageControls({ pagePath, pageName }) {
  const { getPageControls, updatePageControl } = usePage();
  const controls = getPageControls(pagePath);

  return (
    <div className="page-controls">
      <h4>{pageName} Page Controls</h4>

      <div className="control-group">
        <label>
          Content Opacity:
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.contentOpacity || 1}
            onChange={(e) => updatePageControl(pagePath, 'contentOpacity', parseFloat(e.target.value))}
          />
          <span>{controls.contentOpacity || 1}</span>
        </label>
      </div>

      <div className="control-group">
        <label>
          Title Font Size:
          <input
            type="range"
            min="1.5"
            max="3"
            step="0.1"
            value={controls.titleSize || 2}
            onChange={(e) => updatePageControl(pagePath, 'titleSize', parseFloat(e.target.value))}
          />
          <span>{controls.titleSize || 2}rem</span>
        </label>
      </div>

      <div className="control-group">
        <label>
          Content Width:
          <input
            type="range"
            min="60"
            max="100"
            step="5"
            value={controls.contentWidth || 80}
            onChange={(e) => updatePageControl(pagePath, 'contentWidth', parseInt(e.target.value))}
          />
          <span>{controls.contentWidth || 80}%</span>
        </label>
      </div>

      <div className="control-group">
        <label>
          Line Height:
          <input
            type="range"
            min="1.2"
            max="2"
            step="0.1"
            value={controls.lineHeight || 1.6}
            onChange={(e) => updatePageControl(pagePath, 'lineHeight', parseFloat(e.target.value))}
          />
          <span>{controls.lineHeight || 1.6}</span>
        </label>
      </div>

      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={controls.showAnimations || true}
            onChange={(e) => updatePageControl(pagePath, 'showAnimations', e.target.checked)}
          />
          Enable Page Animations
        </label>
      </div>

      <div className="control-group">
        <label>
          Background Pattern:
          <select
            value={controls.backgroundPattern || 'none'}
            onChange={(e) => updatePageControl(pagePath, 'backgroundPattern', e.target.value)}
          >
            <option value="none">None</option>
            <option value="dots">Dots</option>
            <option value="grid">Grid</option>
            <option value="diagonal">Diagonal Lines</option>
          </select>
        </label>
      </div>


    </div>
  );
}

export default GenericPageControls;

import React from 'react';
import { usePage } from '../../context/PageContext.jsx';

function MusicPageControls() {
  const { getPageControls, updatePageControl } = usePage();
  const controls = getPageControls('/music');

  return (
    <div className="page-controls">
      <h4>Music Page Controls</h4>

      <div className="control-group">
        <label>
          Page Title Opacity:
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.titleOpacity || 1}
            onChange={(e) => updatePageControl('/music', 'titleOpacity', parseFloat(e.target.value))}
          />
          <span>{controls.titleOpacity || 1}</span>
        </label>
      </div>

      <div className="control-group">
        <label>
          Description Opacity:
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.descriptionOpacity || 1}
            onChange={(e) => updatePageControl('/music', 'descriptionOpacity', parseFloat(e.target.value))}
          />
          <span>{controls.descriptionOpacity || 1}</span>
        </label>
      </div>

      <div className="control-group">
        <label>
          Audio Player Size:
          <input
            type="range"
            min="0.8"
            max="1.5"
            step="0.1"
            value={controls.audioSize || 1}
            onChange={(e) => updatePageControl('/music', 'audioSize', parseFloat(e.target.value))}
          />
          <span>{controls.audioSize || 1}</span>
        </label>
      </div>

      <div className="control-group">
        <label>
          Track Spacing:
          <input
            type="range"
            min="10"
            max="50"
            step="5"
            value={controls.trackSpacing || 20}
            onChange={(e) => updatePageControl('/music', 'trackSpacing', parseInt(e.target.value))}
          />
          <span>{controls.trackSpacing || 20}px</span>
        </label>
      </div>

      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={controls.showGenres || true}
            onChange={(e) => updatePageControl('/music', 'showGenres', e.target.checked)}
          />
          Show Track Genres
        </label>
      </div>

      <div className="control-group">
        <label>
          Background Music Volume:
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.backgroundVolume || 0.3}
            onChange={(e) => updatePageControl('/music', 'backgroundVolume', parseFloat(e.target.value))}
          />
          <span>{Math.round((controls.backgroundVolume || 0.3) * 100)}%</span>
        </label>
      </div>
    </div>
  );
}

export default MusicPageControls;

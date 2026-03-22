import React from 'react';
import { usePage } from '../../context/PageContext.jsx';
import { useContent } from '../../context/ContentContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

function GlobalControls() {
  const { getPageControls, updatePageControl } = usePage();
  const { getCategoryFiles, selectImage, getSelectedImage } = useContent();
  const { theme } = useTheme();
  const controls = getPageControls('global') || {};

  // Get available background images
  const backgroundImages = getCategoryFiles('/', 'Background Images');
  const selectedBackgroundImage = getSelectedImage('/', 'Background Images');

  return (
    <div className="page-controls">
      <h4>Global Site Controls</h4>

      {/* Background Image Controls */}
      <div className="control-section">
        <h4>Global Background</h4>

        <div className="control-group">
          <label>Background Image:</label>
          <select
            value={selectedBackgroundImage?.id || ''}
            onChange={(e) => {
              const imageId = e.target.value;
              if (imageId) {
                selectImage('/', 'Background Images', imageId);
              }
            }}
          >
            <option value="">None</option>
            {backgroundImages.map(image => (
              <option key={image.id} value={image.id}>
                {image.name}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Background Opacity:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.backgroundImageOpacity || 1}
            onChange={(e) => updatePageControl('global', 'backgroundImageOpacity', parseFloat(e.target.value))}
          />
          <span>{controls.backgroundImageOpacity || 1}</span>
        </div>

        <div className="control-group">
          <label>Background Size:</label>
          <select
            value={controls.backgroundSize || 'cover'}
            onChange={(e) => updatePageControl('global', 'backgroundSize', e.target.value)}
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div className="control-group">
          <label>Background Position:</label>
          <select
            value={controls.backgroundPosition || 'center'}
            onChange={(e) => updatePageControl('global', 'backgroundPosition', e.target.value)}
          >
            <option value="center">Center</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="top left">Top Left</option>
            <option value="top right">Top Right</option>
            <option value="bottom left">Bottom Left</option>
            <option value="bottom right">Bottom Right</option>
          </select>
        </div>

        <div className="control-group">
          <label>Background Repeat:</label>
          <select
            value={controls.backgroundRepeat || 'no-repeat'}
            onChange={(e) => updatePageControl('global', 'backgroundRepeat', e.target.value)}
          >
            <option value="no-repeat">No Repeat</option>
            <option value="repeat">Repeat</option>
            <option value="repeat-x">Repeat X</option>
            <option value="repeat-y">Repeat Y</option>
          </select>
        </div>

        <div className="control-group">
          <label>Background Attachment:</label>
          <select
            value={controls.backgroundAttachment || 'fixed'}
            onChange={(e) => updatePageControl('global', 'backgroundAttachment', e.target.value)}
          >
            <option value="fixed">Fixed</option>
            <option value="scroll">Scroll</option>
          </select>
        </div>

        <div className="control-group">
          <label>Background Blur:</label>
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            value={controls.backgroundImageBlur || 0}
            onChange={(e) => updatePageControl('global', 'backgroundImageBlur', parseInt(e.target.value))}
          />
          <span>{controls.backgroundImageBlur || 0}px</span>
        </div>
      </div>

      {/* Global Typography Controls */}
      <div className="control-group">
        <label>
          Base Font Size:
          <input
            type="range"
            min="14"
            max="20"
            step="1"
            value={controls.baseFontSize || 16}
            onChange={(e) => updatePageControl('global', 'baseFontSize', parseInt(e.target.value))}
          />
          <span>{controls.baseFontSize || 16}px</span>
        </label>
      </div>

      <div className="control-group">
        <label>
          Heading Font Size Scale:
          <input
            type="range"
            min="0.8"
            max="1.5"
            step="0.1"
            value={controls.headingFontScale || 1}
            onChange={(e) => updatePageControl('global', 'headingFontScale', parseFloat(e.target.value))}
          />
          <span>{controls.headingFontScale || 1}</span>
        </label>
      </div>

      {/* Global Animation Controls */}
      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={controls.enableGlobalAnimations !== false}
            onChange={(e) => updatePageControl('global', 'enableGlobalAnimations', e.target.checked)}
          />
          Enable Global Animations
        </label>
      </div>

      <div className="control-group">
        <label>
          Animation Speed:
          <select
            value={controls.animationSpeed || 'normal'}
            onChange={(e) => updatePageControl('global', 'animationSpeed', e.target.value)}
          >
            <option value="slow">Slow</option>
            <option value="normal">Normal</option>
            <option value="fast">Fast</option>
          </select>
        </label>
      </div>

      {/* Global Layout Controls */}
      <div className="control-group">
        <label>
          Global Spacing Scale:
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={controls.globalSpacingScale || 1}
            onChange={(e) => updatePageControl('global', 'globalSpacingScale', parseFloat(e.target.value))}
          />
          <span>{controls.globalSpacingScale || 1}</span>
        </label>
      </div>

      <div className="control-group">
        <label>
          Content Max Width:
          <input
            type="range"
            min="800"
            max="1400"
            step="50"
            value={controls.contentMaxWidth || 1200}
            onChange={(e) => updatePageControl('global', 'contentMaxWidth', parseInt(e.target.value))}
          />
          <span>{controls.contentMaxWidth || 1200}px</span>
        </label>
      </div>

      {/* Color Customization Controls */}
      <div className="control-group">
        <label>
          Primary Color Hue:
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={controls.primaryColorHue || 180}
            onChange={(e) => updatePageControl('global', 'primaryColorHue', parseInt(e.target.value))}
          />
          <span>{controls.primaryColorHue || 180}°</span>
        </label>
      </div>

      <div className="control-group">
        <label>
          Primary Color Saturation:
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={controls.primaryColorSaturation || 100}
            onChange={(e) => updatePageControl('global', 'primaryColorSaturation', parseInt(e.target.value))}
          />
          <span>{controls.primaryColorSaturation || 100}%</span>
        </label>
      </div>

      <div className="control-group">
        <label>
          Primary Color Lightness:
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={controls.primaryColorLightness || 50}
            onChange={(e) => updatePageControl('global', 'primaryColorLightness', parseInt(e.target.value))}
          />
          <span>{controls.primaryColorLightness || 50}%</span>
        </label>
      </div>

      {/* Acrylic Effect Controls */}
      <div className="control-group">
        <label>
          Acrylic Blur Strength:
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            value={controls.acrylicBlurStrength || 10}
            onChange={(e) => updatePageControl('global', 'acrylicBlurStrength', parseInt(e.target.value))}
          />
          <span>{controls.acrylicBlurStrength || 10}px</span>
        </label>
      </div>

      <div className="control-group">
        <label>
          Acrylic Opacity:
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.acrylicOpacity || 0.7}
            onChange={(e) => updatePageControl('global', 'acrylicOpacity', parseFloat(e.target.value))}
          />
          <span>{controls.acrylicOpacity || 0.7}</span>
        </label>
      </div>
    </div>
  );
}

export default GlobalControls;

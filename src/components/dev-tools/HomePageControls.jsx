import React from 'react';
import { usePage } from '../../context/PageContext.jsx';
import { useContent } from '../../context/ContentContext.jsx';
import TextEditor from './TextEditor.jsx';
import '../../styles/components/_pageControls.scss';

function HomePageControls() {
  const { getPageControls, updatePageControl } = usePage();
  const { getCategoryFiles, selectImage, getSelectedImage } = useContent();
  const controls = getPageControls('/');

  // Get available background images
  const backgroundImages = getCategoryFiles('/', 'Background Images');
  const selectedBackgroundImage = getSelectedImage('/', 'Background Images');

  return (
    <div className="page-controls home-page-controls">
      <h3>Home Page Controls</h3>

      {/* Text Content Section */}
      <div className="control-section">
        <h4>Text Content</h4>

        <TextEditor
          contentKey="home.welcomeText"
          label="Welcome Text"
          placeholder="Welcome"
        />

        <TextEditor
          contentKey="home.descriptionText"
          label="Description"
          placeholder="Showcasing a blend of digital art and sonic landscapes."
          multiline={true}
        />

        <TextEditor
          contentKey="home.artButtonText"
          label="Art Button Text"
          placeholder="Explore 3D Art"
        />

        <TextEditor
          contentKey="home.musicButtonText"
          label="Music Button Text"
          placeholder="Listen to Music"
        />
      </div>

      {/* Background Image Controls */}
      <div className="control-section">
        <h4>Background Image</h4>

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
            <option value="">None (use default)</option>
            {backgroundImages.map(image => (
              <option key={image.id} value={image.id}>
                {image.name}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Background Opacity: {controls.backgroundOpacity || 1}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.backgroundOpacity || 1}
            onChange={(e) => updatePageControl('/', 'backgroundOpacity', parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Background Blur: {controls.backgroundBlur || 0}px</label>
          <input
            type="range"
            min="0"
            max="20"
            value={controls.backgroundBlur || 0}
            onChange={(e) => updatePageControl('/', 'backgroundBlur', parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Hero Visual Controls */}
      <div className="control-section">
        <h4>Hero Visual</h4>

        <div className="control-group">
          <label>Scale: {controls.heroScale || 1}</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={controls.heroScale || 1}
            onChange={(e) => updatePageControl('/', 'heroScale', parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Blur: {controls.heroBlur || 0}px</label>
          <input
            type="range"
            min="0"
            max="10"
            value={controls.heroBlur || 0}
            onChange={(e) => updatePageControl('/', 'heroBlur', parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Glow Intensity: {controls.heroGlowIntensity || 0}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={controls.heroGlowIntensity || 0}
            onChange={(e) => updatePageControl('/', 'heroGlowIntensity', parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Glow Color:</label>
          <input
            type="color"
            value={controls.heroGlowColor || '#00e6e6'}
            onChange={(e) => updatePageControl('/', 'heroGlowColor', e.target.value)}
          />
        </div>
      </div>

      {/* Hero Content */}
      <div className="control-section">
        <h4>Hero Content</h4>

        <div className="control-group">
          <label>Content Background Opacity: {controls.contentOpacity || 0.7}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.contentOpacity || 0.7}
            onChange={(e) => updatePageControl('/', 'contentOpacity', parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Welcome Text Opacity: {controls.welcomeOpacity || 1}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.welcomeOpacity || 1}
            onChange={(e) => updatePageControl('/', 'welcomeOpacity', parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.showDescription !== false}
              onChange={(e) => updatePageControl('/', 'showDescription', e.target.checked)}
            />
            Show Description
          </label>
        </div>

        <div className="control-group">
          <label>Description Text Opacity: {controls.descriptionOpacity || 1}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.descriptionOpacity || 1}
            onChange={(e) => updatePageControl('/', 'descriptionOpacity', parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Call-to-Action Button Size: {controls.buttonSize || 1}</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={controls.buttonSize || 1}
            onChange={(e) => updatePageControl('/', 'buttonSize', parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>"Explore 3D Art" Button Opacity: {controls.artButtonOpacity || 1}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.artButtonOpacity || 1}
            onChange={(e) => updatePageControl('/', 'artButtonOpacity', parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>"Listen to Music" Button Opacity: {controls.musicButtonOpacity || 1}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.musicButtonOpacity || 1}
            onChange={(e) => updatePageControl('/', 'musicButtonOpacity', parseFloat(e.target.value))}
          />
        </div>
      </div>

      {/* Slideshow Settings */}
      <div className="control-section">
        <h4>Slideshow Settings</h4>

        <div className="control-group">
          <label>Speed: {controls.slideshowSpeed || 3}s</label>
          <input
            type="range"
            min="1"
            max="10"
            value={controls.slideshowSpeed || 3}
            onChange={(e) => updatePageControl('/', 'slideshowSpeed', parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Transition Type:</label>
          <select
            value={controls.slideshowTransition || 'fade'}
            onChange={(e) => updatePageControl('/', 'slideshowTransition', e.target.value)}
          >
            <option value="fade">Fade</option>
            <option value="slide">Slide</option>
            <option value="zoom">Zoom</option>
          </select>
        </div>

        <div className="control-group">
          <label>Transition Duration: {controls.slideshowTransitionDuration || 0.5}s</label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={controls.slideshowTransitionDuration || 0.5}
            onChange={(e) => updatePageControl('/', 'slideshowTransitionDuration', parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.slideshowAutoPlay !== false}
              onChange={(e) => updatePageControl('/', 'slideshowAutoPlay', e.target.checked)}
            />
            Auto Play
          </label>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.slideshowLoop !== false}
              onChange={(e) => updatePageControl('/', 'slideshowLoop', e.target.checked)}
            />
            Loop
          </label>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.slideshowShuffle || false}
              onChange={(e) => updatePageControl('/', 'slideshowShuffle', e.target.checked)}
            />
            Shuffle
          </label>
        </div>
      </div>
    </div>
  );
}

export default HomePageControls;

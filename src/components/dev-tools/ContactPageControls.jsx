import React from 'react';
import { usePage } from '../../context/PageContext.jsx';
import { useContent } from '../../context/ContentContext.jsx';
import TextEditor from './TextEditor.jsx';
import '../../styles/components/_pageControls.scss';

function ContactPageControls() {
  const { getPageControls, updatePageControl } = usePage();
  const { getCategoryFiles, getSelectedImage } = useContent();
  const controls = getPageControls('/contact');

  return (
    <div className="page-controls contact-page-controls">
      <h3>Contact Page Controls</h3>

      {/* Text Content Section */}
      <div className="control-section">
        <h4>Text Content</h4>

        <TextEditor
          contentKey="contact.titleText"
          label="Page Title"
          placeholder="Get in Touch"
        />

        <TextEditor
          contentKey="contact.descriptionText"
          label="Description"
          placeholder="I'd love to hear from you! Whether you have a project in mind, a collaboration idea, or just want to say hello, feel free to reach out using the form below or connect with me on social media."
          multiline={true}
        />

        <TextEditor
          contentKey="contact.socialTitleText"
          label="Social Section Title"
          placeholder="Connect with me:"
        />

        <TextEditor
          contentKey="contact.emailText"
          label="Email Link Text"
          placeholder="contact@sci-fist.com"
        />

        <TextEditor
          contentKey="contact.submitButtonText"
          label="Submit Button Text"
          placeholder="Send Message"
        />
      </div>

      {/* Background Pattern Section */}
      <div className="control-section">
        <h4>Background Pattern</h4>

        <div className="control-group">
          <label>Pattern Type:</label>
          <select
            value={controls.backgroundPattern || 'none'}
            onChange={(e) => updatePageControl('/contact', 'backgroundPattern', e.target.value)}
          >
            <option value="none">None</option>
            <option value="dots">Dots</option>
            <option value="grid">Grid</option>
            <option value="diagonal">Diagonal</option>
            <option value="waves">Waves</option>
            <option value="circuit">Circuit</option>
          </select>
        </div>

        <div className="control-group">
          <label>Pattern Opacity: {controls.backgroundPatternOpacity || 0.1}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.backgroundPatternOpacity || 0.1}
            onChange={(e) => updatePageControl('/contact', 'backgroundPatternOpacity', parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Pattern Color:</label>
          <input
            type="color"
            value={controls.backgroundPatternColor || '#00e6e6'}
            onChange={(e) => updatePageControl('/contact', 'backgroundPatternColor', e.target.value)}
          />
        </div>
      </div>

      {/* Content Styling Section */}
      <div className="control-section">
        <h4>Content Styling</h4>

        <div className="control-group">
          <label>Content Opacity: {controls.contentOpacity || 1}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.contentOpacity || 1}
            onChange={(e) => updatePageControl('/contact', 'contentOpacity', parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Content Width: {controls.contentWidth || 80}%</label>
          <input
            type="range"
            min="60"
            max="100"
            step="5"
            value={controls.contentWidth || 80}
            onChange={(e) => updatePageControl('/contact', 'contentWidth', parseInt(e.target.value))}
          />
        </div>



        <div className="control-group">
          <label>Line Height: {controls.lineHeight || 1.6}</label>
          <input
            type="range"
            min="1.2"
            max="2"
            step="0.1"
            value={controls.lineHeight || 1.6}
            onChange={(e) => updatePageControl('/contact', 'lineHeight', parseFloat(e.target.value))}
          />
        </div>
      </div>

      {/* Animations Section */}
      <div className="control-section">
        <h4>Animations</h4>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.showAnimations !== false}
              onChange={(e) => updatePageControl('/contact', 'showAnimations', e.target.checked)}
            />
            Show Animations
          </label>
        </div>

        <div className="control-group">
          <label>Animation Delay: {controls.animationDelay || 0}s</label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={controls.animationDelay || 0}
            onChange={(e) => updatePageControl('/contact', 'animationDelay', parseFloat(e.target.value))}
          />
        </div>
      </div>

      {/* Title Styling Section */}
      <div className="control-section">
        <h4>Title Styling</h4>

        <div className="control-group">
          <label>Title Font Size: {controls.titleSize || 2}rem</label>
          <input
            type="range"
            min="1.5"
            max="3"
            step="0.1"
            value={controls.titleSize || 2}
            onChange={(e) => updatePageControl('/contact', 'titleSize', parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Title Opacity: {controls.titleOpacity || 1}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.titleOpacity || 1}
            onChange={(e) => updatePageControl('/contact', 'titleOpacity', parseFloat(e.target.value))}
          />
        </div>
      </div>

      {/* Form Styling Section */}
      <div className="control-section">
        <h4>Form Styling</h4>

        <div className="control-group">
          <label>Form Background Opacity: {controls.formOpacity || 0.9}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.formOpacity || 0.9}
            onChange={(e) => updatePageControl('/contact', 'formOpacity', parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Form Border Radius: {controls.formBorderRadius || 12}px</label>
          <input
            type="range"
            min="0"
            max="20"
            step="2"
            value={controls.formBorderRadius || 12}
            onChange={(e) => updatePageControl('/contact', 'formBorderRadius', parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Form Padding: {controls.formPadding || 30}px</label>
          <input
            type="range"
            min="15"
            max="50"
            step="5"
            value={controls.formPadding || 30}
            onChange={(e) => updatePageControl('/contact', 'formPadding', parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Form Shadow Intensity: {controls.formShadow || 0.2}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.formShadow || 0.2}
            onChange={(e) => updatePageControl('/contact', 'formShadow', parseFloat(e.target.value))}
          />
        </div>
      </div>

      {/* Input Field Styling Section */}
      <div className="control-section">
        <h4>Input Field Styling</h4>

        <div className="control-group">
          <label>Input Field Height: {controls.inputHeight || 45}px</label>
          <input
            type="range"
            min="30"
            max="60"
            step="5"
            value={controls.inputHeight || 45}
            onChange={(e) => updatePageControl('/contact', 'inputHeight', parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Input Border Radius: {controls.inputBorderRadius || 6}px</label>
          <input
            type="range"
            min="0"
            max="15"
            step="1"
            value={controls.inputBorderRadius || 6}
            onChange={(e) => updatePageControl('/contact', 'inputBorderRadius', parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Label Font Size: {controls.labelSize || 14}px</label>
          <input
            type="range"
            min="12"
            max="18"
            step="1"
            value={controls.labelSize || 14}
            onChange={(e) => updatePageControl('/contact', 'labelSize', parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Textarea Rows: {controls.textareaRows || 6}</label>
          <input
            type="range"
            min="4"
            max="10"
            step="1"
            value={controls.textareaRows || 6}
            onChange={(e) => updatePageControl('/contact', 'textareaRows', parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.showPlaceholders !== false}
              onChange={(e) => updatePageControl('/contact', 'showPlaceholders', e.target.checked)}
            />
            Show Input Placeholders
          </label>
        </div>
      </div>

      {/* Button Styling Section */}
      <div className="control-section">
        <h4>Button Styling</h4>

        <div className="control-group">
          <label>Submit Button Size: {controls.buttonSize || 1}</label>
          <input
            type="range"
            min="0.8"
            max="1.4"
            step="0.1"
            value={controls.buttonSize || 1}
            onChange={(e) => updatePageControl('/contact', 'buttonSize', parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Button Border Radius: {controls.buttonBorderRadius || 6}px</label>
          <input
            type="range"
            min="0"
            max="15"
            step="1"
            value={controls.buttonBorderRadius || 6}
            onChange={(e) => updatePageControl('/contact', 'buttonBorderRadius', parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Button Hover Effect: {controls.buttonHoverScale || 1.05}</label>
          <input
            type="range"
            min="1"
            max="1.2"
            step="0.05"
            value={controls.buttonHoverScale || 1.05}
            onChange={(e) => updatePageControl('/contact', 'buttonHoverScale', parseFloat(e.target.value))}
          />
        </div>
      </div>

      {/* Form Behavior Section */}
      <div className="control-section">
        <h4>Form Behavior</h4>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.enableValidation !== false}
              onChange={(e) => updatePageControl('/contact', 'enableValidation', e.target.checked)}
            />
            Enable Form Validation
          </label>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.showSuccessMessage !== false}
              onChange={(e) => updatePageControl('/contact', 'showSuccessMessage', e.target.checked)}
            />
            Show Success Message
          </label>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.clearFormOnSubmit !== false}
              onChange={(e) => updatePageControl('/contact', 'clearFormOnSubmit', e.target.checked)}
            />
            Clear Form on Submit
          </label>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="control-section">
        <h4>Social Media Links</h4>

        <TextEditor
          contentKey="contact.artstationUrl"
          label="ArtStation URL"
          placeholder="https://artstation.com/yourprofile"
        />

        <TextEditor
          contentKey="contact.soundcloudUrl"
          label="SoundCloud URL"
          placeholder="https://soundcloud.com/yourprofile"
        />

        <TextEditor
          contentKey="contact.linkedinUrl"
          label="LinkedIn URL"
          placeholder="https://linkedin.com/in/yourprofile"
        />

        <TextEditor
          contentKey="contact.artstationText"
          label="ArtStation Link Text"
          placeholder="ArtStation"
        />

        <TextEditor
          contentKey="contact.soundcloudText"
          label="SoundCloud Link Text"
          placeholder="SoundCloud"
        />

        <TextEditor
          contentKey="contact.linkedinText"
          label="LinkedIn Link Text"
          placeholder="LinkedIn"
        />

        <div className="control-group">
          <label>Social Links Spacing: {controls.socialSpacing || 15}px</label>
          <input
            type="range"
            min="10"
            max="30"
            step="5"
            value={controls.socialSpacing || 15}
            onChange={(e) => updatePageControl('/contact', 'socialSpacing', parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.showArtstation !== false}
              onChange={(e) => updatePageControl('/contact', 'showArtstation', e.target.checked)}
            />
            Show ArtStation Link
          </label>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.showSoundcloud !== false}
              onChange={(e) => updatePageControl('/contact', 'showSoundcloud', e.target.checked)}
            />
            Show SoundCloud Link
          </label>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.showLinkedin !== false}
              onChange={(e) => updatePageControl('/contact', 'showLinkedin', e.target.checked)}
            />
            Show LinkedIn Link
          </label>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.showEmail !== false}
              onChange={(e) => updatePageControl('/contact', 'showEmail', e.target.checked)}
            />
            Show Email Link
          </label>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.openLinksInNewTab !== false}
              onChange={(e) => updatePageControl('/contact', 'openLinksInNewTab', e.target.checked)}
            />
            Open Links in New Tab
          </label>
        </div>
      </div>
    </div>
  );
}

export default ContactPageControls;

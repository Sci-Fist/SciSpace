import React, { useState } from 'react';
import { usePage } from '../context/PageContext.jsx';
import { useTextContent } from '../context/TextContentContext.jsx';
import '../styles/pages/_genericPage.scss'; // Generic page style
import '../styles/pages/_contactPage.scss'; // Specific styles for contact page

function ContactPage() {
  const { getPageControls } = usePage();
  const { getTextContent } = useTextContent();
  const controls = getPageControls('/contact');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (controls.enableValidation !== false) {
      // Basic validation
      if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
        alert('Please fill in all required fields.');
        return;
      }
    }

    // Log form data to console (for demo purposes)
    console.log('Form submitted:', formData);

    // Show success message
    if (controls.showSuccessMessage !== false) {
      alert('Message sent! Thank you for reaching out.');
    }

    // Reset form
    if (controls.clearFormOnSubmit !== false) {
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }
  };

  // Get background pattern style
  const getBackgroundPattern = () => {
    if (!controls.backgroundPattern || controls.backgroundPattern === 'none') return {};

    const opacity = controls.backgroundPatternOpacity || 0.1;
    const color = controls.backgroundPatternColor || '#00e6e6';

    switch (controls.backgroundPattern) {
      case 'dots':
        return {
          backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          opacity: opacity
        };
      case 'grid':
        return {
          backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          opacity: opacity
        };
      case 'diagonal':
        return {
          backgroundImage: `repeating-linear-gradient(45deg, ${color}, ${color} 1px, transparent 1px, transparent 10px)`,
          opacity: opacity
        };
      case 'waves':
        return {
          backgroundImage: `repeating-linear-gradient(0deg, ${color}, ${color} 1px, transparent 1px, transparent 20px)`,
          opacity: opacity
        };
      case 'circuit':
        return {
          backgroundImage: `linear-gradient(90deg, ${color} 1px, transparent 1px), linear-gradient(${color} 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
          opacity: opacity
        };
      default:
        return {};
    }
  };

  // Get animation classes
  const getAnimationClass = () => {
    return controls.showAnimations !== false ? 'animate-in' : '';
  };

  // Get social media links
  const socialLinks = [
    {
      show: controls.showArtstation !== false,
      url: getTextContent('contact.artstationUrl') || 'https://artstation.com/yourprofile',
      text: getTextContent('contact.artstationText') || 'ArtStation'
    },
    {
      show: controls.showSoundcloud !== false,
      url: getTextContent('contact.soundcloudUrl') || 'https://soundcloud.com/yourprofile',
      text: getTextContent('contact.soundcloudText') || 'SoundCloud'
    },
    {
      show: controls.showLinkedin !== false,
      url: getTextContent('contact.linkedinUrl') || 'https://linkedin.com/in/yourprofile',
      text: getTextContent('contact.linkedinText') || 'LinkedIn'
    }
  ].filter(link => link.show);

  return (
    <section
      className={`generic-page contact-page ${getAnimationClass()}`}
      style={{
        opacity: controls.contentOpacity || 1,
        lineHeight: controls.lineHeight || 1.6,
        '--background-pattern': controls.backgroundPattern && controls.backgroundPattern !== 'none' ? 'block' : 'none',
        '--pattern-opacity': controls.backgroundPatternOpacity || 0.1,
        '--pattern-color': controls.backgroundPatternColor || '#00e6e6',
        animationDelay: controls.showAnimations !== false ? `${controls.animationDelay || 0}s` : '0s',
        // Force centering to override any ViewSwitcher conflicts
        display: 'grid',
        placeItems: 'center',
        width: '100%',
        maxWidth: 'var(--container-5xl)',
        margin: '0 auto'
      }}
    >
      <div
        className="background-pattern"
        style={getBackgroundPattern()}
      ></div>

      <h2
        style={{
          fontSize: controls.titleSize ? `${controls.titleSize}rem` : '2rem',
          opacity: controls.titleOpacity || 1
        }}
      >
        {getTextContent('contact.titleText') || 'Get in Touch'}
      </h2>

      <div className="contact-content">
        <p
          style={{
            opacity: controls.contentOpacity || 1
          }}
        >
          {getTextContent('contact.descriptionText') || "I'd love to hear from you! Whether you have a project in mind, a collaboration idea, or just want to say hello, feel free to reach out using the form below or connect with me on social media."}
        </p>

        <form
        className={`contact-form ${getAnimationClass()}`}
        onSubmit={handleSubmit}
        style={{
          backgroundColor: `rgba(var(--color-surface-rgb), ${controls.formOpacity || 0.9})`,
          borderRadius: `${controls.formBorderRadius || 12}px`,
          padding: `${controls.formPadding || 30}px`,
          boxShadow: controls.formShadow ? `0 4px 20px rgba(0, 0, 0, ${controls.formShadow})` : 'none',
          animationDelay: controls.showAnimations !== false ? `${(controls.animationDelay || 0) + 0.2}s` : '0s'
        }}
      >
        <div className="form-group">
          <label
            htmlFor="name"
            style={{
              fontSize: `${controls.labelSize || 14}px`
            }}
          >
            Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder={controls.showPlaceholders !== false ? "Your full name" : ""}
            required
            style={{
              height: `${controls.inputHeight || 45}px`,
              borderRadius: `${controls.inputBorderRadius || 6}px`
            }}
          />
        </div>

        <div className="form-group">
          <label
            htmlFor="email"
            style={{
              fontSize: `${controls.labelSize || 14}px`
            }}
          >
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder={controls.showPlaceholders !== false ? "your.email@example.com" : ""}
            required
            style={{
              height: `${controls.inputHeight || 45}px`,
              borderRadius: `${controls.inputBorderRadius || 6}px`
            }}
          />
        </div>

        <div className="form-group">
          <label
            htmlFor="subject"
            style={{
              fontSize: `${controls.labelSize || 14}px`
            }}
          >
            Subject:
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder={controls.showPlaceholders !== false ? "What's this about?" : ""}
            style={{
              height: `${controls.inputHeight || 45}px`,
              borderRadius: `${controls.inputBorderRadius || 6}px`
            }}
          />
        </div>

        <div className="form-group">
          <label
            htmlFor="message"
            style={{
              fontSize: `${controls.labelSize || 14}px`
            }}
          >
            Message:
          </label>
          <textarea
            id="message"
            name="message"
            rows={controls.textareaRows || 6}
            value={formData.message}
            onChange={handleInputChange}
            placeholder={controls.showPlaceholders !== false ? "Tell me about your project..." : ""}
            required
            style={{
              borderRadius: `${controls.inputBorderRadius || 6}px`
            }}
          ></textarea>
        </div>

        <button
          type="submit"
          className="btn primary-btn"
          style={{
            transform: `scale(${controls.buttonSize || 1})`,
            borderRadius: `${controls.buttonBorderRadius || 6}px`,
            transition: 'transform 0.2s ease',
            '--hover-scale': controls.buttonHoverScale || 1.05
          }}
        >
          {getTextContent('contact.submitButtonText') || 'Send Message'}
        </button>
      </form>

      <div
        className={`social-contact ${getAnimationClass()}`}
        style={{
          animationDelay: controls.showAnimations !== false ? `${(controls.animationDelay || 0) + 0.4}s` : '0s'
        }}
      >
        <h3>{getTextContent('contact.socialTitleText') || 'Connect with me:'}</h3>

        {controls.showEmail !== false && (
          <p>
            Email: <a href={`mailto:${getTextContent('contact.emailText') || 'contact@sci-fist.com'}`}>
              {getTextContent('contact.emailText') || 'contact@sci-fist.com'}
            </a>
          </p>
        )}

        {socialLinks.length > 0 && (
          <div
            className="social-icons"
            style={{
              gap: `${controls.socialSpacing || 15}px`
            }}
          >
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target={controls.openLinksInNewTab !== false ? "_blank" : "_self"}
                rel={controls.openLinksInNewTab !== false ? "noopener noreferrer" : ""}
              >
                {link.text}
              </a>
            ))}
          </div>
        )}
      </div>
      </div>
    </section>
  );
}

export default ContactPage;

import React from 'react';
import useScrollToBottom from '../hooks/useScrollToBottom';
import '../styles/components/_footer.scss';

function Footer() {
  const visible = useScrollToBottom();

  return (
    <footer
      className="main-footer"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s ease',
      }}
    >
      <p>&copy; {new Date().getFullYear()} Sci_Fist. All rights reserved.</p>
      <div className="social-links">
        <a href="https://www.youtube.com/@Sci-Fist" target="_blank" rel="noopener noreferrer">YouTube</a>
        <a href="https://soundcloud.com/sci-fist" target="_blank" rel="noopener noreferrer">SoundCloud</a>
        <a href="https://www.instagram.com/sci_fist/" target="_blank" rel="noopener noreferrer">Instagram</a>
      </div>
    </footer>
  );
}

export default Footer;

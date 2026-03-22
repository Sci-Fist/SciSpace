import React from 'react';
import { usePage } from '../context/PageContext.jsx';
import '../styles/pages/_genericPage.scss'; // Generic page style

function LinksPage() {
  const { getPageControls } = usePage();
  const controls = getPageControls('/links');

  const getBackgroundPattern = () => {
    switch (controls.backgroundPattern) {
      case 'dots':
        return 'radial-gradient(circle, rgba(var(--color-primary-rgb), 0.1) 1px, transparent 1px)';
      case 'grid':
        return 'linear-gradient(rgba(var(--color-primary-rgb), 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--color-primary-rgb), 0.1) 1px, transparent 1px)';
      case 'diagonal':
        return 'repeating-linear-gradient(45deg, rgba(var(--color-primary-rgb), 0.1) 0px, rgba(var(--color-primary-rgb), 0.1) 1px, transparent 1px, transparent 10px)';
      default:
        return 'none';
    }
  };

  return (
    <section
      className="generic-page"
      style={{
        opacity: controls.contentOpacity || 1,


        backgroundImage: getBackgroundPattern(),
        backgroundSize: controls.backgroundPattern === 'dots' ? '20px 20px' :
                       controls.backgroundPattern === 'grid' ? '40px 40px' : 'auto',
        animation: controls.showAnimations !== false ? 'fadeInUp 0.8s ease-out' : 'none'
      }}
    >
      <h2
        style={{
          fontSize: controls.titleSize ? `${controls.titleSize}rem` : '2rem',
          animation: controls.showAnimations !== false ? 'fadeInDown 0.6s ease-out' : 'none'
        }}
      >
        Useful Links & Resources
      </h2>
      <div
        className="links-content"
        style={{
          lineHeight: controls.lineHeight || 1.6,
          animation: controls.showAnimations !== false ? 'fadeInUp 0.8s ease-out 0.2s both' : 'none'
        }}
      >
        <p>
          A curated collection of links to my profiles on other platforms,
          collaborators, and resources I find valuable for artists and musicians.
        </p>

        <div className="links-category">
          <h3>My Profiles:</h3>
          <ul>
            <li><a href="#" target="_blank" rel="noopener noreferrer">ArtStation</a> - My 3D and 2D art portfolio</li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">SoundCloud</a> - Listen to my music tracks</li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a> - Connect professionally</li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Instagram</a> - Daily art and process updates</li>
          </ul>
        </div>

        <div className="links-category">
          <h3>Collaborators & Friends:</h3>
          <ul>
            <li><a href="#" target="_blank" rel="noopener noreferrer">[Collaborator Name 1]</a> - [Description]</li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">[Collaborator Name 2]</a> - [Description]</li>
          </ul>
        </div>

        <div className="links-category">
          <h3>Recommended Resources:</h3>
          <ul>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Blender.org</a> - Free and open source 3D creation suite</li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Substance 3D</a> - Industry-standard texturing tools</li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Splice</a> - Royalty-free samples and loops for music production</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default LinksPage;

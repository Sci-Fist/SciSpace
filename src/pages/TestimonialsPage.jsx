import React from 'react';
import { usePage } from '../context/PageContext.jsx';
import '../styles/pages/_genericPage.scss'; // Generic page style

function TestimonialsPage() {
  const { getPageControls } = usePage();
  const controls = getPageControls('/testimonials');

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
        Testimonials & Clients
      </h2>
      <div
        className="testimonials-content"
        style={{
          lineHeight: controls.lineHeight || 1.6,
          animation: controls.showAnimations !== false ? 'fadeInUp 0.8s ease-out 0.2s both' : 'none'
        }}
      >
        <p>
          I'm grateful for the opportunity to have worked with wonderful clients and collaborators.
          Here's what some of them have to say about my work:
        </p>

        <div className="testimonials-grid">
          <blockquote className="testimonial-card">
            <p>"[Your Name]'s 3D work brought our vision to life with incredible detail and a unique artistic flair.
              Their professionalism and creativity were outstanding throughout the project."</p>
            <footer>— [Client Name], [Company/Project]</footer>
          </blockquote>
          <blockquote className="testimonial-card">
            <p>"The music composed by [Your Name] perfectly captured the retro-futuristic mood we were aiming for.
              It added an unforgettable layer to our game's atmosphere."</p>
            <footer>— [Collaborator Name], [Project/Studio]</footer>
          </blockquote>
          <blockquote className="testimonial-card">
            <p>"Working with [Your Name] on our concept art was a seamless experience. Their ability to translate
              abstract ideas into stunning 2D visuals is truly impressive."</p>
            <footer>— [Client Name], [Company/Project]</footer>
          </blockquote>
        </div>

        <h3>Past Clients & Collaborations:</h3>
        <ul className="client-list">
          <li>[Client/Company Name 1]</li>
          <li>[Client/Company Name 2]</li>
          <li>[Client/Company Name 3]</li>
        </ul>
      </div>
    </section>
  );
}

export default TestimonialsPage;

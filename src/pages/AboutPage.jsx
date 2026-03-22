import React from 'react';
import { usePage } from '../context/PageContext.jsx';
import '../styles/pages/_genericPage.scss'; // Generic page style

function AboutPage() {
  const { getPageControls } = usePage();
  const controls = getPageControls('/about');

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
      className="about-page generic-page"
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
        About Me
      </h2>
      <div
        className="about-content"
        style={{
          lineHeight: controls.lineHeight || 1.6,
          animation: controls.showAnimations !== false ? 'fadeInUp 0.8s ease-out 0.2s both' : 'none'
        }}
      >
        <p>
          Hello! I'm [Your Name], a multidisciplinary artist passionate about crafting immersive digital experiences.
          My journey through the creative landscape has led me to explore the realms of 3D modeling, 2D illustration,
          and music production, all infused with a deep love for retro-futuristic aesthetics and synthwave vibes.
        </p>
        <p>
          With a keen eye for detail and a drive to innovate, I strive to create art that not only captivates visually
          but also tells a story and evokes a unique atmosphere. Whether it's sculpting intricate 3D environments,
          designing vibrant 2D characters, or composing pulsating electronic soundscapes, I pour my heart into every project.
        </p>
        <p>
          I'm always eager to collaborate on exciting projects and connect with fellow creators. Feel free to explore my work
          and reach out if you'd like to discuss a potential partnership or just share a love for all things retro-futuristic!
        </p>
      </div>
      {/* You can add a professional headshot or avatar here */}
      {/* <img src="/src/assets/images/your-avatar.png" alt="Your Avatar" className="about-avatar" /> */}
    </section>
  );
}

export default AboutPage;

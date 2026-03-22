import React from 'react';
import { usePage } from '../context/PageContext.jsx';
import '../styles/pages/_genericPage.scss'; // Generic page style

function ProcessPage() {
  const { getPageControls } = usePage();
  const controls = getPageControls('/process');

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
        My Creative Process
      </h2>
      <div
        className="process-content"
        style={{
          lineHeight: controls.lineHeight || 1.6,
          animation: controls.showAnimations !== false ? 'fadeInUp 0.8s ease-out 0.2s both' : 'none'
        }}
      >
        <p>
          Understanding the journey behind the art is just as important as the final piece.
          This section offers a glimpse into my workflow, from initial concepts to polished creations.
        </p>

        <div className="process-steps">
          <h3>3D Art Workflow:</h3>
          <ol>
            <li><strong>Concept & Research:</strong> Gathering inspiration, sketching ideas, and collecting references.</li>
            <li><strong>Blocking Out:</strong> Creating basic shapes and proportions in 3D software.</li>
            <li><strong>High-Poly Sculpting:</strong> Adding intricate details and organic forms.</li>
            <li><strong>Retopology & UV Unwrapping:</strong> Optimizing the mesh for animation/games and preparing for texturing.</li>
            <li><strong>Texturing:</strong> Applying materials and surface details in Substance Painter or similar tools.</li>
            <li><strong>Lighting & Rendering:</strong> Setting up the scene, lights, and camera for final output.</li>
            <li><strong>Post-Production:</strong> Color grading and final touches in Photoshop.</li>
          </ol>

          <h3>Music Production Workflow:</h3>
          <ol>
            <li><strong>Idea Generation:</strong> Starting with a melody, chord progression, or drum beat.</li>
            <li><strong>Arrangement:</strong> Building out the song structure (intro, verse, chorus, bridge, outro).</li>
            <li><strong>Sound Design:</strong> Crafting unique synth patches and selecting drum samples.</li>
            <li><strong>Mixing:</strong> Balancing levels, panning, and applying effects to each track.</li>
            <li><strong>Mastering:</strong> Final polish to ensure the track sounds great on all systems.</li>
          </ol>
        </div>
        <p>
          Each project is a unique adventure, but these core steps guide me through the creative challenges.
        </p>
      </div>
    </section>
  );
}

export default ProcessPage;

import React from 'react';
import { usePage } from '../context/PageContext.jsx';
import { useTextContent } from '../context/TextContentContext.jsx';
import '../styles/pages/_genericPage.scss'; // Generic page style
import '../styles/pages/_resumePage.scss'; // Specific styles for resume page

function ResumePage() {
  const { getPageControls } = usePage();
  const { getTextContent } = useTextContent();
  const controls = getPageControls('/resume');

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
          backgroundSize: '40px 40px',
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

  return (
    <section
      className={`generic-page resume-page ${getAnimationClass()}`}
      style={{
        opacity: controls.contentOpacity || 1,
        lineHeight: controls.lineHeight || 1.6,
        animationDelay: controls.showAnimations !== false ? `${0}s` : '0s',
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
        className={getAnimationClass()}
        style={{
          fontSize: controls.titleSize ? `${controls.titleSize}rem` : '2rem',
          opacity: controls.titleOpacity || 1,
          animationDelay: controls.showAnimations !== false ? `${0.1}s` : '0s'
        }}
      >
        {getTextContent('resume.pageTitle') || 'Resume / CV'}
      </h2>

      <div
        className={`resume-content-wrapper resume-content ${getAnimationClass()}`}
        style={{
          animationDelay: controls.showAnimations !== false ? `${0.2}s` : '0s'
        }}
      >
        {/* Professional Summary */}
        {controls.showSummary !== false && (
          <div className="resume-section summary-section">
            <p className="summary-text">
              {getTextContent('resume.summaryText') || 'Here you can find a summary of my professional experience, skills, and education. I am proficient in various software and techniques relevant to 3D art, 2D art, and music production.'}
            </p>
          </div>
        )}

        <div className="resume-content">
          {/* Skills Section */}
          {controls.showSkills !== false && (
            <div className="resume-section skills-section">
              <h3>{getTextContent('resume.skillsTitle') || 'Skills:'}</h3>
              <ul>
                <li><strong>3D Art:</strong> {getTextContent('resume.skills3d') || 'Blender, ZBrush, Substance Painter, Maya (basic)'}</li>
                <li><strong>2D Art:</strong> {getTextContent('resume.skills2d') || 'Photoshop, Procreate, Illustrator'}</li>
                <li><strong>Music Production:</strong> {getTextContent('resume.skillsMusic') || 'Ableton Live, Logic Pro X, Serum, Kontakt'}</li>
                <li><strong>Other:</strong> {getTextContent('resume.skillsOther') || 'Project Management, Team Collaboration, Creative Direction'}</li>
              </ul>
            </div>
          )}

          {/* Experience Section */}
          {controls.showExperience !== false && (
            <div className="resume-section experience-section">
              <h3>{getTextContent('resume.experienceTitle') || 'Experience:'}</h3>

              <div className="experience-item">
                <p>
                  <strong>{getTextContent('resume.experience1Title') || '[Your Role]'}</strong> at {getTextContent('resume.experience1Company') || '[Company Name]'} - {getTextContent('resume.experience1Dates') || '[Start Date] – [End Date]'}
                  <br />
                  - {getTextContent('resume.experience1Resp1') || '[Key responsibility 1]'}
                  <br />
                  - {getTextContent('resume.experience1Resp2') || '[Key responsibility 2]'}
                </p>
              </div>

              <div className="experience-item">
                <p>
                  <strong>{getTextContent('resume.experience2Title') || '[Another Role]'}</strong> at {getTextContent('resume.experience2Company') || '[Another Company]'} - {getTextContent('resume.experience2Dates') || '[Start Date] – [End Date]'}
                  <br />
                  - {getTextContent('resume.experience2Resp1') || '[Key responsibility 1]'}
                  <br />
                  - {getTextContent('resume.experience2Resp2') || '[Key responsibility 2]'}
                </p>
              </div>
            </div>
          )}

          {/* Education Section */}
          {controls.showEducation !== false && (
            <div className="resume-section education-section">
              <h3>{getTextContent('resume.educationTitle') || 'Education:'}</h3>
              <p>
                <strong>{getTextContent('resume.educationDegree') || '[Degree/Certification]'}</strong> - {getTextContent('resume.educationInstitution') || '[Institution Name]'} - {getTextContent('resume.educationYear') || '[Year of Graduation]'}
              </p>
            </div>
          )}

          {/* Projects Section */}
          {controls.showProjects !== false && (
            <div className="resume-section projects-section">
              <h3>{getTextContent('resume.projectsTitle') || 'Projects:'}</h3>

              <div className="project-item">
                <h4>{getTextContent('resume.project1Name') || '[Project Name 1]'}</h4>
                <p>{getTextContent('resume.project1Description') || '[Project description 1]'}</p>
              </div>

              <div className="project-item">
                <h4>{getTextContent('resume.project2Name') || '[Project Name 2]'}</h4>
                <p>{getTextContent('resume.project2Description') || '[Project description 2]'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Download Button */}
        {controls.showDownloadButton !== false && (
          <div className="call-to-action">
            <a
              href="/src/assets/documents/your-resume.txt"
              download
              className="btn primary-btn"
            >
              {getTextContent('resume.downloadButtonText') || 'Download Full CV (PDF)'}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export default ResumePage;

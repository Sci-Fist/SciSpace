import React from 'react';
import { usePage } from '../../context/PageContext.jsx';
import { useContent } from '../../context/ContentContext.jsx';
import TextEditor from './TextEditor.jsx';
import '../../styles/components/_pageControls.scss';

function ResumePageControls() {
  const { getPageControls, updatePageControl } = usePage();
  const { getTextContent } = useContent();
  const controls = getPageControls('/resume');

  return (
    <div className="page-controls resume-page-controls">
      <h3>Resume Page Controls</h3>

      {/* Overall Page Styling Section */}
      <div className="control-section">
        <h4>Overall Page Styling</h4>

        <div className="control-group">
          <label>Content Opacity: {controls.contentOpacity || 1}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={controls.contentOpacity || 1}
            onChange={(e) => updatePageControl('/resume', 'contentOpacity', parseFloat(e.target.value))}
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
            onChange={(e) => updatePageControl('/resume', 'contentWidth', parseInt(e.target.value))}
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
            onChange={(e) => updatePageControl('/resume', 'lineHeight', parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.showAnimations !== false}
              onChange={(e) => updatePageControl('/resume', 'showAnimations', e.target.checked)}
            />
            Show Animations
          </label>
        </div>
      </div>

      {/* Background Pattern Section */}
      <div className="control-section">
        <h4>Background Pattern</h4>

        <div className="control-group">
          <label>Pattern Type:</label>
          <select
            value={controls.backgroundPattern || 'none'}
            onChange={(e) => updatePageControl('/resume', 'backgroundPattern', e.target.value)}
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
            onChange={(e) => updatePageControl('/resume', 'backgroundPatternOpacity', parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Pattern Color:</label>
          <input
            type="color"
            value={controls.backgroundPatternColor || '#00e6e6'}
            onChange={(e) => updatePageControl('/resume', 'backgroundPatternColor', e.target.value)}
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
            onChange={(e) => updatePageControl('/resume', 'titleSize', parseFloat(e.target.value))}
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
            onChange={(e) => updatePageControl('/resume', 'titleOpacity', parseFloat(e.target.value))}
          />
        </div>
      </div>

      {/* Section Visibility Section */}
      <div className="control-section">
        <h4>Section Visibility</h4>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.showSummary !== false}
              onChange={(e) => updatePageControl('/resume', 'showSummary', e.target.checked)}
            />
            Show Professional Summary
          </label>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.showExperience !== false}
              onChange={(e) => updatePageControl('/resume', 'showExperience', e.target.checked)}
            />
            Show Experience Section
          </label>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.showEducation !== false}
              onChange={(e) => updatePageControl('/resume', 'showEducation', e.target.checked)}
            />
            Show Education Section
          </label>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.showSkills !== false}
              onChange={(e) => updatePageControl('/resume', 'showSkills', e.target.checked)}
            />
            Show Skills Section
          </label>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.showProjects !== false}
              onChange={(e) => updatePageControl('/resume', 'showProjects', e.target.checked)}
            />
            Show Projects Section
          </label>
        </div>
      </div>

      {/* Content Editing Section */}
      <div className="control-section">
        <h4>Content Editing</h4>

        {/* Page Title */}
        <TextEditor
          contentKey="resume.pageTitle"
          label="Page Title"
          placeholder="Resume / CV"
        />

        {/* Professional Summary */}
        <TextEditor
          contentKey="resume.summaryText"
          label="Professional Summary"
          placeholder="Here you can find a summary of my professional experience, skills, and education. I am proficient in various software and techniques relevant to 3D art, 2D art, and music production."
          multiline={true}
        />

        {/* Skills Section */}
        <TextEditor
          contentKey="resume.skillsTitle"
          label="Skills Section Title"
          placeholder="Skills:"
        />

        <TextEditor
          contentKey="resume.skills3d"
          label="3D Art Skills"
          placeholder="Blender, ZBrush, Substance Painter, Maya (basic)"
        />

        <TextEditor
          contentKey="resume.skills2d"
          label="2D Art Skills"
          placeholder="Photoshop, Procreate, Illustrator"
        />

        <TextEditor
          contentKey="resume.skillsMusic"
          label="Music Production Skills"
          placeholder="Ableton Live, Logic Pro X, Serum, Kontakt"
        />

        <TextEditor
          contentKey="resume.skillsOther"
          label="Other Skills"
          placeholder="Project Management, Team Collaboration, Creative Direction"
        />

        {/* Experience Section */}
        <TextEditor
          contentKey="resume.experienceTitle"
          label="Experience Section Title"
          placeholder="Experience:"
        />

        <TextEditor
          contentKey="resume.experience1Title"
          label="First Job Title"
          placeholder="[Your Role]"
        />

        <TextEditor
          contentKey="resume.experience1Company"
          label="First Company"
          placeholder="[Company Name]"
        />

        <TextEditor
          contentKey="resume.experience1Dates"
          label="First Job Dates"
          placeholder="[Start Date] – [End Date]"
        />

        <TextEditor
          contentKey="resume.experience1Resp1"
          label="First Job Responsibility 1"
          placeholder="[Key responsibility 1]"
          multiline={true}
        />

        <TextEditor
          contentKey="resume.experience1Resp2"
          label="First Job Responsibility 2"
          placeholder="[Key responsibility 2]"
          multiline={true}
        />

        <TextEditor
          contentKey="resume.experience2Title"
          label="Second Job Title"
          placeholder="[Another Role]"
        />

        <TextEditor
          contentKey="resume.experience2Company"
          label="Second Company"
          placeholder="[Another Company]"
        />

        <TextEditor
          contentKey="resume.experience2Dates"
          label="Second Job Dates"
          placeholder="[Start Date] – [End Date]"
        />

        <TextEditor
          contentKey="resume.experience2Resp1"
          label="Second Job Responsibility 1"
          placeholder="[Key responsibility 1]"
          multiline={true}
        />

        <TextEditor
          contentKey="resume.experience2Resp2"
          label="Second Job Responsibility 2"
          placeholder="[Key responsibility 2]"
          multiline={true}
        />

        {/* Education Section */}
        <TextEditor
          contentKey="resume.educationTitle"
          label="Education Section Title"
          placeholder="Education:"
        />

        <TextEditor
          contentKey="resume.educationDegree"
          label="Degree/Certification"
          placeholder="[Degree/Certification]"
        />

        <TextEditor
          contentKey="resume.educationInstitution"
          label="Institution Name"
          placeholder="[Institution Name]"
        />

        <TextEditor
          contentKey="resume.educationYear"
          label="Graduation Year"
          placeholder="[Year of Graduation]"
        />

        {/* Projects Section */}
        <TextEditor
          contentKey="resume.projectsTitle"
          label="Projects Section Title"
          placeholder="Projects:"
        />

        <TextEditor
          contentKey="resume.project1Name"
          label="First Project Name"
          placeholder="[Project Name 1]"
        />

        <TextEditor
          contentKey="resume.project1Description"
          label="First Project Description"
          placeholder="[Project description 1]"
          multiline={true}
        />

        <TextEditor
          contentKey="resume.project2Name"
          label="Second Project Name"
          placeholder="[Project Name 2]"
        />

        <TextEditor
          contentKey="resume.project2Description"
          label="Second Project Description"
          placeholder="[Project description 2]"
          multiline={true}
        />
      </div>

      {/* Resume Download Section */}
      <div className="control-section">
        <h4>Resume Download</h4>

        <TextEditor
          contentKey="resume.downloadButtonText"
          label="Download Button Text"
          placeholder="Download Full CV (PDF)"
        />

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={controls.showDownloadButton !== false}
              onChange={(e) => updatePageControl('/resume', 'showDownloadButton', e.target.checked)}
            />
            Show Download Button
          </label>
        </div>

        <div className="control-group">
          <label>Resume File Path:</label>
          <div style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
            src/assets/documents/your-resume.txt
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumePageControls;

import React, { useState, useEffect } from 'react';
import { useContent } from '../../context/ContentContext.jsx';
import '../../styles/components/_textEditor.scss';

function TextEditor({ contentKey, label, placeholder, multiline = false, className = '' }) {
  const { getTextContent, updateTextContent } = useContent();
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState('');

  const currentValue = getTextContent(contentKey) || '';

  useEffect(() => {
    setTempValue(currentValue);
  }, [currentValue]);

  const handleEdit = () => {
    setIsEditing(true);
    setTempValue(currentValue);
  };

  const handleSave = () => {
    updateTextContent(contentKey, tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(currentValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={`text-editor ${className}`}>
      <label className="text-editor-label">
        {label}
        <button
          className="edit-btn"
          onClick={handleEdit}
          title="Edit text"
        >
          ✏️
        </button>
      </label>

      {isEditing ? (
        <div className="text-editor-editing">
          {multiline ? (
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              autoFocus
              rows={4}
            />
          ) : (
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              autoFocus
            />
          )}
          <div className="text-editor-actions">
            <button className="btn primary-btn save-btn" onClick={handleSave}>
              Save
            </button>
            <button className="btn secondary-btn cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="text-editor-display">
          <span className="text-content">
            {currentValue || <em className="placeholder">{placeholder}</em>}
          </span>
        </div>
      )}
    </div>
  );
}

export default TextEditor;

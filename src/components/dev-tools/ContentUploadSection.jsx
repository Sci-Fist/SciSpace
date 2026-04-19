import React, { useState, useRef, useEffect } from 'react';
import { usePage } from '../../context/PageContext.jsx';
import { useContent } from '../../context/ContentContext.jsx';
import { uploadToCloudinary } from '../../services/cloudinary.js';

// Simple Image Slideshow Component - Just clickable thumbnails
function ImageSlideshow({ images, onSelectImage }) {
  if (!images || images.length === 0) {
    return (
      <div className="slideshow-empty">
        <p>No images to display in slideshow</p>
      </div>
    );
  }

  return (
    <div className="image-slideshow">
      <div className="slideshow-thumbnails">
        {images.map((image, index) => (
          <button
            key={image.id}
            className="thumbnail"
            onClick={() => onSelectImage && onSelectImage(image.id)}
            title={image.name}
          >
            {image.needsReupload ? (
              <div className="thumbnail-placeholder">
                <span>??</span>
                <small>Re-upload</small>
              </div>
            ) : (
              <img
                src={image.url || image.src}
                alt={image.name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            )}
            <div className="thumbnail-error" style={{ display: 'none' }}>
              ?
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CollapsibleGallery({ category, files, onSelectImage, selectedImage }) {
  const { currentPage } = usePage();
  const {
    toggleSlideshowEnabled,
    toggleSlideshowImage,
    getSlideshowSettings
  } = useContent();

  const [isExpanded, setIsExpanded] = useState(false);
  const [galleryLayout, setGalleryLayout] = useState('list');
  const [showLayoutDropdown, setShowLayoutDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLayoutDropdown(false);
      }
    };
    if (showLayoutDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLayoutDropdown]);

  const categoryFiles = files.filter(file => file.category === category.name);
  const categoryImages = categoryFiles.filter(file => file.type?.startsWith('image/') || !file.type); // Support bootstrapped images with missing type

  const slideshowSettings = getSlideshowSettings(currentPage, category.name);
  const hasFiles = categoryFiles.length > 0;
  const hasImages = categoryImages.length > 0;

  const handleSlideshowImageToggle = (imageId) => {
    toggleSlideshowImage(currentPage, category.name, imageId);
  };

  return (
    <div className="category-gallery">
      <div className="gallery-header">
        <button className="gallery-toggle-btn" onClick={() => setIsExpanded(!isExpanded)}>
          <span className="gallery-icon">{category.icon}</span>
          <span className="gallery-title">{category.name}</span>
          <span className="gallery-count">({categoryFiles.length})</span>
          <span className="gallery-arrow">{isExpanded ? '?' : '?'}</span>
        </button>

        {hasImages && currentPage === '/' && (
          <label className="slideshow-enable-label compact">
            <input
              type="checkbox"
              checked={slideshowSettings.enabled || false}
              onChange={() => toggleSlideshowEnabled(currentPage, category.name)}
            />
            <span>Show</span>
          </label>
        )}
      </div>

      {isExpanded && (
        <div className="gallery-content">
          {currentPage === '/' && (
            <div className="mode-tabs">
              <button className={`mode-tab ${!slideshowSettings.enabled ? 'active' : ''}`} onClick={() => !slideshowSettings.enabled ? null : toggleSlideshowEnabled(currentPage, category.name)}>Gallery</button>
              <button className={`mode-tab ${slideshowSettings.enabled ? 'active' : ''}`} onClick={() => slideshowSettings.enabled ? null : toggleSlideshowEnabled(currentPage, category.name)}>Slides</button>
            </div>
          )}

          {(!slideshowSettings.enabled || currentPage !== '/') && (
            <div className="mode-content">
              {hasFiles ? (
                <div className={`gallery-grid layout-grid-small`}>
                  {categoryFiles.map(file => (
                    <div key={file.id} className={`gallery-item ${selectedImage === file.id ? 'selected' : ''}`} onClick={() => onSelectImage(file.id)}>
                      <img src={file.url || file.src} alt={file.name} className="gallery-image" />
                      {selectedImage === file.id && <div className="selection-indicator">✓</div>}
                    </div>
                  ))}
                </div>
              ) : <div className="gallery-empty">No files in category.</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ContentUploadSection() {
  const { currentPage } = usePage();
  const {
    addUploadedFiles,
    removeUploadedFile,
    updateMediaItem,
    getUploadedFiles,
    getSelectedImage,
    selectImage,
    isLoading
  } = useContent();

  const [editingFileId, setEditingFileId] = useState(null);
  const [editData, setEditData] = useState({ name: '', category: '' });

  const getUploadOptions = () => {
    switch (currentPage) {
      case '/2d-art':
        return {
          sectionTitle: '2D Art Assets',
          description: 'Manage 2D artwork and illustrations.',
          categories: [
            { name: 'Digital Paintings', accept: 'image/*', icon: '??', description: 'Finished works' },
            { name: 'Illustrations', accept: 'image/*', icon: '??', description: 'Line art/vectors' },
            { name: 'Concept Art', accept: 'image/*', icon: '??', description: 'Design sketches' },
            { name: '2D Art', accept: 'image/*', icon: '??', description: 'General 2D' }
          ]
        };
      case '/3d-art':
        return {
          sectionTitle: '3D Art Assets',
          description: 'Manage 3D renders and models.',
          categories: [
            { name: 'Renders', accept: 'image/*', icon: '??', description: 'Final renders' },
            { name: 'Models', accept: 'image/*,.obj,.fbx', icon: '??', description: '3D assets' },
            { name: 'Characters', accept: 'image/*', icon: '??', description: '3D characters' },
            { name: 'Environments', accept: 'image/*', icon: '??', description: 'Scene assets' }
          ]
        };
      case '/sketches':
        return {
          sectionTitle: 'Sketch Assets',
          description: 'Manage traditional and digital sketches.',
          categories: [
            { name: 'Life Drawing', accept: 'image/*', icon: '??', description: 'Anatomy studies' },
            { name: 'Concepts', accept: 'image/*', icon: '??', description: 'Early designs' }
          ]
        };
      case '/photography':
        return {
          sectionTitle: 'Photography Assets',
          description: 'Manage professional photo series.',
          categories: [
            { name: 'Food Photography', accept: 'image/*', icon: '??', description: 'Culinary' },
            { name: 'Architecture', accept: 'image/*', icon: '??', description: 'Structures' },
            { name: 'Urban', accept: 'image/*', icon: '???', description: 'Cityscapes' },
            { name: 'Video', accept: 'video/*', icon: '??', description: 'Motion' }
          ]
        };
      case '/':
        return {
          sectionTitle: 'Homepage Assets',
          description: 'Manage hero slideshow and background visuals.',
          categories: [
            { name: 'Hero Images', accept: 'image/*', icon: '???', description: 'Hero slideshow images' },
            { name: 'Background Images', accept: 'image/*', icon: '??', description: 'Page backgrounds' },
            { name: 'Logo/Icon', accept: 'image/*', icon: '?', description: 'Brand elements' }
          ]
        };
      default:
        return { sectionTitle: 'Media Management', description: 'Manage page media.', categories: [{ name: 'General', accept: '*/*', icon: '??', description: 'Any file' }] };
    }
  };

  const uploadOptions = getUploadOptions();
  const currentUploads = getUploadedFiles(currentPage);

  const startEditing = (file) => {
    setEditingFileId(file.id);
    setEditData({ name: file.name, category: file.category });
  };

  const saveEdit = async () => {
    await updateMediaItem(currentPage, editingFileId, editData);
    setEditingFileId(null);
  };

  const handleCategoryUpload = async (category) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = category.accept;
    input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from(e.target.files).map((f, i) => ({
        id: `up-${Date.now()}-${i}`,
        name: f.name,
        size: f.size,
        type: f.type,
        category: category.name,
        file: f
      }));
      await addUploadedFiles(currentPage, files);
    };
    input.click();
  };

  if (isLoading) return <div className="loading-compact">Syncing assets...</div>;

  return (
    <div className="content-upload-section">
      <h4>{uploadOptions.sectionTitle}</h4>
      <p className="upload-description">{uploadOptions.description}</p>

      <div className="upload-categories">
        {uploadOptions.categories.map((category, index) => (
          <div key={index} className="category-section">
            <button className="category-upload-btn" onClick={() => handleCategoryUpload(category)}>
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
            <CollapsibleGallery
              category={category}
              files={currentUploads}
              onSelectImage={(id) => selectImage(currentPage, category.name, id)}
              selectedImage={getSelectedImage(currentPage, category.name)?.id}
            />
          </div>
        ))}
      </div>

      {currentUploads.length > 0 && (
        <div className="uploaded-files">
          <h5>Detected Assets ({currentUploads.length})</h5>
          <div className="file-list">
            {currentUploads.map(file => (
              <div key={file.id} className="file-item">
                <div className="file-info">
                  <img src={file.url || file.src} alt={file.name} className="file-preview" />
                  <div className="file-details">
                    {editingFileId === file.id ? (
                      <>
                        <input className="edit-input" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                        <select className="edit-select" value={editData.category} onChange={e => setEditData({...editData, category: e.target.value})}>
                          {uploadOptions.categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                      </>
                    ) : (
                      <>
                        <span className="file-name">{file.name}</span>
                        <span className="file-category">{file.category}</span>
                        {file.isBootstrapped && <span className="boot-tag">Stored</span>}
                      </>
                    )}
                  </div>
                </div>
                <div className="file-actions">
                  {editingFileId === file.id ? (
                    <button onClick={saveEdit} className="action-btn save">??</button>
                  ) : (
                    <button onClick={() => startEditing(file)} className="action-btn edit">??</button>
                  )}
                  <button onClick={() => removeUploadedFile(currentPage, file.id)} className="action-btn delete">?</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ContentUploadSection;

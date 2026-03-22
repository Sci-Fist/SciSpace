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
                <span>🔄</span>
                <small>Re-upload</small>
              </div>
            ) : (
              <img
                src={image.url}
                alt={image.name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            )}
            <div className="thumbnail-error" style={{ display: 'none' }}>
              ✕
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
  const [galleryLayout, setGalleryLayout] = useState('list'); // Individual layout state for each gallery
  const [showLayoutDropdown, setShowLayoutDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLayoutDropdown(false);
      }
    };

    if (showLayoutDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLayoutDropdown]);
  const categoryFiles = files.filter(file => file.category === category.name);
  const categoryImages = categoryFiles.filter(file => file.type.startsWith('image/'));

  // Get slideshow settings for this category
  const slideshowSettings = getSlideshowSettings(currentPage, category.name);

  // Debug: Log gallery data (removed console.log spam)

  // Show gallery even if empty, but indicate no files
  const hasFiles = categoryFiles.length > 0;
  const hasImages = categoryImages.length > 0;

  const handleSlideshowImageToggle = (imageId) => {
    toggleSlideshowImage(currentPage, category.name, imageId);
  };

  return (
    <div className="category-gallery">
      <div className="gallery-header">
        <button
          className="gallery-toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="gallery-icon">{category.icon}</span>
          <span className="gallery-title">{category.name} Gallery</span>
          <span className="gallery-count">({categoryFiles.length})</span>
          <span className="gallery-arrow">{isExpanded ? '▼' : '▶'}</span>
        </button>

        {/* Slideshow Enable Checkbox - Always visible */}
        {hasImages && (
          <label className="slideshow-enable-label compact">
            <input
              type="checkbox"
              checked={slideshowSettings.enabled || false}
              onChange={() => toggleSlideshowEnabled(currentPage, category.name)}
            />
            <span>Slideshow</span>
            {slideshowSettings.enabled && (
              <span className="status-indicator enabled small">●</span>
            )}
          </label>
        )}
      </div>

      {isExpanded && (
        <div className="gallery-content">
          {/* Layout Selector - Top Left of Gallery */}
          <div className="gallery-layout-selector">
            <div className="layout-dropdown" ref={dropdownRef}>
              <button
                className="layout-dropdown-trigger"
                onClick={() => setShowLayoutDropdown(!showLayoutDropdown)}
              >
                {galleryLayout === 'list' && '📋 List'}
                {galleryLayout === 'grid-small' && '🔍 Small Grid'}
                {galleryLayout === 'grid-medium' && '📐 Medium Grid'}
                {galleryLayout === 'icons-only' && '🎯 Icons Only'}
                <span className="dropdown-arrow">{showLayoutDropdown ? '▲' : '▼'}</span>
              </button>

              {showLayoutDropdown && (
                <div className="layout-dropdown-menu">
                  <button
                    className={`layout-option ${galleryLayout === 'list' ? 'active' : ''}`}
                    onClick={() => {
                      setGalleryLayout('list');
                      setShowLayoutDropdown(false);
                    }}
                  >
                    📋 List
                  </button>
                  <button
                    className={`layout-option ${galleryLayout === 'grid-small' ? 'active' : ''}`}
                    onClick={() => {
                      setGalleryLayout('grid-small');
                      setShowLayoutDropdown(false);
                    }}
                  >
                    🔍 Small Grid
                  </button>
                  <button
                    className={`layout-option ${galleryLayout === 'grid-medium' ? 'active' : ''}`}
                    onClick={() => {
                      setGalleryLayout('grid-medium');
                      setShowLayoutDropdown(false);
                    }}
                  >
                    📐 Medium Grid
                  </button>
                  <button
                    className={`layout-option ${galleryLayout === 'icons-only' ? 'active' : ''}`}
                    onClick={() => {
                      setGalleryLayout('icons-only');
                      setShowLayoutDropdown(false);
                    }}
                  >
                    🎯 Icons Only
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="mode-tabs">
            <button
              className={`mode-tab ${!slideshowSettings.enabled ? 'active' : ''}`}
              onClick={() => toggleSlideshowEnabled(currentPage, category.name)}
            >
              Gallery
            </button>
            <button
              className={`mode-tab ${slideshowSettings.enabled ? 'active' : ''}`}
              onClick={() => toggleSlideshowEnabled(currentPage, category.name)}
            >
              Slideshow
            </button>
          </div>

          {/* Gallery Mode */}
          {!slideshowSettings.enabled && (
            <div className="mode-content">
              {hasFiles ? (
                <div className={`gallery-grid layout-${galleryLayout}`}>
                  {categoryFiles.map(file => (
                    <div
                      key={file.id}
                      className={`gallery-item ${selectedImage === file.id ? 'selected' : ''}`}
                      onClick={() => onSelectImage(file.id)}
                    >
                      {file.type.startsWith('image/') && (
                        file.needsReupload ? (
                          <div className="image-placeholder">
                            <span>🔄 Re-upload needed</span>
                            <small>Browser restart</small>
                          </div>
                        ) : (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="gallery-image"
                            onError={(e) => {
                              console.error('Image failed to load:', file.name, 'URL length:', file.url?.length, 'URL start:', file.url?.substring(0, 50));
                              // Show a placeholder instead of hiding
                              e.target.src = `data:image/svg+xml;base64,${btoa(`
                                <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="80" height="80" fill="#f0f0f0"/>
                                  <text x="40" y="45" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">
                                    Image Error
                                  </text>
                                </svg>
                              `)}`;
                              e.target.style.opacity = '0.5';
                            }}
                            onLoad={() => {
                              console.log('Image loaded successfully:', file.name);
                            }}
                          />
                        )
                      )}
                      <div className="gallery-overlay">
                        <span className="gallery-filename">{file.name}</span>
                        <span className="gallery-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      {selectedImage === file.id && (
                        <div className="selection-indicator">✓</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="gallery-empty">
                  <p>No files uploaded to this category yet.</p>
                  <small>Click the upload button above to add files.</small>
                </div>
              )}
            </div>
          )}

          {/* Slideshow Mode */}
          {slideshowSettings.enabled && (
            <div className="mode-content">
              {/* Image Selection for Slideshow */}
              {hasImages && (
                <div className="slideshow-image-selection">
                  <h6>Select Images for Slideshow ({slideshowSettings.images?.length || 0} selected)</h6>
                  <div className={`gallery-grid slideshow-selection-grid layout-${galleryLayout}`}>
                    {categoryImages.map(file => {
                      const isSelectedForSlideshow = slideshowSettings.images?.includes(file.id) || false;
                      return (
                        <div
                          key={file.id}
                          className={`gallery-item slideshow-selectable ${isSelectedForSlideshow ? 'slideshow-selected' : ''}`}
                          onClick={() => handleSlideshowImageToggle(file.id)}
                        >
                          {file.needsReupload ? (
                            <div className="image-placeholder">
                              <span>🔄 Re-upload needed</span>
                              <small>Browser restart</small>
                            </div>
                          ) : (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="gallery-image"
                              onError={(e) => {
                                console.error('Image failed to load:', file.name);
                                e.target.src = `data:image/svg+xml;base64,${btoa(`
                                  <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="80" height="80" fill="#f0f0f0"/>
                                    <text x="40" y="45" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">
                                      Image Error
                                    </text>
                                  </svg>
                                `)}`;
                              }}
                            />
                          )}
                          <div className="gallery-overlay">
                            <span className="gallery-filename">{file.name}</span>
                            <span className="gallery-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                          {isSelectedForSlideshow && (
                            <div className="slideshow-selection-indicator">🎠</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!hasImages && (
                <div className="gallery-empty">
                  <p>No images in this category for slideshow.</p>
                  <small>Upload images to this category first.</small>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Collapsible Slideshow Component for each category
function CollapsibleSlideshow({ category, files }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const categoryImages = files.filter(file => file.category === category.name && file.type.startsWith('image/'));

  const hasImages = categoryImages.length > 0;

  return (
    <div className="category-slideshow">
      <button
        className="slideshow-toggle-btn"
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={!hasImages}
      >
        <span className="slideshow-icon">🎠</span>
        <span className="slideshow-title">{category.name} Slideshow</span>
        <span className="slideshow-count">({categoryImages.length})</span>
        <span className="slideshow-arrow">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && hasImages && (
        <div className="slideshow-content">
          <ImageSlideshow images={categoryImages} />
        </div>
      )}

      {isExpanded && !hasImages && (
        <div className="slideshow-empty">
          <p>No images in this category to display in slideshow.</p>
          <small>Upload images to this category first.</small>
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
    selectImage,
    getSelectedImage,
    getUploadedFiles,
    toggleSlideshowEnabled,
    toggleSlideshowImage
  } = useContent();
  const fileInputRef = useRef(null);

  const getUploadOptions = () => {
    switch (currentPage) {
      case '/':
        return {
          title: 'Content Management',
          sectionTitle: 'Homepage Assets',
          description: 'Manage and upload homepage visual content',
          categories: [
            { name: 'Hero Images', accept: 'image/*', icon: '🖼️', description: 'Main banner images' },
            { name: 'Background Images', accept: 'image/*', icon: '🎨', description: 'Background visuals' },
            { name: 'Logo/Icon', accept: 'image/*', icon: '⭐', description: 'Branding elements' }
          ]
        };
      case '/2d-art':
        return {
          title: 'Content Management',
          sectionTitle: '2D Art Assets',
          description: 'Upload and manage 2D artwork files',
          categories: [
            { name: 'Digital Paintings', accept: 'image/*', icon: '🎨', description: 'Finished paintings' },
            { name: 'Illustrations', accept: 'image/*', icon: '✏️', description: 'Vector/digital illustrations' },
            { name: 'Concept Art', accept: 'image/*', icon: '💡', description: 'Design concepts' },
            { name: 'Sketches', accept: 'image/*', icon: '📝', description: 'Preliminary drawings' }
          ]
        };
      case '/3d-art':
        return {
          title: 'Content Management',
          sectionTitle: '3D Art Assets',
          description: 'Upload 3D models, renders, and project files',
          categories: [
            { name: '3D Renders', accept: 'image/*', icon: '🎯', description: 'Final rendered images' },
            { name: 'Model Files', accept: 'image/*,.obj,.fbx,.blend,.gltf,.glb', icon: '📦', description: '3D model files' },
            { name: 'Textures', accept: 'image/*', icon: '🧵', description: 'Material textures' },
            { name: 'Project Files', accept: '.blend,.fbx,.obj', icon: '📁', description: 'Software project files' }
          ]
        };
      case '/music':
        return {
          title: 'Content Management',
          sectionTitle: 'Music Assets',
          description: 'Upload audio tracks and music files',
          categories: [
            { name: 'Full Tracks', accept: 'audio/*,.wav,.mp3,.flac,.ogg', icon: '🎵', description: 'Complete songs' },
            { name: 'Demos', accept: 'audio/*,.wav,.mp3,.flac,.ogg', icon: '🎼', description: 'Work-in-progress' },
            { name: 'Stems', accept: 'audio/*,.wav,.mp3,.flac,.ogg', icon: '🎛️', description: 'Individual elements' },
            { name: 'Loops', accept: 'audio/*,.wav,.mp3,.flac,.ogg', icon: '🔄', description: 'Reusable loops' }
          ]
        };
      case '/blog':
        return {
          title: 'Content Management',
          sectionTitle: 'Blog Content',
          description: 'Upload blog posts and related media',
          categories: [
            { name: 'Blog Posts', accept: '.md,.txt,.doc,.docx', icon: '📝', description: 'Written articles' },
            { name: 'Articles', accept: '.md,.txt,.doc,.docx', icon: '📰', description: 'Long-form content' },
            { name: 'Images', accept: 'image/*', icon: '🖼️', description: 'Blog post images' },
            { name: 'Documents', accept: '.pdf,.doc,.docx', icon: '📄', description: 'Supporting files' }
          ]
        };
      case '/about':
        return {
          title: 'Content Management',
          sectionTitle: 'About Page Assets',
          description: 'Upload personal and professional content',
          categories: [
            { name: 'Profile Photos', accept: 'image/*', icon: '👤', description: 'Personal photos' },
            { name: 'Resume/CV', accept: '.pdf,.doc,.docx', icon: '📋', description: 'Resume documents' },
            { name: 'Portfolio PDFs', accept: '.pdf', icon: '📖', description: 'Portfolio files' },
            { name: 'Certificates', accept: 'image/*,.pdf', icon: '🏆', description: 'Achievement certificates' }
          ]
        };
      case '/resume':
        return {
          title: 'Content Management',
          sectionTitle: 'Resume Assets',
          description: 'Upload resume and career documents',
          categories: [
            { name: 'Resume PDF', accept: '.pdf,.doc,.docx', icon: '📄', description: 'Main resume file' },
            { name: 'Cover Letter', accept: '.pdf,.doc,.docx', icon: '✉️', description: 'Cover letter' },
            { name: 'Portfolio', accept: '.pdf,.zip', icon: '💼', description: 'Work samples' },
            { name: 'References', accept: '.pdf,.doc,.docx', icon: '👥', description: 'Reference letters' }
          ]
        };
      case '/contact':
        return {
          title: 'Content Management',
          sectionTitle: 'Contact Assets',
          description: 'Upload contact-related images and files',
          categories: [
            { name: 'Profile Images', accept: 'image/*', icon: '📸', description: 'Professional photos' },
            { name: 'Business Cards', accept: 'image/*,.pdf', icon: '💳', description: 'Contact cards' },
            { name: 'Contact Photos', accept: 'image/*', icon: '🤝', description: 'Meeting/event photos' }
          ]
        };
      case '/process':
        return {
          title: 'Content Management',
          sectionTitle: 'Process Documentation',
          description: 'Upload workflow and tutorial content',
          categories: [
            { name: 'Workflow Images', accept: 'image/*', icon: '⚙️', description: 'Process diagrams' },
            { name: 'Tutorials', accept: 'video/*,.pdf', icon: '🎥', description: 'How-to guides' },
            { name: 'Process Docs', accept: '.pdf,.doc,.docx', icon: '📋', description: 'Documentation' },
            { name: 'Videos', accept: 'video/*', icon: '🎬', description: 'Process videos' }
          ]
        };
      case '/testimonials':
        return {
          title: 'Content Management',
          sectionTitle: 'Testimonials',
          description: 'Upload client testimonials and reviews',
          categories: [
            { name: 'Client Photos', accept: 'image/*', icon: '👥', description: 'Client headshots' },
            { name: 'Testimonial Letters', accept: '.pdf,.doc,.docx', icon: '💌', description: 'Written testimonials' },
            { name: 'Project Images', accept: 'image/*', icon: '🖼️', description: 'Project screenshots' }
          ]
        };
      case '/shop':
        return {
          title: 'Content Management',
          sectionTitle: 'Shop Assets',
          description: 'Upload product images and digital goods',
          categories: [
            { name: 'Product Images', accept: 'image/*', icon: '🛍️', description: 'Product photos' },
            { name: 'Digital Downloads', accept: '.zip,.rar,.pdf', icon: '📦', description: 'Downloadable files' },
            { name: 'Previews', accept: 'image/*,video/*', icon: '👀', description: 'Product previews' },
            { name: 'Assets', accept: '*/*', icon: '📁', description: 'Additional assets' }
          ]
        };
      case '/links':
        return {
          title: 'Content Management',
          sectionTitle: 'Link Assets',
          description: 'Upload social media and link icons',
          categories: [
            { name: 'Social Icons', accept: 'image/*,.ico,.png', icon: '🔗', description: 'Social media icons' },
            { name: 'Platform Logos', accept: 'image/*,.ico,.png', icon: '🌐', description: 'Platform logos' },
            { name: 'Link Images', accept: 'image/*', icon: '📎', description: 'Link thumbnails' }
          ]
        };
      default:
        return {
          title: 'Content Management',
          sectionTitle: 'General Upload',
          description: 'Upload files for this page',
          categories: [
            { name: 'General Files', accept: '*/*', icon: '📁', description: 'Any file type' }
          ]
        };
    }
  };

  const uploadOptions = getUploadOptions();

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);

    const newUploads = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toLocaleString(),
      file: file // Keep reference to original file
    }));

    await addUploadedFiles(currentPage, newUploads);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Log upload for development purposes
    console.log(`Uploaded ${files.length} files to ${currentPage}:`, newUploads);
  };

  const removeFile = (fileId) => {
    removeUploadedFile(currentPage, fileId);
  };

  const downloadFile = (file) => {
    if (file.dataUrl) {
      // Create download link for base64 data
      const link = document.createElement('a');
      link.href = file.dataUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (file.url) {
      // Fallback for blob URLs
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const currentUploads = getUploadedFiles(currentPage);

  const handleCategoryUpload = async (category) => {
    // Create a temporary file input for this category
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = category.accept;
    input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);

      // Upload each file to Cloudinary
      const uploadPromises = files.map(async (file, index) => {
        try {
          // Upload to Cloudinary
          const cloudinaryResult = await uploadToCloudinary(file, `portfolio/${category.name.toLowerCase().replace(/\s+/g, '-')}`);

          return {
            id: Date.now() + index,
            name: file.name,
            size: file.size,
            type: file.type,
            category: category.name,
            uploadedAt: new Date().toLocaleString(),
            url: cloudinaryResult.url,
            publicId: cloudinaryResult.publicId,
            cloudinary: true
          };
        } catch (error) {
          console.error(`Failed to upload ${file.name} to Cloudinary:`, error);
          // Fallback to local storage
          return {
            id: Date.now() + index,
            name: file.name,
            size: file.size,
            type: file.type,
            category: category.name,
            uploadedAt: new Date().toLocaleString(),
            file: file,
            uploadError: error.message
          };
        }
      });

      const newUploads = await Promise.all(uploadPromises);
      const uploadedFiles = await addUploadedFiles(currentPage, newUploads);

      // Auto-enable slideshow and select images for Hero Images on homepage
      if (currentPage === '/' && category.name === 'Hero Images' && uploadedFiles.length > 0) {
        toggleSlideshowEnabled(currentPage, 'Hero Images');
        uploadedFiles.forEach(file => {
          if (file.type.startsWith('image/')) {
            toggleSlideshowImage(currentPage, 'Hero Images', file.id);
          }
        });
      }

      console.log(`Uploaded ${files.length} files to ${currentPage} - ${category.name}:`, newUploads);
    };
    input.click();
  };

  const handleSelectImage = (categoryName, imageId) => {
    selectImage(currentPage, categoryName, imageId);

    // Log selection for development
    const selectedFile = currentUploads.find(file => file.id === imageId);
    if (selectedFile) {
      console.log(`Selected image: ${selectedFile.name} (${selectedFile.category}) for ${currentPage}`);
    }
  };

  return (
    <div className="content-upload-section">
      <h4>{uploadOptions.sectionTitle}</h4>
      <p className="upload-description">{uploadOptions.description}</p>

      <div className="upload-categories">
        {uploadOptions.categories.map((category, index) => (
          <div key={index} className="category-section">
            <button
              className="category-upload-btn"
              onClick={() => handleCategoryUpload(category)}
              title={category.description}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
              <span className="category-desc">{category.description}</span>
            </button>

            <CollapsibleGallery
              category={category}
              files={currentUploads}
              onSelectImage={(imageId) => handleSelectImage(category.name, imageId)}
              selectedImage={getSelectedImage(currentPage, category.name)?.id}
            />
          </div>
        ))}
      </div>

      {currentUploads.length > 0 && (
        <div className="uploaded-files">
          <h5>Uploaded Files ({currentUploads.length})</h5>
          <div className="file-list">
            {currentUploads.map(file => (
              <div key={file.id} className="file-item">
                <div className="file-info">
                  {file.type.startsWith('image/') && (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="file-preview"
                    />
                  )}
                  <div className="file-details">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <span className="file-date">{file.uploadedAt}</span>
                    {file.category && (
                      <span className="file-category">{file.category}</span>
                    )}
                    {file.folder && (
                      <span className="file-folder">📁 {file.folder}</span>
                    )}
                  </div>
                </div>
                <div className="file-actions">
                  <button
                    className="download-file-btn"
                    onClick={() => downloadFile(file)}
                    title="Download file"
                  >
                    ⬇️
                  </button>
                  <button
                    className="remove-file-btn"
                    onClick={() => removeFile(file.id)}
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Slideshow Section */}
      {currentUploads.length > 0 && (
        <div className="image-slideshow-section">
          <h5>Image Slideshow ({currentUploads.filter(file => file.type.startsWith('image/')).length} images)</h5>
          <ImageSlideshow images={currentUploads.filter(file => file.type.startsWith('image/'))} />
        </div>
      )}

      <div className="upload-stats">
        <small>
          {currentUploads.length} files uploaded •
          Total size: {(currentUploads.reduce((total, file) => total + file.size, 0) / 1024 / 1024).toFixed(2)} MB
        </small>
      </div>
    </div>
  );
}

export default ContentUploadSection;

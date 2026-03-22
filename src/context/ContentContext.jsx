import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  storeFile,
  getFilesByPage,
  getFilesByCategory,
  deleteFile,
  storeMetadata,
  getMetadata
} from '../utils/indexedDB';

const ContentContext = createContext();

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

export const ContentProvider = ({ children }) => {
  // In-memory store for original files (for recreating blob URLs)
  const [fileStore, setFileStore] = useState(new Map());

  // Store uploaded files by page and category with persistent data
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [selectedImages, setSelectedImages] = useState({});
  const [slideshowSettings, setSlideshowSettings] = useState({});
  const [textContent, setTextContent] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load data from IndexedDB on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load all files from IndexedDB and group by page
        const allFiles = await getFilesByPage(); // This returns all files
        const filesByPage = {};

        // Group files by page
        allFiles.forEach(file => {
          if (!filesByPage[file.page]) {
            filesByPage[file.page] = [];
          }
          // Ensure data URL is set as display URL
          if (file.dataUrl) {
            file.url = file.dataUrl;
          }
          filesByPage[file.page].push(file);
        });

        setUploadedFiles(filesByPage);

        // Load metadata
        const savedSelectedImages = await getMetadata('selectedImages');
        if (savedSelectedImages) {
          setSelectedImages(savedSelectedImages);
        }

        const savedSlideshowSettings = await getMetadata('slideshowSettings');
        if (savedSlideshowSettings) {
          setSlideshowSettings(savedSlideshowSettings);
        }

        const savedTextContent = await getMetadata('textContent');
        if (savedTextContent) {
          setTextContent(savedTextContent);
        }

        // Removed console.log to prevent spam
      } catch (error) {
        console.error('Error loading data from IndexedDB:', error);
        // Fallback to localStorage for migration
        try {
          const localFiles = localStorage.getItem('uploadedFiles');
          if (localFiles) {
            const parsed = JSON.parse(localFiles);
            setUploadedFiles(parsed);
          }

          const localSelected = localStorage.getItem('selectedImages');
          if (localSelected) {
            setSelectedImages(JSON.parse(localSelected));
          }

          const localSlideshow = localStorage.getItem('slideshowSettings');
          if (localSlideshow) {
            setSlideshowSettings(JSON.parse(localSlideshow));
          }
        } catch (fallbackError) {
          console.error('Fallback to localStorage also failed:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save uploadedFiles to IndexedDB whenever it changes
  useEffect(() => {
    if (!isLoading) {
      // Files are already saved individually in addUploadedFiles
      // This effect is mainly for consistency
    }
  }, [uploadedFiles, isLoading]);

  // Save selectedImages to IndexedDB whenever it changes
  useEffect(() => {
    if (!isLoading) {
      storeMetadata('selectedImages', selectedImages).catch(error => {
        console.error('Error saving selectedImages to IndexedDB:', error);
      });
    }
  }, [selectedImages, isLoading]);

  // Save slideshowSettings to IndexedDB whenever it changes
  useEffect(() => {
    if (!isLoading) {
      storeMetadata('slideshowSettings', slideshowSettings).catch(error => {
        console.error('Error saving slideshowSettings to IndexedDB:', error);
      });
    }
  }, [slideshowSettings, isLoading]);

  // Save textContent to IndexedDB whenever it changes
  useEffect(() => {
    if (!isLoading) {
      storeMetadata('textContent', textContent).catch(error => {
        console.error('Error saving textContent to IndexedDB:', error);
      });
    }
  }, [textContent, isLoading]);

  // Convert file to blob URL for display (more efficient for large files)
  const fileToBlobUrl = (file) => {
    return URL.createObjectURL(file);
  };

  // Convert file to base64 data URL for persistence
  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  // Add uploaded files
  const addUploadedFiles = async (page, files) => {
    try {
      const filesWithUrls = await Promise.all(
        files.map(async (file) => {
          const originalFile = file.file || file;
          const dataUrl = await fileToDataUrl(originalFile);

          // Create file object for IndexedDB storage
          const fileData = {
            id: file.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            category: file.category,
            page: page,
            dataUrl: dataUrl,
            url: dataUrl, // Use data URL for display
            folder: getCategoryFolder(file.category),
            size: originalFile.size,
            type: originalFile.type,
            lastModified: originalFile.lastModified,
            uploadedAt: Date.now()
          };

          // Store in IndexedDB
          await storeFile(fileData);

          return fileData;
        })
      );

      // Update state
      setUploadedFiles(prev => ({
        ...prev,
        [page]: [...(prev[page] || []), ...filesWithUrls]
      }));

      return filesWithUrls;

    } catch (error) {
      console.error('Error storing files in IndexedDB:', error);

      // Fallback: still update state even if IndexedDB fails
      const filesWithUrls = await Promise.all(
        files.map(async (file) => {
          const originalFile = file.file || file;
          const dataUrl = await fileToDataUrl(originalFile);

          return {
            ...file,
            id: file.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            dataUrl,
            url: dataUrl,
            folder: getCategoryFolder(file.category),
            storageWarning: 'Failed to save permanently - may not persist after restart'
          };
        })
      );

      setUploadedFiles(prev => ({
        ...prev,
        [page]: [...(prev[page] || []), ...filesWithUrls]
      }));

      return filesWithUrls;
    }
  };

  // Get folder path for category
  const getCategoryFolder = (category) => {
    const folderMap = {
      'Hero Images': 'hero-images',
      'Background Images': 'background-images',
      'Logo/Icon': 'logo-icons',
      'Digital Paintings': '2d-art/digital-paintings',
      'Illustrations': '2d-art/illustrations',
      'Concept Art': '2d-art/concept-art',
      'Sketches': '2d-art/sketches',
      '3D Renders': '3d-art/renders',
      'Model Files': '3d-art/models',
      'Textures': '3d-art/textures',
      'Project Files': '3d-art/projects',
      'Full Tracks': 'music/full-tracks',
      'Demos': 'music/demos',
      'Stems': 'music/stems',
      'Loops': 'music/loops',
      'Blog Posts': 'blog/posts',
      'Articles': 'blog/articles',
      'Images': 'blog/images',
      'Documents': 'blog/documents',
      'Profile Photos': 'about/profile-photos',
      'Resume/CV': 'about/resume',
      'Portfolio PDFs': 'about/portfolio',
      'Certificates': 'about/certificates',
      'Resume PDF': 'resume/pdf',
      'Cover Letter': 'resume/cover-letter',
      'Portfolio': 'resume/portfolio',
      'References': 'resume/references',
      'Profile Images': 'contact/profile-images',
      'Business Cards': 'contact/business-cards',
      'Contact Photos': 'contact/photos',
      'Workflow Images': 'process/workflow-images',
      'Tutorials': 'process/tutorials',
      'Process Docs': 'process/docs',
      'Videos': 'process/videos',
      'Client Photos': 'testimonials/client-photos',
      'Testimonial Letters': 'testimonials/letters',
      'Project Images': 'testimonials/project-images',
      'Product Images': 'shop/product-images',
      'Digital Downloads': 'shop/downloads',
      'Previews': 'shop/previews',
      'Assets': 'shop/assets',
      'Social Icons': 'links/social-icons',
      'Platform Logos': 'links/platform-logos',
      'Link Images': 'links/images'
    };
    return folderMap[category] || 'general';
  };

  // Remove uploaded file
  const removeUploadedFile = async (page, fileId) => {
    try {
      // Delete from IndexedDB first
      await deleteFile(fileId);
    } catch (error) {
      console.error('Error deleting file from IndexedDB:', error);
      // Continue with state update even if IndexedDB delete fails
    }

    // Update state
    setUploadedFiles(prev => {
      const pageFiles = prev[page] || [];
      const fileToRemove = pageFiles.find(file => file.id === fileId);

      // Clean up the object URL if it exists
      if (fileToRemove && fileToRemove.url) {
        URL.revokeObjectURL(fileToRemove.url);
      }

      return {
        ...prev,
        [page]: pageFiles.filter(file => file.id !== fileId)
      };
    });

    // Also remove from selected images if it was selected
    setSelectedImages(prev => {
      const pageSelections = prev[page] || {};
      const updatedSelections = { ...pageSelections };

      // Remove the file from any category selections
      Object.keys(updatedSelections).forEach(category => {
        if (updatedSelections[category] === fileId) {
          delete updatedSelections[category];
        }
      });

      return {
        ...prev,
        [page]: updatedSelections
      };
    });
  };

  // Select an image for a specific page and category
  const selectImage = (page, category, fileId) => {
    setSelectedImages(prev => ({
      ...prev,
      [page]: {
        ...(prev[page] || {}),
        [category]: fileId
      }
    }));
  };

  // Get selected image for a specific page and category
  const getSelectedImage = (page, category) => {
    const pageSelections = selectedImages[page] || {};
    const selectedFileId = pageSelections[category];

    if (!selectedFileId) return null;

    const pageFiles = uploadedFiles[page] || [];
    return pageFiles.find(file => file.id === selectedFileId) || null;
  };

  // Get all uploaded files for a page
  const getUploadedFiles = (page) => {
    return uploadedFiles[page] || [];
  };

  // Get uploaded files for a specific category on a page
  const getCategoryFiles = (page, category) => {
    return (uploadedFiles[page] || []).filter(file => file.category === category);
  };

  // Slideshow management functions
  const setSlideshowMode = (page, category, mode) => {
    setSlideshowSettings(prev => ({
      ...prev,
      [page]: {
        ...(prev[page] || {}),
        [category]: {
          ...(prev[page]?.[category] || { mode: 'gallery', enabled: false, images: [] }),
          mode
        }
      }
    }));
  };

  const toggleSlideshowEnabled = (page, category) => {
    setSlideshowSettings(prev => ({
      ...prev,
      [page]: {
        ...(prev[page] || {}),
        [category]: {
          ...(prev[page]?.[category] || { mode: 'gallery', enabled: false, images: [] }),
          enabled: !(prev[page]?.[category]?.enabled || false)
        }
      }
    }));
  };

  const toggleSlideshowImage = (page, category, imageId) => {
    setSlideshowSettings(prev => {
      const currentSettings = prev[page]?.[category] || { mode: 'gallery', enabled: false, images: [] };
      const images = currentSettings.images || [];
      const isSelected = images.includes(imageId);

      return {
        ...prev,
        [page]: {
          ...(prev[page] || {}),
          [category]: {
            ...currentSettings,
            images: isSelected
              ? images.filter(id => id !== imageId)
              : [...images, imageId]
          }
        }
      };
    });
  };

  const getSlideshowSettings = (page, category) => {
    return slideshowSettings[page]?.[category] || { mode: 'gallery', enabled: false, images: [] };
  };

  const getEnabledSlideshows = (page) => {
    const pageSettings = slideshowSettings[page] || {};
    return Object.entries(pageSettings)
      .filter(([category, settings]) => settings.enabled)
      .map(([category, settings]) => ({
        category,
        images: settings.images || []
      }));
  };

  // Text content management functions
  const getTextContent = (contentKey) => {
    return textContent[contentKey] || '';
  };

  const updateTextContent = (contentKey, value) => {
    setTextContent(prev => ({
      ...prev,
      [contentKey]: value
    }));
  };

  const getAllTextContent = () => {
    return textContent;
  };

  const resetTextContent = (contentKey) => {
    setTextContent(prev => {
      const newContent = { ...prev };
      delete newContent[contentKey];
      return newContent;
    });
  };

  const value = {
    uploadedFiles,
    selectedImages,
    slideshowSettings,
    textContent,
    addUploadedFiles,
    removeUploadedFile,
    selectImage,
    getSelectedImage,
    getUploadedFiles,
    getCategoryFiles,
    setSlideshowMode,
    toggleSlideshowEnabled,
    toggleSlideshowImage,
    getSlideshowSettings,
    getEnabledSlideshows,
    getTextContent,
    updateTextContent,
    getAllTextContent,
    resetTextContent
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

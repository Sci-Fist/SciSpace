import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
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
  const [bootstrappedPages, setBootstrappedPages] = useState({});
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
        if (savedSelectedImages) setSelectedImages(savedSelectedImages);

        const savedSlideshowSettings = await getMetadata('slideshowSettings');
        if (savedSlideshowSettings) setSlideshowSettings(savedSlideshowSettings);

        const savedTextContent = await getMetadata('textContent');
        if (savedTextContent) setTextContent(savedTextContent);

        const savedBootstrapped = await getMetadata('bootstrappedPages');
        if (savedBootstrapped) setBootstrappedPages(savedBootstrapped);

      } catch (error) {
        console.error('Error loading data from IndexedDB:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save metadata to IndexedDB
  const saveQueueRef = useRef(new Map());
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (isLoading) return;

    const metadataToSave = {
      selectedImages,
      slideshowSettings,
      textContent,
      bootstrappedPages
    };

    Object.entries(metadataToSave).forEach(([key, value]) => {
      saveQueueRef.current.set(key, value);
    });

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      const queue = new Map(saveQueueRef.current);
      saveQueueRef.current.clear();

      for (const [key, value] of queue) {
        try {
          await storeMetadata(key, value);
        } catch (error) {
          console.error(`Error saving ${key} to IndexedDB:`, error);
        }
      }
    }, 100);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [selectedImages, slideshowSettings, textContent, bootstrappedPages, isLoading]);

  // Convert file to data URL for persistence
  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  /**
   * Register Page Media (Bootstrapping)
   * Always syncs bootstrapped items from latest code defaults.
   * Custom uploaded items are preserved.
   * This ensures stale/broken default URLs are always corrected.
   */
  const registerPageMedia = useCallback(async (page, defaultItems) => {
    if (isLoading) return;

    const existingFiles = uploadedFiles[page] || [];

    // Separate user-uploaded files from bootstrapped defaults
    const userUploads = existingFiles.filter(f => !f.isBootstrapped);

    // Always re-create bootstrapped items from latest defaults
    const bootstrappedItems = defaultItems.map((item, index) => ({
      id: `boot-${page}-${index}`,
      name: item.title || item.alt || `Media ${index}`,
      title: item.title,
      alt: item.alt,
      category: item.category || 'General',
      page: page,
      src: item.src,
      url: item.src,
      size: 0,
      type: item.isVideo ? 'video/mp4' : 'image/jpeg',
      isBootstrapped: true,
      uploadedAt: Date.now()
    }));

    // Persist updated bootstrapped items to IndexedDB
    for (const item of bootstrappedItems) {
      try {
        await storeFile(item);
      } catch (e) {
        // Silent fail – state update below will still work
      }
    }

    // Merge: bootstrapped defaults + any user uploads
    const merged = [...bootstrappedItems, ...userUploads];

    setUploadedFiles(prev => ({
      ...prev,
      [page]: merged
    }));

    setBootstrappedPages(prev => ({
      ...prev,
      [page]: true
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Add uploaded files
  const addUploadedFiles = async (page, files) => {
    try {
      const filesWithUrls = await Promise.all(
        files.map(async (file) => {
          const originalFile = file.file || file;
          const dataUrl = await fileToDataUrl(originalFile);

          const fileData = {
            id: file.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            category: file.category,
            page: page,
            dataUrl: dataUrl,
            url: dataUrl,
            size: originalFile.size,
            type: originalFile.type,
            uploadedAt: Date.now()
          };

          await storeFile(fileData);
          return fileData;
        })
      );

      setUploadedFiles(prev => ({
        ...prev,
        [page]: [...(prev[page] || []), ...filesWithUrls]
      }));

      return filesWithUrls;
    } catch (error) {
      console.error('Error storing files in IndexedDB:', error);
      return [];
    }
  };

  // Update a media item's metadata
  const updateMediaItem = async (page, fileId, updates) => {
    const pageFiles = uploadedFiles[page] || [];
    const fileIndex = pageFiles.findIndex(f => f.id === fileId);
    
    if (fileIndex === -1) return;

    const updatedFile = { ...pageFiles[fileIndex], ...updates };
    
    // Persist to IndexedDB
    await storeFile(updatedFile);

    // Update state
    setUploadedFiles(prev => {
      const newFiles = [...(prev[page] || [])];
      newFiles[fileIndex] = updatedFile;
      return { ...prev, [page]: newFiles };
    });
  };

  // Remove uploaded file
  const removeUploadedFile = async (page, fileId) => {
    try {
      await deleteFile(fileId);
    } catch (error) {
      console.error('Error deleting file from IndexedDB:', error);
    }

    setUploadedFiles(prev => ({
      ...prev,
      [page]: (prev[page] || []).filter(file => file.id !== fileId)
    }));
  };

  // Getters
  const getUploadedFiles = (page) => uploadedFiles[page] || [];
  
  const getGalleryMedia = (page) => {
    // Return all media for this page (bootstrapped + uploaded)
    // Map internal schema to page-friendly schema
    return (uploadedFiles[page] || []).map(file => ({
      id: file.id,
      src: file.url || file.src,
      alt: file.alt || file.name,
      title: file.title || file.name,
      category: file.category,
      isVideo: file.type?.startsWith('video/')
    }));
  };

  const selectImage = (page, category, fileId) => {
    setSelectedImages(prev => ({
      ...prev,
      [page]: { ...(prev[page] || {}), [category]: fileId }
    }));
  };

  const getSelectedImage = (page, category) => {
    const pageSelections = selectedImages[page] || {};
    const selectedFileId = pageSelections[category];
    if (!selectedFileId) return null;
    return (uploadedFiles[page] || []).find(file => file.id === selectedFileId) || null;
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
      const current = prev[page]?.[category] || { mode: 'gallery', enabled: false, images: [] };
      const images = current.images || [];
      const isSelected = images.includes(imageId);

      return {
        ...prev,
        [page]: {
          ...(prev[page] || {}),
          [category]: {
            ...current,
            images: isSelected ? images.filter(id => id !== imageId) : [...images, imageId]
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
      .filter(([, settings]) => settings.enabled)
      .map(([category, settings]) => ({
        category,
        images: settings.images || []
      }));
  };

  const getCategoryFiles = (page, category) => {
    return (uploadedFiles[page] || []).filter(file => file.category === category);
  };

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

  const value = {
    isLoading,
    uploadedFiles,
    selectedImages,
    slideshowSettings,
    registerPageMedia,
    getGalleryMedia,
    updateMediaItem,
    addUploadedFiles,
    removeUploadedFile,
    selectImage,
    getSelectedImage,
    getUploadedFiles,
    getCategoryFiles,
    getEnabledSlideshows,
    setSlideshowMode,
    toggleSlideshowEnabled,
    toggleSlideshowImage,
    getSlideshowSettings,
    getTextContent: (key) => textContent[key] || '',
    updateTextContent: (key, value) => setTextContent(prev => ({ ...prev, [key]: value })),
    resetTextContent: (key) => setTextContent(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    })
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

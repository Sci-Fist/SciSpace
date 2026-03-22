/**
 * SlideshowContext - Thin wrapper around ContentContext
 * 
 * This context re-exports slideshow-related functionality from ContentContext
 * to maintain backward compatibility while eliminating duplicate state management.
 * 
 * All slideshow state (selectedImages, slideshowSettings) is managed by ContentContext.
 */
import { useContent } from './ContentContext.jsx';

// Re-export the hook with the same API
export const useSlideshow = () => {
  const content = useContent();
  
  return {
    selectedImages: content.selectedImages,
    slideshowSettings: content.slideshowSettings,
    isLoading: content.isLoading,
    selectImage: content.selectImage,
    getSelectedImage: content.getSelectedImage,
    setSlideshowMode: content.setSlideshowMode,
    toggleSlideshowEnabled: content.toggleSlideshowEnabled,
    toggleSlideshowImage: content.toggleSlideshowImage,
    getSlideshowSettings: content.getSlideshowSettings,
    getEnabledSlideshows: content.getEnabledSlideshows
  };
};

// No-op provider - ContentContext handles everything
export const SlideshowProvider = ({ children }) => children;
/**
 * FileManagerContext - Thin wrapper around ContentContext
 * 
 * This context re-exports file management functionality from ContentContext
 * to maintain backward compatibility while eliminating duplicate state management.
 * 
 * All file state (uploadedFiles) is managed by ContentContext.
 */
import { useContent } from './ContentContext.jsx';

// Re-export the hook with the same API
export const useFileManager = () => {
  const content = useContent();
  
  return {
    uploadedFiles: content.uploadedFiles,
    isLoading: content.isLoading,
    addUploadedFiles: content.addUploadedFiles,
    removeUploadedFile: content.removeUploadedFile,
    getUploadedFiles: content.getUploadedFiles,
    getCategoryFiles: content.getCategoryFiles
  };
};

// No-op provider - ContentContext handles everything
export const FileManagerProvider = ({ children }) => children;
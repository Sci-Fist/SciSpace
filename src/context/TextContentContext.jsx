/**
 * TextContentContext - Thin wrapper around ContentContext
 * 
 * This context re-exports text content functionality from ContentContext
 * to maintain backward compatibility while eliminating duplicate state management.
 * 
 * All text content state is managed by ContentContext.
 */
import { useContent } from './ContentContext.jsx';

// Re-export the hook with the same API
export const useTextContent = () => {
  const content = useContent();
  
  return {
    textContent: content.textContent,
    isLoading: content.isLoading,
    getTextContent: content.getTextContent,
    updateTextContent: content.updateTextContent,
    getAllTextContent: content.getAllTextContent,
    resetTextContent: content.resetTextContent
  };
};

// No-op provider - ContentContext handles everything
export const TextContentProvider = ({ children }) => children;
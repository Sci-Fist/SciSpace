import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Main store combining all state management
export const useStore = create(
  subscribeWithSelector((set, get) => ({
    // Theme State
    theme: 'dark',
    toggleTheme: () => set((state) => ({
      theme: state.theme === 'dark' ? 'light' : 'dark'
    })),

    // Dev Tools State
    isDevMode: false,
    isSidebarOpen: false,
    isMobileView: false,
    sidebarWidth: 300,
    setDevMode: (isDevMode) => set({ isDevMode }),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setMobileView: (isMobileView) => set({ isMobileView }),
    setSidebarWidth: (width) => set({ sidebarWidth: width }),

    // Page State
    currentPage: '/',
    pageControls: {},
    updatePageControl: (pagePath, key, value) => set((state) => ({
      pageControls: {
        ...state.pageControls,
        [pagePath]: {
          ...state.pageControls[pagePath],
          [key]: value
        }
      }
    })),
    getPageControls: (pagePath) => {
      const state = get();
      return state.pageControls[pagePath] || {};
    },
    setCurrentPage: (page) => set({ currentPage: page }),

    // Content State
    content: {},
    updateContent: (key, value) => set((state) => ({
      content: {
        ...state.content,
        [key]: value
      }
    })),
    getContent: (key) => {
      const state = get();
      return state.content[key];
    },

    // Now Playing State
    nowPlaying: null,
    isPlaying: false,
    volume: 1,
    setNowPlaying: (track) => set({ nowPlaying: track }),
    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
    setVolume: (volume) => set({ volume }),

    // Slideshow State
    selectedImages: {},
    setSelectedImage: (page, category, image) => set((state) => ({
      selectedImages: {
        ...state.selectedImages,
        [page]: {
          ...state.selectedImages[page],
          [category]: image
        }
      }
    })),
    getSelectedImage: (page, category) => {
      const state = get();
      return state.selectedImages[page]?.[category];
    },

    // Text Content State (unified with Content)
    getTextContent: (key) => {
      const state = get();
      return state.content[key];
    },
    updateTextContent: (key, value) => set((state) => ({
      content: {
        ...state.content,
        [key]: value
      }
    })),

    // Logger State
    logs: [],
    addLog: (log) => set((state) => ({
      logs: [...state.logs, { ...log, timestamp: Date.now() }]
    })),
    clearLogs: () => set({ logs: [] }),

    // File Management State
    files: {},
    addFile: (file) => set((state) => ({
      files: {
        ...state.files,
        [file.id]: file
      }
    })),
    removeFile: (fileId) => set((state) => {
      const newFiles = { ...state.files };
      delete newFiles[fileId];
      return { files: newFiles };
    }),
    getFiles: () => {
      const state = get();
      return Object.values(state.files);
    }
  }))
);

// Selectors for better performance
export const useTheme = () => useStore((state) => state.theme);
export const useDevTools = () => useStore((state) => ({
  isDevMode: state.isDevMode,
  isSidebarOpen: state.isSidebarOpen,
  isMobileView: state.isMobileView,
  sidebarWidth: state.sidebarWidth,
  setDevMode: state.setDevMode,
  toggleSidebar: state.toggleSidebar,
  setMobileView: state.setMobileView,
  setSidebarWidth: state.setSidebarWidth
}));

export const usePage = () => useStore((state) => ({
  currentPage: state.currentPage,
  pageControls: state.pageControls,
  updatePageControl: state.updatePageControl,
  getPageControls: state.getPageControls,
  setCurrentPage: state.setCurrentPage
}));

export const useContent = () => useStore((state) => ({
  content: state.content,
  updateContent: state.updateContent,
  getContent: state.getContent
}));

export const useNowPlaying = () => useStore((state) => ({
  nowPlaying: state.nowPlaying,
  isPlaying: state.isPlaying,
  volume: state.volume,
  setNowPlaying: state.setNowPlaying,
  togglePlay: state.togglePlay,
  setVolume: state.setVolume
}));

export const useSlideshow = () => useStore((state) => ({
  selectedImages: state.selectedImages,
  setSelectedImage: state.setSelectedImage,
  getSelectedImage: state.getSelectedImage
}));

export const useTextContent = () => useStore((state) => ({
  getTextContent: state.getTextContent,
  updateTextContent: state.updateTextContent
}));

export const useLogger = () => useStore((state) => ({
  logs: state.logs,
  addLog: state.addLog,
  clearLogs: state.clearLogs
}));

export const useFileManager = () => useStore((state) => ({
  files: state.files,
  addFile: state.addFile,
  removeFile: state.removeFile,
  getFiles: state.getFiles
}));
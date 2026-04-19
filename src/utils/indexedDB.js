// IndexedDB utilities for persistent file storage
// Provides much larger storage capacity than localStorage (~50MB+ vs ~5-10MB)

const DB_NAME = 'PortfolioContentDB';
const DB_VERSION = 1;
const FILES_STORE = 'uploadedFiles';
const METADATA_STORE = 'fileMetadata';

// Initialize IndexedDB with singleton pattern to prevent race conditions
let dbPromise = null;

const initDB = () => {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB initialization failed:', request.error);
      dbPromise = null; // Reset promise to allow retry
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        const filesStore = db.createObjectStore(FILES_STORE, { keyPath: 'id' });
        filesStore.createIndex('page', 'page', { unique: false });
        filesStore.createIndex('category', 'category', { unique: false });
      }

      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        db.createObjectStore(METADATA_STORE, { keyPath: 'key' });
      }
    };
  });

  return dbPromise;
};

// Store a file in IndexedDB
export const storeFile = async (fileData) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([FILES_STORE], 'readwrite');
    const store = transaction.objectStore(FILES_STORE);

    return new Promise((resolve, reject) => {
      const request = store.put(fileData);

      request.onsuccess = () => {
        resolve(fileData);
      };

      request.onerror = () => {
        console.error('Failed to store file in IndexedDB:', request.error);
        reject(request.error);
      };


    });
  } catch (error) {
    console.error('Error storing file in IndexedDB:', error);
    throw error;
  }
};

// Retrieve a file from IndexedDB
export const getFile = async (fileId) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([FILES_STORE], 'readonly');
    const store = transaction.objectStore(FILES_STORE);

    return new Promise((resolve, reject) => {
      const request = store.get(fileId);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('Failed to retrieve file from IndexedDB:', request.error);
        reject(request.error);
      };


    });
  } catch (error) {
    console.error('Error retrieving file from IndexedDB:', error);
    throw error;
  }
};

// Get all files for a specific page
export const getFilesByPage = async (page) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([FILES_STORE], 'readonly');
    const store = transaction.objectStore(FILES_STORE);
    const index = store.index('page');

    return new Promise((resolve, reject) => {
      const request = index.getAll(page);

      request.onsuccess = () => {
        const files = request.result || [];
        resolve(files);
      };

      request.onerror = () => {
        console.error('Failed to retrieve files by page from IndexedDB:', request.error);
        reject(request.error);
      };


    });
  } catch (error) {
    console.error('Error retrieving files by page from IndexedDB:', error);
    throw error;
  }
};

// Get all files for a specific category on a page
export const getFilesByCategory = async (page, category) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([FILES_STORE], 'readonly');
    const store = transaction.objectStore(FILES_STORE);

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        const allFiles = request.result || [];
        const categoryFiles = allFiles.filter(file =>
          file.page === page && file.category === category
        );
        resolve(categoryFiles);
      };

      request.onerror = () => {
        console.error('Failed to retrieve files by category from IndexedDB:', request.error);
        reject(request.error);
      };


    });
  } catch (error) {
    console.error('Error retrieving files by category from IndexedDB:', error);
    throw error;
  }
};

// Delete a file from IndexedDB
export const deleteFile = async (fileId) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([FILES_STORE], 'readwrite');
    const store = transaction.objectStore(FILES_STORE);

    return new Promise((resolve, reject) => {
      const request = store.delete(fileId);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to delete file from IndexedDB:', request.error);
        reject(request.error);
      };


    });
  } catch (error) {
    console.error('Error deleting file from IndexedDB:', error);
    throw error;
  }
};

// Store metadata (like selectedImages, slideshowSettings)
export const storeMetadata = async (key, data) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([METADATA_STORE], 'readwrite');
    const store = transaction.objectStore(METADATA_STORE);

    return new Promise((resolve, reject) => {
      const request = store.put({ key, data, timestamp: Date.now() });

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to store metadata in IndexedDB:', request.error);
        reject(request.error);
      };


    });
  } catch (error) {
    console.error('Error storing metadata in IndexedDB:', error);
    throw error;
  }
};

// Retrieve metadata
export const getMetadata = async (key) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([METADATA_STORE], 'readonly');
    const store = transaction.objectStore(METADATA_STORE);

    return new Promise((resolve, reject) => {
      const request = store.get(key);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('Failed to retrieve metadata from IndexedDB:', request.error);
        reject(request.error);
      };


    });
  } catch (error) {
    console.error('Error retrieving metadata from IndexedDB:', error);
    throw error;
  }
};

// Clear all data (for development/testing)
export const clearAllData = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([FILES_STORE, METADATA_STORE], 'readwrite');

    return new Promise((resolve, reject) => {
      const clearFiles = transaction.objectStore(FILES_STORE).clear();
      const clearMetadata = transaction.objectStore(METADATA_STORE).clear();

      let completed = 0;
      const checkComplete = () => {
        completed++;
        if (completed === 2) {
          resolve();
        }
      };

      clearFiles.onsuccess = checkComplete;
      clearMetadata.onsuccess = checkComplete;

      clearFiles.onerror = () => reject(clearFiles.error);
      clearMetadata.onerror = () => reject(clearMetadata.error);


    });
  } catch (error) {
    console.error('Error clearing IndexedDB data:', error);
    throw error;
  }
};

// Get storage usage info
export const getStorageInfo = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([FILES_STORE], 'readonly');
    const store = transaction.objectStore(FILES_STORE);

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        const files = request.result || [];
        const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
        const fileCount = files.length;

        resolve({ fileCount, totalSize });
      };

      request.onerror = () => {
        console.error('Failed to get storage info from IndexedDB:', request.error);
        reject(request.error);
      };


    });
  } catch (error) {
    console.error('Error getting storage info from IndexedDB:', error);
    throw error;
  }
};

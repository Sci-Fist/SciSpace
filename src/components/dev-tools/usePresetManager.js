import React, { useState, useEffect } from 'react';

function usePresetManager() {
  // Preset management state
  const [presets, setPresets] = useState(() => {
    const saved = localStorage.getItem('devPresets');
    return saved ? JSON.parse(saved) : {
      'Default': {}
    };
  });
  const [currentPreset, setCurrentPreset] = useState('Default');
  const [newPresetName, setNewPresetName] = useState('');

  // Save presets to localStorage
  useEffect(() => {
    localStorage.setItem('devPresets', JSON.stringify(presets));
  }, [presets]);

  // Preset management functions
  // These functions now accept necessary context/callbacks as arguments
  const saveCurrentAsPreset = (getPageControls, currentPage, updatePageControl, showNotification) => {
    const currentControls = getPageControls(currentPage);
    const newPreset = { ...currentControls };

    if (!newPresetName.trim()) {
      // If no name provided, save to current preset
      setPresets(prev => ({
        ...prev,
        [currentPreset]: newPreset
      }));
      showNotification(`Settings saved to "${currentPreset}" preset`);
    } else {
      // Save as new preset
      setPresets(prev => ({
        ...prev,
        [newPresetName]: newPreset
      }));
      setCurrentPreset(newPresetName);
      setNewPresetName('');
      showNotification(`New preset "${newPresetName}" created and saved`);
    }
  };

  const loadPreset = (presetName, currentPage, getPageControls, updatePageControl, showNotification) => {
    const preset = presets[presetName];
    if (preset) {
      Object.entries(preset).forEach(([key, value]) => {
        updatePageControl(currentPage, key, value);
      });
      setCurrentPreset(presetName);
      showNotification(`Preset "${presetName}" loaded`);
    }
  };

  const deletePreset = (presetName, showNotification, currentPage, setCurrentPreset, getPageControls, updatePageControl) => {
    if (presetName === 'Default') {
      showNotification('Cannot delete the default preset.', 'error');
      return; // Don't delete default
    }

    setPresets(prev => {
      const newPresets = { ...prev };
      delete newPresets[presetName];
      return newPresets;
    });

    if (currentPreset === presetName) {
      setCurrentPreset('Default');
      // Load default preset after deleting the current one
      loadPreset('Default', currentPage, getPageControls, updatePageControl, showNotification);
    }

    showNotification(`Preset "${presetName}" deleted`);
  };

  return {
    presets,
    currentPreset,
    newPresetName,
    setNewPresetName,
    // We don't expose setCurrentPreset directly as it's managed internally by load/save/delete
    saveCurrentAsPreset,
    loadPreset,
    deletePreset,
  };
}

export default usePresetManager;
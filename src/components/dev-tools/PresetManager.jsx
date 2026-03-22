import React, { useState, useEffect, useRef } from 'react';
import { usePage } from '../../context/PageContext.jsx';
import { useContent } from '../../context/ContentContext.jsx'; // Assuming presets might use ContentContext or similar
import { storeMetadata, getMetadata } from '../../../utils/indexedDB.js'; // Use IndexedDB for persistence

function PresetManager({
  currentPage,
  getPageControls,
  updatePageControl,
  showNotification
}) {
  const [presets, setPresets] = useState({}); // Store presets in state
  const [currentPresetName, setCurrentPresetName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const presetNameInputRef = useRef(null);

  const PRESET_METADATA_KEY = 'websitePresets';

  // Load presets from IndexedDB on mount
  useEffect(() => {
    const loadPresets = async () => {
      try {
        const savedPresets = await getMetadata(PRESET_METADATA_KEY);
        if (savedPresets) {
          setPresets(savedPresets);
          // If there's a 'lastSelected' preset, set it
          if (savedPresets.lastSelectedPreset) {
             setSelectedPreset(savedPresets.lastSelectedPreset);
          }
          showNotification('Presets loaded successfully.', 'info');
        }
      } catch (error) {
        console.error('Error loading presets:', error);
        showNotification('Failed to load presets', 'error');
      }
    };

    loadPresets();
  }, [showNotification]);

  // Save presets to IndexedDB whenever they change
  useEffect(() => {
    const savePresets = async () => {
      try {
        // Include the last selected preset name in the saved data
        await storeMetadata(PRESET_METADATA_KEY, { ...presets, lastSelectedPreset: selectedPreset });
        console.log('Presets saved to IndexedDB');
      } catch (error) {
        console.error('Error saving presets:', error);
        showNotification('Failed to save presets', 'error');
      }
    };

    // Only save if presets have actually been loaded/modified
    if (Object.keys(presets).length > 0 || selectedPreset) {
       savePresets();
    }
  }, [presets, selectedPreset]); // Depend on presets state and the last selected preset

  const handleSavePreset = () => {
    const presetName = currentPresetName.trim();
    if (!presetName) {
      showNotification('Please enter a name for the preset.', 'warning');
      return;
    }

    // Capture current page controls/settings
    const currentPageControls = getPageControls(currentPage);
    const presetData = {
      pageState: currentPageControls, // Save the state of controls for the current page
      savedAt: new Date().toISOString(),
    };

    setPresets(prev => {
      const newPresets = { ...prev, [presetName]: presetData };
      setCurrentPresetName(''); // Clear input after saving
      if (presetNameInputRef.current) {
        presetNameInputRef.current.value = ''; // Ensure input field is also cleared
      }
      showNotification(`Preset '${presetName}' saved.`, 'success');
      return newPresets;
    });
    setSelectedPreset(presetName); // Automatically select the newly saved preset
  };

  const handleLoadPreset = () => {
    if (!selectedPreset) {
      showNotification('Please select a preset to load.', 'warning');
      return;
    }

    const presetToLoad = presets[selectedPreset];
    if (!presetToLoad) {
      showNotification(`Preset '${selectedPreset}' not found.`, 'error');
      return;
    }

    // Apply the preset data to the current page controls.
    if (presetToLoad.pageState) {
      Object.keys(presetToLoad.pageState).forEach(controlKey => {
        // Use updatePageControl to restore the saved settings for each control
        updatePageControl(currentPage, controlKey, presetToLoad.pageState[controlKey]);
      });
      console.log(`Loaded preset '${selectedPreset}' for page '${currentPage}'`);
      showNotification(`Preset '${selectedPreset}' loaded successfully.`, 'success');
    } else {
      console.warn(`Preset '${selectedPreset}' has no pageState to load.`);
      showNotification(`Preset '${selectedPreset}' has no saved state.`, 'warning');
    }
    // Potentially trigger other updates based on loaded preset
  };

  const handleDeletePreset = () => {
    if (!selectedPreset) {
      showNotification('Please select a preset to delete.', 'warning');
      return;
    }

    if (window.confirm(`Are you sure you want to delete the preset '${selectedPreset}'?`)) {
      setPresets(prev => {
        const newPresets = { ...prev };
        delete newPresets[selectedPreset];
        // If the deleted preset was the last selected one, clear selection
        if (selectedPreset === presets.lastSelectedPreset) {
            setSelectedPreset('');
        }
        showNotification(`Preset '${selectedPreset}' deleted.`, 'success');
        return newPresets;
      });
    }
  };

  const handlePresetNameChange = (event) => {
    setCurrentPresetName(event.target.value);
  };

  const handlePresetSelectChange = (event) => {
    setSelectedPreset(event.target.value);
    setCurrentPresetName(event.target.value); // Pre-fill input for saving if user wants to rename/overwrite
  };

  // Dynamically get controls for the current page to potentially save their state
  // const currentPageControls = getPageControls(currentPage);
  // console.log('Current page controls for preset management:', currentPageControls);

  return (
    <div className="preset-manager">
      <h4>Preset Manager</h4>
      <div className="preset-controls">
        <div className="preset-input-group">
          <input
            ref={presetNameInputRef}
            type="text"
            placeholder="Preset Name"
            onChange={handlePresetNameChange}
            className="preset-name-input"
          />
          <button onClick={handleSavePreset} className="btn-save-preset">Save</button>
        </div>

        <div className="preset-selection-group">
          <select
            value={selectedPreset}
            onChange={handlePresetSelectChange}
            className="preset-select"
          >
            <option value="" disabled>Select a preset</option>
            {Object.keys(presets).filter(name => name !== 'lastSelectedPreset').length > 0 ? (
              Object.keys(presets).filter(name => name !== 'lastSelectedPreset').sort().map(presetName => (
                <option key={presetName} value={presetName}>
                  {presetName}
                </option>
              ))
            ) : (
              <option value="" disabled>No presets available</option>
            )}
          </select>
          <button onClick={handleLoadPreset} className="btn-load-preset" disabled={!selectedPreset || !presets[selectedPreset]}>Load</button>
          <button onClick={handleDeletePreset} className="btn-delete-preset" disabled={!selectedPreset || !presets[selectedPreset]}>Delete</button>
        </div>
      </div>
      <p className="preset-hint">Presets save the current configuration of page controls.</p>
    </div>
  );
}

export default PresetManager;
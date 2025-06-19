import { DEFAULT_SYSTEM_PROMPT } from './constants.js';

// Save advanced configuration settings
export const saveAdvancedSettings = async (settings) => {
  try {
    await chrome.storage.local.set({ advancedSettings: settings });
  } catch (error) {
    console.error('Failed to save advanced settings:', error);
  }
};

// Load advanced configuration settings
export const loadAdvancedSettings = async () => {
  try {
    const result = await chrome.storage.local.get('advancedSettings');
    return result.advancedSettings || {
      model: 'llama3-70b-8192',
      temperature: 0.7,
      maxTokens: 1024,
      localModelUrl: 'http://localhost:8000/v1/chat/completions',
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      isAdvancedVisible: false
    };
  } catch (error) {
    console.error('Failed to load advanced settings:', error);
    return {
      model: 'llama3-70b-8192',
      temperature: 0.7,
      maxTokens: 1024,
      localModelUrl: 'http://localhost:8000/v1/chat/completions',
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      isAdvancedVisible: false
    };
  }
};

// Save current settings from UI elements
export const saveCurrentSettings = (modelSelect, temperatureSlider, maxTokensInput, localModelUrlInput, systemPromptInput) => {
  saveAdvancedSettings({
    model: modelSelect.value,
    temperature: parseFloat(temperatureSlider.value),
    maxTokens: parseInt(maxTokensInput.value),
    localModelUrl: localModelUrlInput.value,
    systemPrompt: systemPromptInput.value
  });
};

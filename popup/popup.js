// Import utilities
import { getApiKey, saveApiKey, hasApiKey, hasWhisperApiKey } from '../utils/storage.js';
import { callApi, extractMarkdownResponse, getUsageStats, processStream } from '../utils/api.js';
import { markdownToHtml, applySyntaxHighlighting } from '../utils/markdown.js';
import { testLocalModelConnection, callLocalModelApi } from '../utils/localModel.js';
import { saveAdvancedSettings, loadAdvancedSettings, saveCurrentSettings } from '../utils/settings.js';
import { getProvider } from '../utils/providers.js';
import { getIpAddress } from '../utils/network.js';
import { updateKeyStatus, addCopyButtonsToCodeBlocks } from '../utils/ui.js';
import { initializeTabs } from '../utils/tabs.js';

// Initialize UI elements when the popup loads
document.addEventListener('DOMContentLoaded', async () => {
  // Get IP address
  const ipAddress = await getIpAddress();
  console.log('Using IP address:', ipAddress);

  // Initialize tabs
  initializeTabs();

  // const apiKeyStatus = document.getElementById('apiKeyStatus');
  const promptInput = document.getElementById('prompt-input');
  const submitButton = document.getElementById('submitPrompt');
  // const micButton = document.getElementById('micButton');
  const responseContainer = document.getElementById('responseContainer');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const usageStats = document.getElementById('usageStats');
  
  // Focus the prompt input when popup opens
  promptInput.focus();
  
  // Advanced configuration elements
  const temperatureSlider = document.getElementById('temperature');
  const temperatureValueDisplay = document.getElementById('temperature-value');
  const maxTokensInput = document.getElementById('max-tokens');
  const modelSelect = document.getElementById('model');
  const systemPromptInput = document.getElementById('system-prompt');
  const saveSettingsBtn = document.getElementById('save-settings');
  
  // local model settings
  const localModelUrlInput = document.getElementById('localModelUrl');
  const localModelUrlGroup = document.getElementById('localModelUrlGroup');
  const testLocalConnectionBtn = document.getElementById('testLocalConnection');
  const connectionStatus = document.getElementById('connectionStatus');
  
  // API Key elements
  const successIcon = document.getElementById('successIcon');
  const errorIcon = document.getElementById('errorIcon');
  const openaiKeyInput = document.getElementById('openaiKey');
  const anthropicKeyInput = document.getElementById('anthropicKey');
  const groqKeyInput = document.getElementById('groqKey');

  // Load saved settings
  const savedSettings = await loadAdvancedSettings();
  modelSelect.value = savedSettings.model;
  temperatureSlider.value = savedSettings.temperature;
  temperatureValueDisplay.textContent = savedSettings.temperature;
  maxTokensInput.value = savedSettings.maxTokens;
  localModelUrlInput.value = savedSettings.localModelUrl;
  systemPromptInput.value = savedSettings.systemPrompt;

  // Show/hide local model URL input based on model selection
  const updateLocalModelUrlVisibility = () => {
    if (modelSelect.value === 'local') {
      localModelUrlGroup.style.display = 'block';
    } else {
      localModelUrlGroup.style.display = 'none';
    }
  };

  // Update visibility when model selection changes
  modelSelect.addEventListener('change', updateLocalModelUrlVisibility);

  // Initial visibility check
  updateLocalModelUrlVisibility();

  // Save settings when they change
  const handleSettingsChange = () => {
    saveCurrentSettings(modelSelect, temperatureSlider, maxTokensInput, localModelUrlInput, systemPromptInput);
  };

  // Enable/disable send button based on prompt input
  promptInput.addEventListener("input", () => {
    submitButton.disabled = !promptInput.value.trim()
  })

  modelSelect.addEventListener('input', () => {
    updateLocalModelUrlVisibility();
    handleSettingsChange();
  });

  // Update temperature value display when slider changes
  temperatureSlider.addEventListener('input', function() {
    temperatureValueDisplay.textContent = this.value;
    handleSettingsChange();
  });

  maxTokensInput.addEventListener('change', handleSettingsChange);
  localModelUrlInput.addEventListener('change', () => {
    handleSettingsChange();
    // Set the localEndpoint to the input value
    window.localEndpoint = localModelUrlInput.value.trim();
  });
  systemPromptInput.addEventListener('change', handleSettingsChange);

  // Save API keys
  const apiKeyConfigs = [
    { input: openaiKeyInput, type: 'openai' },
    { input: anthropicKeyInput, type: 'anthropic' },
    { input: groqKeyInput, type: 'groq' }
  ];

  apiKeyConfigs.forEach(config => {
    console.log(`save${config.type.charAt(0).toUpperCase() + config.type.slice(1)}Key`)
    const saveButton = document.getElementById(`save${config.type.charAt(0).toUpperCase() + config.type.slice(1)}Key`);
    saveButton.addEventListener('click', () => {
      saveApiKey(config.input.value.trim(), config.type);
    });
  });

  // Test local model connection
  testLocalConnectionBtn.addEventListener('click', async () => {
    const url = localModelUrlInput.value.trim();
    
    if (!url) {
      console.log('Please enter a URL for the local model', 'error');
      connectionStatus.style.display = 'flex';
      successIcon.style.display = 'none';
      errorIcon.style.display = 'block';
      return;
    }

    try {
      testLocalConnectionBtn.disabled = true;
      testLocalConnectionBtn.textContent = 'Testing...';
      connectionStatus.style.display = 'flex';
      successIcon.style.display = 'none';

      const userPrompt = promptInput.value.trim()
      const response = await testLocalModelConnection(url, userPrompt)

      if (response.ok) {
        console.log('Connection successful!', 'success');
        successIcon.style.display = 'block';
        errorIcon.style.display = 'none';
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.log(`Connection failed: ${error.message}`, 'error');
      successIcon.style.display = 'none';
      errorIcon.style.display = 'block';
    } finally {
      testLocalConnectionBtn.disabled = false;
      testLocalConnectionBtn.textContent = 'Test Connection';
    }
  });

  // Get DOM elements
  const promptForm = document.getElementById('prompt-form');

  // Handle form submission
  promptForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userPrompt = promptInput.value.trim();
    if (!userPrompt) return;

    // Show loading indicator
    loadingIndicator.style.display = 'flex';
    responseContainer.style.display = 'none';
    submitButton.disabled = true;

    try {
      const settings = await loadAdvancedSettings();
      const model = settings.model;
      let response;

      if (model === 'local') {
        // Get the current settings including the local model URL
        if (!settings.localModelUrl) {
          throw new Error('No local model URL configured. Please set the URL in settings.');
        }

        // Use callLocalModelApi directly for local models
        response = await callLocalModelApi({
          prompt: userPrompt,
          model: model,
          temperature: parseFloat(temperatureSlider.value),
          maxTokens: parseInt(maxTokensInput.value),
          systemPrompt: systemPromptInput.value,
          stream: true,
          url: settings.localModelUrl
        });
      } else {
        const provider = getProvider(model);
        response = await callApi({
          provider,
          prompt: userPrompt,
          model: model,
          temperature: parseFloat(temperatureSlider.value),
          maxTokens: parseInt(maxTokensInput.value),
          systemPrompt: systemPromptInput.value
        });
      }

      const provider = getProvider(model);
      // Process the response
      const markdownResponse = extractMarkdownResponse(response, provider);
      console.log(markdownResponse)
      const htmlResponse = markdownToHtml(markdownResponse);
      responseContainer.innerHTML = htmlResponse;
      console.log(htmlResponse)
      applySyntaxHighlighting();
      addCopyButtonsToCodeBlocks();

      // Show usage stats if available
      const stats = getUsageStats(response, provider);
      if (stats) {
        usageStats.style.display = 'block';
        usageStats.innerHTML = `
          <div class="stats">
            <span class="model">${model}</span>
            <span>${stats.promptTokens} → ${stats.completionTokens} = ${stats.totalTokens}</span>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error:', error);
      responseContainer.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    } finally {
      loadingIndicator.style.display = 'none';
      responseContainer.style.display = 'block';
      submitButton.disabled = false;
    }
  });
});



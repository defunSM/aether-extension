/**
 * Utility functions for Chrome storage operations with encryption
 */
import { encrypt, decrypt } from './crypto.js';

const STORAGE_KEYS = {
  API_KEY: 'api_key',
  ENCRYPTION_KEY: 'encryption_key_id', // Used to identify the encryption key
  // Add other keys as needed
};

/**
 * Gets the encryption password from extension itself
 * This is a simple approach; for production, consider more sophisticated methods
 * @returns {Promise<string>} The encryption password
 */
const getEncryptionPassword = async () => {
  // First, try to get the extension's ID as a component of the password
  const extensionId = chrome.runtime.id;
  
  // Check if we have a stored encryption key ID
  const result = await new Promise(resolve => {
    chrome.storage.local.get([STORAGE_KEYS.ENCRYPTION_KEY], (data) => {
      resolve(data[STORAGE_KEYS.ENCRYPTION_KEY]);
    });
  });
  
  // If we have a stored key ID, use it
  if (result) {
    return `${extensionId}_${result}`;
  }
  
  // If not, generate a new random key ID, store it, and return the password
  const randomKeyId = Math.random().toString(36).substring(2, 15);
  await new Promise(resolve => {
    chrome.storage.local.set({ [STORAGE_KEYS.ENCRYPTION_KEY]: randomKeyId }, resolve);
  });
  
  return `${extensionId}_${randomKeyId}`;
};

/**
 * Gets the API key from Chrome's local storage and decrypts it
 * @returns {Promise<string|null>} The API key or null if not found
 */
const getApiKey = async (name) => {
  const encryptedApiKey = await new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.API_KEY + '_' + name], (result) => {
      resolve(result[STORAGE_KEYS.API_KEY + '_' + name] || null);
    });
  });
  
  if (!encryptedApiKey) return null;
  
  try {
    const password = await getEncryptionPassword();
    return await decrypt(encryptedApiKey, password);
  } catch (error) {
    console.error('Failed to decrypt API key:', error);
    return null;
  }
};

/**
 * Encrypts and saves the API key to Chrome's local storage
 * @param {string} apiKey - The API key to save
 * @returns {Promise<void>}
 */
const saveApiKey = async (apiKey, name) => {
  try {
    const password = await getEncryptionPassword();
    const encryptedApiKey = await encrypt(apiKey, password);
    
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEYS.API_KEY + '_' + name]: encryptedApiKey }, () => {
        resolve();
      });
    });
  } catch (error) {
    console.error('Failed to encrypt and save API key:', error);
    throw error;
  }
};

/**
 * Removes the API key from Chrome's local storage
 * @returns {Promise<void>}
 */
const removeApiKey = () => {
  return new Promise((resolve) => {
    chrome.storage.local.remove([STORAGE_KEYS.API_KEY], () => {
      resolve();
    });
  });
};

/**
 * Checks if an API key exists in storage
 * @returns {Promise<boolean>}
 */
const hasApiKey = async () => {
  const apiKey = await getApiKey();
  return apiKey !== null && apiKey !== undefined && apiKey !== '';
};

/**
 * Saves the Whisper API key to Chrome storage
 * @param {string} apiKey - The Whisper API key to save
 */
async function saveWhisperApiKey(apiKey) {
  try {
    await chrome.storage.local.set({ whisperApiKey: apiKey });
  } catch (error) {
    console.error('Failed to save Whisper API key:', error);
    throw error;
  }
}

/**
 * Retrieves the Whisper API key from Chrome storage
 * @returns {Promise<string>} The saved Whisper API key
 */
async function getWhisperApiKey() {
  try {
    const result = await chrome.storage.local.get('whisperApiKey');
    return result.whisperApiKey;
  } catch (error) {
    console.error('Failed to get Whisper API key:', error);
    return null;
  }
}

/**
 * Checks if a Whisper API key exists in Chrome storage
 * @returns {Promise<boolean>} True if a Whisper API key exists
 */
async function hasWhisperApiKey() {
  const apiKey = await getWhisperApiKey();
  return !!apiKey;
}

/**
 * Gets the local endpoint from storage
 * @returns {Promise<string>} The local endpoint URL
 */
async function getLocalEndpoint() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['localEndpoint'], (result) => {
      resolve(result.localEndpoint || 'http://localhost:8000/v1/chat/completions');
    });
  });
}

/**
 * Sets the local endpoint in storage
 * @param {string} endpoint - The local endpoint URL
 * @returns {Promise<void>}
 */
async function setLocalEndpoint(endpoint) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ localEndpoint: endpoint }, resolve);
  });
}

export {
  getApiKey,
  saveApiKey,
  removeApiKey,
  hasApiKey,
  STORAGE_KEYS,
  saveWhisperApiKey,
  getWhisperApiKey,
  hasWhisperApiKey,
  getLocalEndpoint,
  setLocalEndpoint
};
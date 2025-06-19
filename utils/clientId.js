/**
 * Gets the client ID from storage or creates a new one if it doesn't exist
 * @returns {Promise<string>} Promise that resolves with the client ID
 */
async function getClientId() {
  try {
    // Try to get existing client ID from Chrome storage
    const result = await chrome.storage.local.get(['client_id']);
    
    if (result.client_id) {
      // Client ID exists, return it
      return result.client_id;
    } else {
      // No client ID found, create a new one using crypto.randomUUID()
      const newClientId = self.crypto.randomUUID();
      
      // Store the new client ID
      await chrome.storage.local.set({ client_id: newClientId });
      return newClientId;
    }
  } catch (error) {
    console.error('Failed to get/create client ID:', error);
    throw error;
  }
}

/**
 * Resets the client ID by removing it from storage and generating a new one
 * @returns {Promise<string>} Promise that resolves with the new client ID
 */
async function resetClientId() {
  try {
    // Remove existing client ID
    await chrome.storage.local.remove(['client_id']);
    
    // Generate and store new client ID
    const newClientId = self.crypto.randomUUID();
    await chrome.storage.local.set({ client_id: newClientId });
    
    return newClientId;
  } catch (error) {
    console.error('Failed to reset client ID:', error);
    throw error;
  }
}

export { getClientId, resetClientId }; 
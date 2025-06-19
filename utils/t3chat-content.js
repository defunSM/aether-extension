// Function to wait for an element to appear
function waitForElement(selector) {
  return new Promise((resolve) => {
    const checkElement = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }
      requestAnimationFrame(checkElement);
    };
    
    checkElement();
  });
}

// Main function to extract the response
async function extractT3ChatResponse() {
  try {
    // Wait for the assistant message to appear
    const messageElement = await waitForElement('div[aria-label="Assistant message"] p');
    
    // Get the response text
    const responseText = messageElement.textContent.trim();
    
    // Send the response back to the extension
    chrome.runtime.sendMessage({
      type: 'T3CHAT_RESPONSE',
      content: responseText
    });
  } catch (error) {
    console.error('Error extracting T3Chat response:', error);
    chrome.runtime.sendMessage({
      type: 'T3CHAT_RESPONSE',
      content: 'Error: ' + error.message
    });
  }
}

// Start the extraction process
extractT3ChatResponse(); 
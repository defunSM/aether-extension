// This is your content script that will run on web pages
// It checks if the API key is set in the Chrome storage and performs actions accordingly
// 

import { hasApiKey } from "./storage.js";

if (hasApiKey()) {
    console.log('API Key is set. Proceeding with content script actions...');
    // Your content script logic here
}
else {
    console.log('API Key is not set. Please set it in the options page.');
    // Optionally, you can redirect the user to the options page or show a message
    chrome.runtime.openOptionsPage();
}
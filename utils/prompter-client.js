
// groq-client.js
// This script is designed to be run in a browser environment, specifically for a Chrome extension popup.
import { queryGroqAPI } from './prompter.js'; // Ensure you have the correct import for your Groq client

document.addEventListener('DOMContentLoaded', () => {
    const submitBtn = document.getElementById('submitBtn');
    const userInput = document.getElementById('userPrompt');
    const responseOutput = document.getElementById('response');

    userInput.focus(); // Focus the input when popup loads
  
    submitBtn.addEventListener('click', async () => {
      const message = userInput.value;
      const systemPrompt = "Your task is to provide concise and accurate information on various topics. You should be informative, friendly, and professional in your responses. If there is any ambiguity in the user's request, ask clarifying questions to ensure you understand their needs. Avoid providing opinions or personal anecdotes. Your goal is to assist the user in finding the information they seek.";
      const llmResponse = await queryGroqAPI(systemPrompt, message); // Call the Groq API with the user's message
      responseOutput.innerHTML = llmResponse; // Display the response in the output are
      console.log(message)

    });
  
    // Auto-submit on Enter key
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') submitBtn.click();
    });
  });
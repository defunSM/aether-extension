// This script queries the Groq API using the Fetch API.
// It requires Node.js and the dotenv package to manage environment variables.
// Make sure to install dotenv using npm: npm install dotenv
// ensure you have a .env file with your API key in the same directory as this script.
// Example .env file content:
// GROQ_API_KEY=your_api_key_here

// Usage: node prompter.js
// This script is designed to be run in a Node.js environment.

import { decrypt } from './crypto.js';
import { getApiKey } from './storage.js';

export async function queryGroqAPI(systemPrompt, userMessage, model = "meta-llama/llama-4-scout-17b-16e-instruct") {
  const apiKey = await getApiKey() // Load the API key from storage
  console.log("API Key:", apiKey); // Debugging line to check the API key
  const url = "https://api.groq.com/openai/v1/chat/completions"; // Verify Groq's actual API URL

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  };

  console.log("API Key:", apiKey); // Debugging line to check the API key

  const payload = {
    model: model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ],
    temperature: 0.7,
    max_tokens: 1024
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

// Example Usage
// (async () => {
//   const systemPrompt = "Your task is to provide concise and accurate information on various topics. You should be informative, friendly, and professional in your responses. If there is any ambiguity in the user's request, ask clarifying questions to ensure you understand their needs. Avoid providing opinions or personal anecdotes. Your goal is to assist the user in finding the information they seek.";
//   const userMessage = "Explain Tesla's 3-6-9 theory briefly.";

//   const response = await queryGroqAPI(systemPrompt, userMessage);
//   console.log("AI Response:", response);
// })();
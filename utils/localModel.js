import { DEFAULT_SYSTEM_PROMPT } from './constants.js';

// Test local model connection
export const testLocalModelConnection = async (url, systemPrompt = DEFAULT_SYSTEM_PROMPT) => {
  try {

    const response = await fetch(`${url}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: 'test'
          }
        ],
        temperature: 0.7,
        max_tokens: 10,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error('Connection failed');
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Connection failed');
    }

    return response;
  } catch (error) {
    throw new Error('Connection failed');
  }
};

// Call local model API
export const callLocalModelApi = async ({ url, prompt, systemPrompt = DEFAULT_SYSTEM_PROMPT, temperature, maxTokens, stream = true }) => {
  if (!url) {
    throw new Error('No local endpoint URL provided');
  }

  // Ensure the URL is properly formatted
  const endpoint = url.endsWith('/v1/chat/completions') 
    ? url 
    : `${url.replace(/\/$/, '')}/v1/chat/completions`;

  const requestBody = {
    model: 'local-model',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature,
    max_tokens: maxTokens,
    stream
  };

  try {
    console.log('Making local API call to:', endpoint);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Local API Error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
    }

    if (stream) {
      return response.body;
    }

    return await response.json();
  } catch (error) {
    console.error('Local API call failed:', error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Failed to connect to local model. Please check if the local model server is running and the URL is correct.');
    }
    throw error;
  }
};

/**
 * Utility functions for interacting with various AI providers' APIs
 */
import { getApiKey } from './storage.js';

const API_ENDPOINTS = {
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  openai: 'https://api.openai.com/v1/chat/completions',
  t3chat: 'https://t3.chat/new'
};

const DEFAULT_MODELS = {
  groq: 'llama3-8b-8192',
  anthropic: 'claude-3-opus-20240229',
  openai: 'gpt-4-turbo-preview',
  t3chat: 'gemini-2.5-flash'
};

/**
 * Makes a call to a local model API
 * @param {Object} params - The parameters for the API call
 * @param {string} params.prompt - The user's message/prompt
 * @param {string} [params.model] - The model to use
 * @param {number} [params.temperature=0.7] - The temperature for generation
 * @param {number} [params.maxTokens=800] - Maximum tokens to generate
 * @param {string} [params.systemPrompt] - The system prompt to use
 * @param {boolean} [params.stream=false] - Whether to stream the response
 * @returns {Promise<Object|ReadableStream>} The API response or stream
 */
async function callLocalModelApi({
  prompt,
  model,
  temperature = 0.7,
  maxTokens = 800,
  systemPrompt = 'You are a helpful assistant. Format your responses in markdown.',
  stream = false
}) {
  const localEndpoint = await getLocalEndpoint();
  if (!localEndpoint) {
    throw new Error('No local endpoint configured. Please set the local endpoint in the extension settings.');
  }

  // Ensure the URL is properly formatted
  const endpoint = localEndpoint.endsWith('/v1/chat/completions') 
    ? localEndpoint 
    : `${localEndpoint.replace(/\/$/, '')}/v1/chat/completions`;

  const requestBody = {
    model: model || 'local-model',
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
}

/**
 * Gets the local endpoint from storage
 */
async function getLocalEndpoint() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['localEndpoint'], (result) => {
      resolve(result.localEndpoint || 'http://localhost:8000/v1/chat/completions');
    });
  });
}

/**
 * Makes a call to the specified AI provider's API
 * @param {Object} params - The parameters for the API call
 * @param {string} params.provider - The AI provider ('groq', 'anthropic', or 'openai')
 * @param {string} params.prompt - The user's message/prompt
 * @param {string} [params.model] - The model to use (defaults to provider's default)
 * @param {number} [params.temperature=0.7] - The temperature for generation
 * @param {number} [params.maxTokens=800] - Maximum tokens to generate
 * @param {string} [params.systemPrompt] - The system prompt to use
 * @param {boolean} [params.stream=false] - Whether to stream the response
 * @returns {Promise<Object|ReadableStream>} The API response or stream
 */
async function callApi({
  provider,
  prompt,
  model,
  temperature = 0.7,
  maxTokens = 800,
  systemPrompt = 'You are a helpful assistant. Format your responses in markdown.',
  stream = false
}) {
  if (provider === 'local') {
    return callLocalModelApi({
      prompt,
      model,
      temperature,
      maxTokens,
      systemPrompt,
      stream: false
    });
  }

  if (!API_ENDPOINTS[provider]) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  if (provider === 't3chat') {
    const modelParam = model || DEFAULT_MODELS.t3chat;
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `${API_ENDPOINTS.t3chat}?model=${modelParam}&q=${encodedPrompt}`;
    
    try {
      // Open T3Chat in a new tab
      const tab = await chrome.tabs.create({ url, active: false });
      
      // Wait for the response
      return new Promise((resolve, reject) => {
        // Listen for the response from the content script
        const messageListener = (message, sender) => {
          if (sender.tab?.id === tab.id && message.type === 'T3CHAT_RESPONSE') {
            // Clean up
            chrome.tabs.remove(tab.id);
            chrome.runtime.onMessage.removeListener(messageListener);
            
            resolve({
              response: message.content,
              provider: 't3chat'
            });
          }
        };
        
        // Add the message listener
        chrome.runtime.onMessage.addListener(messageListener);
        
        // Set a timeout
        setTimeout(() => {
          chrome.tabs.remove(tab.id);
          chrome.runtime.onMessage.removeListener(messageListener);
          reject(new Error('Timeout waiting for T3Chat response'));
        }, 10000); // 10 second timeout
      });
    } catch (error) {
      console.error('T3Chat API call failed:', error);
      throw error;
    }
  }

  const apiKey = await getApiKey(provider);
  if (!apiKey) {
    throw new Error(`No API key available for ${provider}. Please add your API key in the extension settings.`);
  }

  const requestBody = getRequestBody(provider, {
    prompt,
    model: model || DEFAULT_MODELS[provider],
    temperature,
    maxTokens,
    systemPrompt,
    stream
  });

  const headers = getHeaders(provider, apiKey);

  try {
    const response = await fetch(API_ENDPOINTS[provider], {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`${provider.toUpperCase()} API Error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
    }

    if (stream) {
      return response.body;
    }

    return await response.json();
  } catch (error) {
    console.error(`${provider.toUpperCase()} API call failed:`, error);
    throw error;
  }
}

/**
 * Gets the appropriate request body for the specified provider
 */
function getRequestBody(provider, params) {
  const { prompt, model, temperature, maxTokens, systemPrompt, stream } = params;

  switch (provider) {
    case 'groq':
    case 'openai':
      return {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: maxTokens,
        stream
      };
    case 'anthropic':
      return {
        model,
        messages: [
          { role: 'user', content: prompt }
        ],
        system: systemPrompt,
        temperature,
        max_tokens: maxTokens,
        stream
      };
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Gets the appropriate headers for the specified provider
 */
function getHeaders(provider, apiKey) {
  const headers = {
    'Content-Type': 'application/json'
  };

  switch (provider) {
    case 'groq':
    case 'openai':
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'anthropic':
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      break;
  }

  return headers;
}

async function processStream(stream, onChunk, onDone, onError) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        if (buffer) {
          try {
            const chunk = JSON.parse(buffer);
            if (chunk.choices?.[0]?.delta?.content) {
              onChunk(chunk.choices[0].delta.content);
            }
          } catch (e) {
            console.warn('Failed to parse final buffer:', e);
          }
        }
        onDone();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onDone();
            return;
          }
          try {
            const chunk = JSON.parse(data);
            if (chunk.choices?.[0]?.delta?.content) {
              onChunk(chunk.choices[0].delta.content);
            }
          } catch (e) {
            console.warn('Failed to parse chunk:', e);
          }
        }
      }
    }
  } catch (error) {
    onError(error);
  } finally {
    reader.releaseLock();
  }
}

function extractMarkdownResponse(apiResponse, provider) {
  try {
    if (!apiResponse) {
      return 'No response content available';
    }

    switch (provider) {
      case 'groq':
      case 'openai':
      case 'local':  // Local models follow OpenAI's response format
        return apiResponse.choices?.[0]?.message?.content || '';
      case 'anthropic':
        return apiResponse.content?.[0]?.text || '';
      case 't3chat':
        // T3Chat returns HTML content directly
        return apiResponse.response || '';
      default:
        return 'Unsupported provider response format';
    }
  } catch (error) {
    console.error('Failed to extract markdown response:', error);
    return 'Error extracting response';
  }
}

function getUsageStats(apiResponse, provider) {
  try {
    if (!apiResponse) {
      return null;
    }

    switch (provider) {
      case 'groq':
      case 'openai':
        return apiResponse.usage ? {
          promptTokens: apiResponse.usage.prompt_tokens,
          completionTokens: apiResponse.usage.completion_tokens,
          totalTokens: apiResponse.usage.total_tokens
        } : null;
      case 'anthropic':
        return apiResponse.usage ? {
          promptTokens: apiResponse.usage.input_tokens,
          completionTokens: apiResponse.usage.output_tokens,
          totalTokens: apiResponse.usage.input_tokens + apiResponse.usage.output_tokens
        } : null;
      case 't3chat':
        return null; // T3Chat doesn't provide usage stats
      default:
        return null;
    }
  } catch (error) {
    console.error('Failed to extract usage stats:', error);
    return null;
  }
}

export {
  callApi,
  callLocalModelApi,
  extractMarkdownResponse,
  getUsageStats,
  processStream
};
import { getWhisperApiKey } from './storage.js';

const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

/**
 * Transcribes audio using the Whisper API
 * @param {Blob} audioBlob - The audio data to transcribe
 * @returns {Promise<string>} The transcribed text
 */
async function transcribeAudio(audioBlob) {
  const apiKey = await getWhisperApiKey();
  
  if (!apiKey) {
    throw new Error('No Whisper API key available. Please add your API key in the extension settings.');
  }
  
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');
  
  try {
    const response = await fetch(WHISPER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Whisper API Error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
    }
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Whisper API call failed:', error);
    throw error;
  }
}

export { transcribeAudio }; 
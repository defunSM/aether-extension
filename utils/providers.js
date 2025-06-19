// Function to get provider from model
export const getProvider = (model) => {
  return model.startsWith('gpt') ? 'openai' :
         model.startsWith('claude') ? 'anthropic' :
         model.startsWith('gemini') ? 't3chat' :
         model.startsWith('llama') ? 'groq' : 'openai';
}; 
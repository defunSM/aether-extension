// Update key status indicator
export const updateKeyStatus = (element, hasKey) => {
  const icon = element.querySelector('.status-icon');
  icon.className = 'status-icon ' + (hasKey ? 'valid' : 'invalid');
  icon.innerHTML = hasKey 
    ? '<path d="M20 6L9 17l-5-5"/>'
    : '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>';
};

// Function to add copy buttons to code blocks
export const addCopyButtonsToCodeBlocks = () => {
  const codeBlocks = document.querySelectorAll('.empty-state pre');
  codeBlocks.forEach(block => {
    // Only add button if it doesn't already exist
    if (!block.querySelector('.copy-button')) {
      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button';
      copyButton.textContent = 'Copy';
      
      copyButton.addEventListener('click', async () => {
        const code = block.querySelector('code').textContent;
        await navigator.clipboard.writeText(code);
        
        // Visual feedback
        copyButton.textContent = 'Copied!';
        copyButton.classList.add('copied');
        
        setTimeout(() => {
          copyButton.textContent = 'Copy';
          copyButton.classList.remove('copied');
        }, 2000);
      });
      
      block.appendChild(copyButton);
    }
  });
}; 
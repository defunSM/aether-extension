/**
 * Utility functions for rendering markdown
 * Uses a simple markdown parser to convert markdown to HTML
 */

/**
 * Converts markdown text to HTML
 * @param {string} markdown - The markdown text to convert
 * @returns {string} The HTML representation of the markdown
 */
function markdownToHtml(markdown) {
  if (!markdown) return '';
  
  // Handle HTML special characters to prevent XSS
  const escapeHtml = (text) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Process code blocks with language specification
  let processedMarkdown = markdown.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
    const langClass = language ? `language-${language}` : 'language-none';
    // Escape HTML characters in code content to prevent markdown processing
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/#/g, '&#35;');
    return `<pre><code class="${langClass}">\n${escapedCode.trim()}</code></pre>`;
  });

  // Process inline code
  processedMarkdown = processedMarkdown.replace(/`([^`]+)`/g, '<code class="language-none">$1</code>');

  // Process headers
  processedMarkdown = processedMarkdown.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
  processedMarkdown = processedMarkdown.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  processedMarkdown = processedMarkdown.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  processedMarkdown = processedMarkdown.replace(/^# (.*$)/gm, '<h1>$1</h1>');

  // Process bold and italic
  processedMarkdown = processedMarkdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  processedMarkdown = processedMarkdown.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Process links
  processedMarkdown = processedMarkdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  // Process lists
  processedMarkdown = processedMarkdown.replace(/^\s*[-*+]\s+(.*$)/gm, '<li>$1</li>');
  processedMarkdown = processedMarkdown.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

  // Process blockquotes
  processedMarkdown = processedMarkdown.replace(/^\> (.*$)/gm, '<blockquote>$1</blockquote>');

  // Process horizontal rules
  processedMarkdown = processedMarkdown.replace(/^---$/gm, '<hr>');

  // Process paragraphs
  processedMarkdown = processedMarkdown.replace(/^(?!<[a-z])(.*$)/gm, '<p>$1</p>');

  // Remove empty paragraphs
  processedMarkdown = processedMarkdown.replace(/<p>\s*<\/p>/g, '');

  // Apply syntax highlighting using Prism.js
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = processedMarkdown;
  
  // Find all code blocks and apply Prism highlighting
  const codeBlocks = tempDiv.querySelectorAll('pre code');
  codeBlocks.forEach(block => {
    Prism.highlightElement(block);
  });

  return tempDiv.innerHTML;
}

/**
 * Applies syntax highlighting to code blocks in the rendered HTML
 * Note: This is now a no-op since we're using Prism directly
 */
function applySyntaxHighlighting() {
  if (window.Prism) {
    document.querySelectorAll('pre code').forEach((block) => {
      Prism.highlightElement(block);
    });
  }
}

export {
  markdownToHtml,
  applySyntaxHighlighting
};

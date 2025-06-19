// contentScript.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getPageContent") {
      // Helper to recursively collect text nodes, skipping header, footer, button
      function collectTextNodes(node, arr) {
        if (!node) return;
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent.trim();
          if (text) arr.push(text);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const tag = node.tagName.toLowerCase();
          if (tag === 'header' || tag === 'footer' || tag === 'button') return;
          for (const child of node.childNodes) {
            collectTextNodes(child, arr);
          }
        }
      }
      const textArr = [];
      collectTextNodes(document.body, textArr);
      const allText = textArr.join(' ');
      // Tokenize (simple whitespace split)
      const tokens = allText.split(/\s+/);
      const contextTokens = tokens.slice(0, 200);
      const context = contextTokens.join(' ');
      sendResponse({ content: context });
    }
  });
// utils/pageContext.js

// Function to determine if a tab is scrapable
function isScrapableTab(tab) {
  const url = tab.url || "";
  // Only http(s)
  if (!url.startsWith("http://") && !url.startsWith("https://")) return false;
  // Blocklist
  const blocklist = ["docs.google.com", "mail.google.com", "bank", "paypal", "youtube"];
  if (blocklist.some(domain => url.includes(domain))) return false;
  // No login/auth pages
  if (/login|auth|signup/.test(url)) return false;
  // No PDFs or images
  if (/\.(pdf|jpg|jpeg|png|gif)$/i.test(url)) return false;
  return true;
}

// Function to get the content of the current tab
function getCurrentTabContent() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) {
        resolve(""); // No active tab
        return;
      }
      const url = tabs[0].url || "";
      // Only allow http(s) pages
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        resolve("");
        return;
      }
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "getPageContent" },
        (response) => {
          resolve(response?.content || "");
        }
      );
    });
  });
}

export { getCurrentTabContent, isScrapableTab }; 
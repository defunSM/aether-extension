// Initialize tab switching functionality
export const initializeTabs = () => {
  const tabTriggers = document.querySelectorAll(".tab-trigger");
  const tabContents = document.querySelectorAll(".tab-content");

  tabTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      // Remove active class from all triggers and contents
      tabTriggers.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      // Add active class to clicked trigger and corresponding content
      trigger.classList.add("active");
      const tabId = trigger.getAttribute("data-tab");
      document.getElementById(`${tabId}-tab`).classList.add("active");
    });
  });
}; 
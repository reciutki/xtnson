document.addEventListener("DOMContentLoaded", () => {
  const languageSelect = document.getElementById("language");
  const saveButton = document.getElementById("save");
  const parfumoSearchCheckbox = document.getElementById("parfumoSearch");
  const status = document.getElementById("status");

  // Set static English labels
  document.getElementById("settings-title").textContent = "Settings";
  document.getElementById("language-label").textContent = "Select your language:";
  document.getElementById("parfumo-label").textContent = "Enable Parfumo Search:";
  saveButton.textContent = "Save";

  // Load saved language URL and Parfumo search preference
  chrome.storage.sync.get(["fragranticaLanguageUrl", "useParfumoSearch"], ({ fragranticaLanguageUrl, useParfumoSearch }) => {
    const savedLangUrl = fragranticaLanguageUrl || "https://www.fragrantica.com"; // Default to English
    languageSelect.value = savedLangUrl;
    parfumoSearchCheckbox.checked = useParfumoSearch || false; // Default to false
  });

  // Save settings when save button is clicked
  saveButton.addEventListener("click", () => {
    const selectedUrl = languageSelect.value;
    const parfumoEnabled = parfumoSearchCheckbox.checked;

    // Save selected URL and Parfumo search setting
    chrome.storage.sync.set(
      { fragranticaLanguageUrl: selectedUrl, useParfumoSearch: parfumoEnabled },
      () => {
        status.textContent = "Settings saved!";
        setTimeout(() => (status.textContent = ""), 2000);
      }
    );
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const languageSelect = document.getElementById("language");
  const saveButton = document.getElementById("save");
  const parfumoSearchCheckbox = document.getElementById("parfumoSearch");
  const perfumehubSearchCheckbox = document.getElementById("perfumehubSearch");
  const status = document.getElementById("status");

  // Set static English labels
  document.getElementById("settings-title").textContent = "Settings";
  document.getElementById("language-label").textContent = "Select your Fragrantica language:";
  document.getElementById("parfumo-label").textContent = "Enable Parfumo Search:";
  document.getElementById("perfumehub-label").textContent = "Enable PerfumeHub Search:";
  saveButton.textContent = "Save";

  // Load saved settings
  chrome.storage.sync.get(
    ["fragranticaLanguageUrl", "useParfumoSearch", "usePerfumeHubSearch"],
    ({ fragranticaLanguageUrl, useParfumoSearch, usePerfumeHubSearch }) => {
      const savedLangUrl = fragranticaLanguageUrl || "https://www.fragrantica.com"; // Default to English
      languageSelect.value = savedLangUrl;
      parfumoSearchCheckbox.checked = useParfumoSearch || false; // Default to false
      perfumehubSearchCheckbox.checked = usePerfumeHubSearch || false; // Default to false
    }
  );

  // Save settings when save button is clicked
  saveButton.addEventListener("click", () => {
    const selectedUrl = languageSelect.value;
    const parfumoEnabled = parfumoSearchCheckbox.checked;
    const perfumehubEnabled = perfumehubSearchCheckbox.checked;

    // Save selected settings
    chrome.storage.sync.set(
      {
        fragranticaLanguageUrl: selectedUrl,
        useParfumoSearch: parfumoEnabled,
        usePerfumeHubSearch: perfumehubEnabled,
      },
      () => {
        status.textContent = "Settings saved!";
        setTimeout(() => (status.textContent = ""), 2000);
      }
    );
  });
});
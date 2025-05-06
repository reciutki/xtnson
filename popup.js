document.addEventListener("DOMContentLoaded", () => {
  // Form elements
  const languageSelect = document.getElementById("language");
  const parfumoCheckbox = document.getElementById("parfumoSearch");
  const perfumehubCheckbox = document.getElementById("perfumehubSearch");
  const focusNewTabCheckbox = document.getElementById("focusNewTab");
  const groupColorSelect = document.getElementById("groupColor");
  const groupCollapsedCheckbox = document.getElementById("groupCollapsed");
  const saveButton = document.getElementById("save-button");
  const status = document.getElementById("status");

  // Load saved settings
  chrome.storage.sync.get([
    "fragranticaLanguageUrl",
    "useParfumoSearch",
    "usePerfumeHubSearch",
    "focusNewTab",
    "groupColor",
    "groupCollapsed"
  ], (settings) => {
    languageSelect.value = settings.fragranticaLanguageUrl || "https://www.fragrantica.com";
    parfumoCheckbox.checked = Boolean(settings.useParfumoSearch);
    perfumehubCheckbox.checked = Boolean(settings.usePerfumeHubSearch);
    focusNewTabCheckbox.checked = settings.focusNewTab !== false; // Default true
    groupColorSelect.value = settings.groupColor || "blue";
    groupCollapsedCheckbox.checked = Boolean(settings.groupCollapsed);
  });

  // Save settings
  saveButton.addEventListener("click", () => {
    const settings = {
      fragranticaLanguageUrl: languageSelect.value,
      useParfumoSearch: parfumoCheckbox.checked,
      usePerfumeHubSearch: perfumehubCheckbox.checked,
      focusNewTab: focusNewTabCheckbox.checked,
      groupColor: groupColorSelect.value,
      groupCollapsed: groupCollapsedCheckbox.checked
    };

    chrome.storage.sync.set(settings, () => {
      status.textContent = "Settings saved!";
      setTimeout(() => status.textContent = "", 2000);
    });
  });
}); 
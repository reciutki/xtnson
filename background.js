const searchPaths = {
  "https://www.fragrantica.com": "search",
  "https://www.fragrantica.de": "Suche",
  "https://www.fragrantica.es": "buscar",
  "https://www.fragrantica.pl": "szukaj",
  "https://www.fragrantica.com.br": "busca",
  "https://www.fragrantica.nl": "zoeken",
  "https://www.punmiris.com": "parfemi",
  "https://www.fragrantica.ro": "cautare",
};

chrome.runtime.onInstalled.addListener(() => {
  // Set default settings on installation
  chrome.storage.sync.set({
    fragranticaLanguageUrl: "https://www.fragrantica.com",
    useParfumoSearch: false,
    usePerfumeHubSearch: false, // Add new setting for PerfumeHub
  });

  // Initialize the context menu
  updateContextMenu();
});

// Function to update the context menu dynamically
function updateContextMenu() {
  // Clear existing context menus
  chrome.contextMenus.removeAll(() => {
    chrome.storage.sync.get(["useParfumoSearch", "usePerfumeHubSearch"], ({ useParfumoSearch, usePerfumeHubSearch }) => {
      let title = "Search on Fragrantica";
      if (useParfumoSearch && usePerfumeHubSearch) {
        title = "Search on Fragrantica + Parfumo + PerfumeHub";
      } else if (useParfumoSearch) {
        title = "Search on Fragrantica + Parfumo";
      } else if (usePerfumeHubSearch) {
        title = "Search on Fragrantica + PerfumeHub";
      }

      // Create the context menu
      chrome.contextMenus.create({
        id: "searchFragrantica",
        title,
        contexts: ["selection"],
      });
    });
  });
}

// Listen for changes to the settings and update the context menu
chrome.storage.onChanged.addListener((changes) => {
  if (changes.useParfumoSearch || changes.fragranticaLanguageUrl || changes.usePerfumeHubSearch) {
    updateContextMenu();
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "searchFragrantica" && info.selectionText) {
    const fragranceName = encodeURIComponent(info.selectionText.trim());

    // Perform Fragrantica search
    chrome.storage.sync.get("fragranticaLanguageUrl", ({ fragranticaLanguageUrl }) => {
      const domain = fragranticaLanguageUrl || "https://www.fragrantica.com"; // Default to English
      const searchPath = searchPaths[domain] || "search"; // Default search path
      const url = `${domain}/${searchPath}/?query=${fragranceName}`;
      chrome.tabs.create({ url });
    });

    // Perform Parfumo search if enabled
    chrome.storage.sync.get("useParfumoSearch", ({ useParfumoSearch }) => {
      if (useParfumoSearch) {
        const parfumoUrl = `https://www.parfumo.com/s_perfumes_x.php?in=1&filter=${fragranceName}`;
        chrome.tabs.create({ url: parfumoUrl });
      }
    });

    // Perform PerfumeHub search if enabled
    chrome.storage.sync.get("usePerfumeHubSearch", ({ usePerfumeHubSearch }) => {
      if (usePerfumeHubSearch) {
        const perfumeHubUrl = `https://perfumehub.pl/search?q=${fragranceName}`;
        chrome.tabs.create({ url: perfumeHubUrl });
      }
    });
  }
});